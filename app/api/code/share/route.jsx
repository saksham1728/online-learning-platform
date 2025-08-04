import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from '../../../../config/db.jsx';
import { sharedCodesTable } from '../../../../config/schema.js';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      title, 
      description, 
      code, 
      language, 
      category = 'General',
      tags = [],
      isPublic = true,
      expiresAt = null,
      allowComments = true,
      allowForking = true,
      password = null
    } = body;

    // Validate required fields
    if (!title || !code || !language) {
      return NextResponse.json({ 
        error: 'Title, code, and language are required' 
      }, { status: 400 });
    }

    // Validate code length (max 100KB)
    if (code.length > 100000) {
      return NextResponse.json({ 
        error: 'Code is too large. Maximum size is 100KB' 
      }, { status: 400 });
    }

    const userEmail = user.primaryEmailAddress?.emailAddress;
    const shareId = randomUUID();
    
    // Hash password if provided
    let passwordHash = null;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    // Prepare share data
    const shareData = {
      shareId,
      userId: userEmail,
      title: title.trim(),
      description: description?.trim() || '',
      code: code.trim(),
      language: language.toLowerCase(),
      category,
      tags: JSON.stringify(tags),
      isPublic,
      isPasswordProtected: !!password,
      passwordHash,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      allowComments,
      allowForking,
      viewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastViewedAt: null
    };

    console.log('Creating shared code:', { shareId, title, language, userEmail });

    // Insert into database
    const result = await db.insert(sharedCodesTable).values(shareData).returning();

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Failed to create shared code' }, { status: 500 });
    }

    // Generate share URL
    const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/share/${shareId}`;

    console.log('Shared code created successfully:', shareId);

    return NextResponse.json({
      success: true,
      shareId,
      shareUrl,
      message: 'Code shared successfully!'
    });

  } catch (error) {
    console.error('Share code error:', error);
    return NextResponse.json(
      { error: 'Failed to share code', details: error.message },
      { status: 500 }
    );
  }
}