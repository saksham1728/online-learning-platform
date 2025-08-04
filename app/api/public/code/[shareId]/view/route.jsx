import { NextResponse } from "next/server";
import { db } from '../../../../../../config/db.jsx';
import { shareAnalyticsTable } from '../../../../../../config/schema.js';
import { headers } from 'next/headers';

export async function POST(req, { params }) {
  try {
    const { shareId } =await params;
    
    // This endpoint is called when someone views a shared code
    // We already track views in the main GET endpoint, but this can be used
    // for additional tracking or real-time analytics
    
    const headersList =await headers();
    const userAgent = headersList.get('user-agent') || '';
    const forwarded = headersList.get('x-forwarded-for');
    const realIP = headersList.get('x-real-ip');
    const clientIP = forwarded?.split(',')[0] || realIP || 'unknown';
    
    // Hash IP for privacy
    const crypto = require('crypto');
    const hashedIP = crypto.createHash('sha256').update(clientIP).digest('hex').substring(0, 16);

    // Optional: Add additional tracking data
    const body = await req.json().catch(() => ({}));
    const { sessionDuration, referrer } = body;

    await db.insert(shareAnalyticsTable).values({
      shareId,
      viewerIP: hashedIP,
      userAgent: userAgent.substring(0, 500),
      referrer: referrer || headersList.get('referer') || null,
      country: null, // Could integrate with IP geolocation service
      viewedAt: new Date().toISOString(),
      sessionDuration: sessionDuration || null
    });

    return NextResponse.json({
      success: true,
      message: 'View tracked successfully'
    });

  } catch (error) {
    console.error('Track view error:', error);
    // Don't return error to prevent breaking the viewing experience
    return NextResponse.json({
      success: false,
      message: 'Failed to track view'
    });
  }
}