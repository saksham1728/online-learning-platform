import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from '../../../../../config/db.js';
import { sharedCodesTable } from '../../../../../config/schema.js';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// GET - Get specific shared code (for editing)
export async function GET(req, { params }) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const userEmail = user.primaryEmailAddress?.emailAddress;
    if (!userEmail) {
      return NextResponse.json({ success: false, error: 'User email not found' }, { status: 400 });
    }

    const { shareId } = await params;
    const share = await db.select()
      .from(sharedCodesTable)
      .where(and(
        eq(sharedCodesTable.shareId, shareId),
        eq(sharedCodesTable.userId, userEmail)
      ))
      .limit(1);

    if (!share || share.length === 0) {
      return NextResponse.json({ success: false, error: 'Shared code not found' }, { status: 404 });
    }

    // Safe parse tags
    let tags = [];
    try {
      tags = JSON.parse(share[0].tags || '[]');
    } catch {
      console.warn(`Invalid tags JSON for share ${shareId}, defaulting to empty array.`);
    }

    const shareData = {
      ...share[0],
      tags,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/share/${shareId}`,
      isExpired: share[0].expiresAt ? new Date(share[0].expiresAt) < new Date() : false
    };

    // Remove sensitive
    delete shareData.passwordHash;

    return NextResponse.json({ success: true, share: shareData });

  } catch (error) {
    console.error('Get share error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update shared code
export async function PUT(req, { params }) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const userEmail = user.primaryEmailAddress?.emailAddress;
    if (!userEmail) {
      return NextResponse.json({ success: false, error: 'User email not found' }, { status: 400 });
    }

    const { shareId } = await params;
    const existing = await db.select()
      .from(sharedCodesTable)
      .where(and(
        eq(sharedCodesTable.shareId, shareId),
        eq(sharedCodesTable.userId, userEmail)
      ))
      .limit(1);

    if (!existing || existing.length === 0) {
      return NextResponse.json({ success: false, error: 'Shared code not found' }, { status: 404 });
    }

    const body = await req.json();
    const {
      title,
      description,
      code,
      language,
      category,
      tags,
      isPublic,
      expiresAt,
      allowComments,
      allowForking,
      password,
      removePassword
    } = body;

    // Validate lengths
    if (title && title.length > 200) {
      return NextResponse.json({ success: false, error: 'Title must be less than 200 characters' }, { status: 400 });
    }
    if (description && description.length > 1000) {
      return NextResponse.json({ success: false, error: 'Description must be less than 1000 characters' }, { status: 400 });
    }
    if (code && code.length > 100000) {
      return NextResponse.json({ success: false, error: 'Code content too large (max 100KB)' }, { status: 400 });
    }

    const updateData = { updatedAt: new Date().toISOString() };
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim() || null;
    if (code !== undefined) updateData.code = code;
    if (language !== undefined) updateData.language = language.toLowerCase();
    if (category !== undefined) updateData.category = category || 'general';
    if (tags !== undefined) updateData.tags = JSON.stringify(tags || []);
    if (isPublic !== undefined) updateData.isPublic = Boolean(isPublic);
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt;
    if (allowComments !== undefined) updateData.allowComments = Boolean(allowComments);
    if (allowForking !== undefined) updateData.allowForking = Boolean(allowForking);

    if (removePassword) {
      updateData.isPasswordProtected = false;
      updateData.passwordHash = null;
    } else if (password) {
      updateData.isPasswordProtected = true;
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }

    const result = await db.update(sharedCodesTable)
      .set(updateData)
      .where(and(
        eq(sharedCodesTable.shareId, shareId),
        eq(sharedCodesTable.userId, userEmail)
      ))
      .returning();

    if (!result || result.length === 0) {
      return NextResponse.json({ success: false, error: 'Failed to update shared code' }, { status: 500 });
    }

    console.log(`Code updated successfully: ${shareId} by ${userEmail}`);
    return NextResponse.json({ success: true, message: 'Shared code updated successfully' });

  } catch (error) {
    console.error('Update share error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete shared code
export async function DELETE(req, { params }) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const userEmail = user.primaryEmailAddress?.emailAddress;
    if (!userEmail) {
      return NextResponse.json({ success: false, error: 'User email not found' }, { status: 400 });
    }

    const { shareId } = await params;
    const result = await db.delete(sharedCodesTable)
      .where(and(
        eq(sharedCodesTable.shareId, shareId),
        eq(sharedCodesTable.userId, userEmail)
      ))
      .returning();

    if (!result || result.length === 0) {
      return NextResponse.json({ success: false, error: 'Shared code not found' }, { status: 404 });
    }

    console.log(`Code deleted successfully: ${shareId} by ${userEmail}`);
    return NextResponse.json({ success: true, message: 'Shared code deleted successfully' });

  } catch (error) {
    console.error('Delete share error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
