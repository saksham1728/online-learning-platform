import { NextResponse } from "next/server";
import { db } from "../../../config/db";
import { branchProgressTable } from "../../../config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";

export async function GET(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const branchCode = searchParams.get('branchCode');
    const subjectCode = searchParams.get('subjectCode');

    const userEmail = user.primaryEmailAddress?.emailAddress;
    let query = db.select().from(branchProgressTable)
      .where(eq(branchProgressTable.userEmail, userEmail));

    if (branchCode) {
      query = query.where(eq(branchProgressTable.branchCode, branchCode));
    }
    if (subjectCode) {
      query = query.where(eq(branchProgressTable.subjectCode, subjectCode));
    }

    const progress = await query;

    return NextResponse.json({
      success: true,
      progress: progress
    });
  } catch (error) {
    console.error('Get branch progress error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      branchCode,
      subjectCode,
      activityType,
      progressData,
      completionPercentage
    } = body;

    const userEmail = user.primaryEmailAddress?.emailAddress;

    // Validate required fields
    if (!branchCode || !subjectCode || !activityType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if progress record exists
    const existingProgress = await db.select().from(branchProgressTable)
      .where(and(
        eq(branchProgressTable.userEmail, userEmail),
        eq(branchProgressTable.branchCode, branchCode),
        eq(branchProgressTable.subjectCode, subjectCode),
        eq(branchProgressTable.activityType, activityType)
      ));

    if (existingProgress.length > 0) {
      // Update existing progress
      const result = await db.update(branchProgressTable)
        .set({
          progressData: JSON.stringify(progressData || {}),
          completionPercentage: completionPercentage || 0,
          lastUpdated: new Date().toISOString()
        })
        .where(eq(branchProgressTable.id, existingProgress[0].id))
        .returning();

      return NextResponse.json({
        success: true,
        progress: result[0]
      });
    } else {
      // Create new progress record
      const result = await db.insert(branchProgressTable).values({
        userEmail,
        branchCode,
        subjectCode,
        activityType,
        progressData: JSON.stringify(progressData || {}),
        completionPercentage: completionPercentage || 0,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }).returning();

      return NextResponse.json({
        success: true,
        progress: result[0]
      });
    }
  } catch (error) {
    console.error('Create/Update branch progress error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      id,
      progressData,
      completionPercentage
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Progress ID is required' },
        { status: 400 }
      );
    }

    const updateData = {
      lastUpdated: new Date().toISOString()
    };
    
    if (progressData !== undefined) updateData.progressData = JSON.stringify(progressData);
    if (completionPercentage !== undefined) updateData.completionPercentage = completionPercentage;

    const result = await db.update(branchProgressTable)
      .set(updateData)
      .where(eq(branchProgressTable.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      progress: result[0]
    });
  } catch (error) {
    console.error('Update branch progress error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}