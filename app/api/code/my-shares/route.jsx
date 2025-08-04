import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from '../../../../config/db.jsx';
import { sharedCodesTable } from '../../../../config/schema.js';
import { eq, desc, and, like, gte, lte } from 'drizzle-orm';

export async function GET(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.primaryEmailAddress?.emailAddress;
    const { searchParams } = new URL(req.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Filter parameters
    const search = searchParams.get('search');
    const language = searchParams.get('language');
    const category = searchParams.get('category');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Build query conditions
    let conditions = [eq(sharedCodesTable.userId, userEmail)];

    if (search) {
      conditions.push(
        like(sharedCodesTable.title, `%${search}%`)
      );
    }

    if (language) {
      conditions.push(eq(sharedCodesTable.language, language));
    }

    if (category) {
      conditions.push(eq(sharedCodesTable.category, category));
    }

    if (dateFrom) {
      conditions.push(gte(sharedCodesTable.createdAt, dateFrom));
    }

    if (dateTo) {
      conditions.push(lte(sharedCodesTable.createdAt, dateTo));
    }

    // Get total count for pagination
    const totalResult = await db.select({ count: sharedCodesTable.id })
      .from(sharedCodesTable)
      .where(and(...conditions));

    // Get paginated results
    const shares = await db.select({
      id: sharedCodesTable.id,
      shareId: sharedCodesTable.shareId,
      title: sharedCodesTable.title,
      description: sharedCodesTable.description,
      language: sharedCodesTable.language,
      category: sharedCodesTable.category,
      tags: sharedCodesTable.tags,
      isPublic: sharedCodesTable.isPublic,
      isPasswordProtected: sharedCodesTable.isPasswordProtected,
      expiresAt: sharedCodesTable.expiresAt,
      allowComments: sharedCodesTable.allowComments,
      allowForking: sharedCodesTable.allowForking,
      viewCount: sharedCodesTable.viewCount,
      createdAt: sharedCodesTable.createdAt,
      updatedAt: sharedCodesTable.updatedAt,
      lastViewedAt: sharedCodesTable.lastViewedAt
    })
    .from(sharedCodesTable)
    .where(and(...conditions))
    .orderBy(desc(sharedCodesTable.createdAt))
    .limit(limit)
    .offset(offset);

    // Parse tags and add share URLs
    const processedShares = shares.map(share => ({
      ...share,
      tags: JSON.parse(share.tags || '[]'),
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/share/${share.shareId}`,
      isExpired: share.expiresAt ? new Date(share.expiresAt) < new Date() : false
    }));

    const totalCount = totalResult.length;
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      shares: processedShares,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get my shares error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}