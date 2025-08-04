import { NextResponse } from "next/server";
import { db } from '../../../../../config/db.jsx';
import { sharedCodesTable } from '../../../../../config/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// Utility function for safe JSON parsing
function safeJsonParse(jsonString, fallback = null) {
  try {
    return JSON.parse(jsonString || 'null') || fallback;
  } catch {
    return fallback;
  }
}

// GET - Get shared code for public viewing
export async function GET(req, { params }) {
  try {
    const { shareId } = await params;
    const { searchParams } = new URL(req.url);
    const password = searchParams.get('password');

    // Get the shared code
    const share = await db.select({
      id: sharedCodesTable.id,
      shareId: sharedCodesTable.shareId,
      title: sharedCodesTable.title,
      description: sharedCodesTable.description,
      code: sharedCodesTable.code,
      language: sharedCodesTable.language,
      category: sharedCodesTable.category,
      tags: sharedCodesTable.tags,
      isPublic: sharedCodesTable.isPublic,
      isPasswordProtected: sharedCodesTable.isPasswordProtected,
      passwordHash: sharedCodesTable.passwordHash,
      expiresAt: sharedCodesTable.expiresAt,
      allowComments: sharedCodesTable.allowComments,
      allowForking: sharedCodesTable.allowForking,
      viewCount: sharedCodesTable.viewCount,
      createdAt: sharedCodesTable.createdAt,
      lastViewedAt: sharedCodesTable.lastViewedAt
    })
    .from(sharedCodesTable)
    .where(eq(sharedCodesTable.shareId, shareId))
    .limit(1);

    if (!share || share.length === 0) {
      return NextResponse.json({ 
        error: 'Code not found', 
        message: 'This shared code does not exist or has been removed.' 
      }, { status: 404 });
    }

    const shareData = share[0];

    // Check if expired
    if (shareData.expiresAt && new Date(shareData.expiresAt) < new Date()) {
      return NextResponse.json({ 
        error: 'Code expired', 
        message: 'This shared code has expired and is no longer available.' 
      }, { status: 410 });
    }

    // Check if password protected
    if (shareData.isPasswordProtected) {
      if (!password) {
        return NextResponse.json({ 
          error: 'Password required', 
          message: 'This shared code is password protected.',
          requiresPassword: true 
        }, { status: 401 });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, shareData.passwordHash);
      if (!isValidPassword) {
        return NextResponse.json({ 
          error: 'Invalid password', 
          message: 'The password you entered is incorrect.',
          requiresPassword: true 
        }, { status: 401 });
      }
    }

    // Use safe JSON parsing for tags
    const tags = safeJsonParse(shareData.tags, []);

    // Prepare response data (remove sensitive fields)
    const responseData = {
      shareId: shareData.shareId,
      title: shareData.title,
      description: shareData.description,
      code: shareData.code,
      language: shareData.language,
      category: shareData.category,
      tags,
      allowComments: shareData.allowComments,
      allowForking: shareData.allowForking,
      createdAt: shareData.createdAt
    };

    return NextResponse.json({
      success: true,
      code: responseData
    });

  } catch (error) {
    console.error('Get public code error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Something went wrong while loading the code.' },
      { status: 500 }
    );
  }
}

// POST - Verify password for protected code
export async function POST(req, { params }) {
  try {
    const { shareId } = await params;
    const body = await req.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    // Get the shared code
    const share = await db.select({
      isPasswordProtected: sharedCodesTable.isPasswordProtected,
      passwordHash: sharedCodesTable.passwordHash,
      expiresAt: sharedCodesTable.expiresAt
    })
    .from(sharedCodesTable)
    .where(eq(sharedCodesTable.shareId, shareId))
    .limit(1);

    if (!share || share.length === 0) {
      return NextResponse.json({ error: 'Code not found' }, { status: 404 });
    }

    const shareData = share[0];

    // Check if expired
    if (shareData.expiresAt && new Date(shareData.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Code expired' }, { status: 410 });
    }

    // Verify password
    if (!shareData.isPasswordProtected) {
      return NextResponse.json({ error: 'Code is not password protected' }, { status: 400 });
    }

    const isValidPassword = await bcrypt.compare(password, shareData.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      message: 'Password verified successfully'
    });

  } catch (error) {
    console.error('Verify password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

