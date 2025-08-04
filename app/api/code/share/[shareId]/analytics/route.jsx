import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from '../../../../../../config/db.jsx';
import { sharedCodesTable, shareAnalyticsTable } from '../../../../../../config/schema.js';
import { eq, and, desc, gte, count } from 'drizzle-orm';

export async function GET(req, { params }) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.primaryEmailAddress?.emailAddress;
    const { shareId } = params;
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30');

    // Verify ownership
    const share = await db.select()
      .from(sharedCodesTable)
      .where(and(
        eq(sharedCodesTable.shareId, shareId),
        eq(sharedCodesTable.userId, userEmail)
      ))
      .limit(1);

    if (!share || share.length === 0) {
      return NextResponse.json({ error: 'Shared code not found' }, { status: 404 });
    }

    const shareData = share[0];

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get analytics data
    const analytics = await db.select({
      id: shareAnalyticsTable.id,
      viewedAt: shareAnalyticsTable.viewedAt,
      country: shareAnalyticsTable.country,
      referrer: shareAnalyticsTable.referrer,
      userAgent: shareAnalyticsTable.userAgent
    })
    .from(shareAnalyticsTable)
    .where(and(
      eq(shareAnalyticsTable.shareId, shareId),
      gte(shareAnalyticsTable.viewedAt, startDate.toISOString())
    ))
    .orderBy(desc(shareAnalyticsTable.viewedAt))
    .limit(1000); // Limit to prevent large responses

    // Get total view count
    const totalViews = shareData.viewCount;

    // Process analytics data
    const viewsByDate = {};
    const viewsByCountry = {};
    const viewsByReferrer = {};
    const recentViews = [];

    analytics.forEach(view => {
      const date = new Date(view.viewedAt).toISOString().split('T')[0];
      
      // Views by date
      viewsByDate[date] = (viewsByDate[date] || 0) + 1;
      
      // Views by country
      if (view.country) {
        viewsByCountry[view.country] = (viewsByCountry[view.country] || 0) + 1;
      }
      
      // Views by referrer
      if (view.referrer) {
        const domain = extractDomain(view.referrer);
        viewsByReferrer[domain] = (viewsByReferrer[domain] || 0) + 1;
      }
      
      // Recent views (last 10)
      if (recentViews.length < 10) {
        recentViews.push({
          viewedAt: view.viewedAt,
          country: view.country,
          referrer: view.referrer ? extractDomain(view.referrer) : 'Direct'
        });
      }
    });

    // Fill missing dates with 0 views
    const dateRange = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dateRange.push({
        date: dateStr,
        views: viewsByDate[dateStr] || 0
      });
    }

    // Convert objects to arrays for easier frontend consumption
    const topCountries = Object.entries(viewsByCountry)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([country, views]) => ({ country, views }));

    const topReferrers = Object.entries(viewsByReferrer)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([referrer, views]) => ({ referrer, views }));

    // Calculate summary statistics
    const viewsInPeriod = analytics.length;
    const uniqueCountries = Object.keys(viewsByCountry).length;
    const uniqueReferrers = Object.keys(viewsByReferrer).length;

    const summary = {
      totalViews,
      viewsInPeriod,
      uniqueCountries,
      uniqueReferrers,
      averageViewsPerDay: Math.round(viewsInPeriod / days * 10) / 10,
      createdAt: shareData.createdAt,
      lastViewedAt: shareData.lastViewedAt
    };

    return NextResponse.json({
      success: true,
      analytics: {
        summary,
        viewsByDate: dateRange,
        topCountries,
        topReferrers,
        recentViews
      }
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Helper function to extract domain from URL
function extractDomain(url) {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return 'Unknown';
  }
}