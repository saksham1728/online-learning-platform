import { NextResponse } from "next/server";
import { db } from "../../../../config/db";
import { sharedCodesTable } from "../../../../config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, desc } from "drizzle-orm";

// Utility function for safe JSON parsing
function safeJsonParse(jsonString, fallback = null) {
  try {
    return JSON.parse(jsonString || 'null') || fallback;
  } catch {
    return fallback;
  }
}

export async function GET(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    
    // Get user's shared codes
    const sharedCodes = await db.select({
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
      createdAt: sharedCodesTable.createdAt,
      updatedAt: sharedCodesTable.updatedAt
    })
    .from(sharedCodesTable)
    .where(eq(sharedCodesTable.userId, userEmail))
    .orderBy(desc(sharedCodesTable.createdAt));

    // Format the response data with safe JSON parsing
    const formattedCodes = sharedCodes.map(code => ({
      ...code,
      tags: safeJsonParse(code.tags, []),
      shareUrl: `/share/${code.shareId}`
    }));

    return NextResponse.json({
      success: true,
      sharedCodes: formattedCodes,
      total: formattedCodes.length
    });

  } catch (error) {
    console.error('Get shared codes error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to load shared codes'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const shareId = searchParams.get('shareId');

    if (!shareId) {
      return NextResponse.json(
        { error: 'Share ID is required' },
        { status: 400 }
      );
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;

    // Delete the shared code (only if it belongs to the user)
    const result = await db.delete(sharedCodesTable)
      .where(
        eq(sharedCodesTable.shareId, shareId) && 
        eq(sharedCodesTable.userId, userEmail)
      )
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Shared code not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Shared code deleted successfully'
    });

  } catch (error) {
    console.error('Delete shared code error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}