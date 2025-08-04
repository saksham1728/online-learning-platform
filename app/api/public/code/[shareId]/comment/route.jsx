import { NextResponse } from "next/server";
import { db } from "../../../../../../config/db";
import { shareCommentsTable, sharedCodesTable } from "../../../../../../config/schema";
import { eq, and, desc } from "drizzle-orm";

// GET - Get comments for a shared code
export async function GET(req, { params }) {
  try {
    const { shareId } = await params;

    // Check if the shared code exists and allows comments
    const share = await db.select({
      allowComments: sharedCodesTable.allowComments
    })
    .from(sharedCodesTable)
    .where(eq(sharedCodesTable.shareId, shareId))
    .limit(1);

    if (!share || share.length === 0) {
      return NextResponse.json({ 
        error: 'Code not found' 
      }, { status: 404 });
    }

    if (!share[0].allowComments) {
      return NextResponse.json({ 
        error: 'Comments are disabled for this code' 
      }, { status: 403 });
    }

    // Get approved comments
    const comments = await db.select({
      id: shareCommentsTable.id,
      commenterName: shareCommentsTable.commenterName,
      comment: shareCommentsTable.comment,
      createdAt: shareCommentsTable.createdAt,
      approvedAt: shareCommentsTable.approvedAt
    })
    .from(shareCommentsTable)
    .where(
      and(
        eq(shareCommentsTable.shareId, shareId),
        eq(shareCommentsTable.isApproved, true)
      )
    )
    .orderBy(desc(shareCommentsTable.createdAt));

    return NextResponse.json({
      success: true,
      comments: comments
    });

  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Submit a new comment
export async function POST(req, { params }) {
  try {
    const { shareId } = await params;
    const body = await req.json();
    const { commenterName, commenterEmail, comment } = body;

    // Validate required fields
    if (!commenterName?.trim() || !comment?.trim()) {
      return NextResponse.json(
        { error: 'Name and comment are required' },
        { status: 400 }
      );
    }

    if (comment.length > 1000) {
      return NextResponse.json(
        { error: 'Comment must be less than 1000 characters' },
        { status: 400 }
      );
    }

    // Check if the shared code exists and allows comments
    const share = await db.select({
      allowComments: sharedCodesTable.allowComments
    })
    .from(sharedCodesTable)
    .where(eq(sharedCodesTable.shareId, shareId))
    .limit(1);

    if (!share || share.length === 0) {
      return NextResponse.json({ 
        error: 'Code not found' 
      }, { status: 404 });
    }

    if (!share[0].allowComments) {
      return NextResponse.json({ 
        error: 'Comments are disabled for this code' 
      }, { status: 403 });
    }

    // Insert the comment (pending approval)
    const result = await db.insert(shareCommentsTable).values({
      shareId,
      commenterName: commenterName.trim(),
      commenterEmail: commenterEmail?.trim() || null,
      comment: comment.trim(),
      isApproved: false, // Comments need approval
      createdAt: new Date().toISOString()
    }).returning();

    return NextResponse.json({
      success: true,
      message: 'Comment submitted successfully! It will be visible after approval.',
      commentId: result[0].id
    });

  } catch (error) {
    console.error('Submit comment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}