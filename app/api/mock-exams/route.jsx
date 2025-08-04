import { NextResponse } from "next/server";
import { db } from "../../../config/db";
import { mockExamsTable } from "../../../config/schema";
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

    let query = db.select().from(mockExamsTable);
    let conditions = [];

    if (branchCode) {
      conditions.push(eq(mockExamsTable.branchCode, branchCode));
    }
    if (subjectCode) {
      conditions.push(eq(mockExamsTable.subjectCode, subjectCode));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const exams = await query;

    return NextResponse.json({
      success: true,
      exams: exams
    });
  } catch (error) {
    console.error('Get mock exams error:', error);
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
      examId,
      title,
      branchCode,
      subjectCode,
      basedOnYears,
      questions,
      totalMarks,
      durationMinutes
    } = body;

    const userEmail = user.primaryEmailAddress?.emailAddress;

    // Validate required fields
    if (!examId || !title || !branchCode || !subjectCode || !questions) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await db.insert(mockExamsTable).values({
      examId,
      title,
      branchCode,
      subjectCode,
      basedOnYears: JSON.stringify(basedOnYears || []),
      questions: JSON.stringify(questions),
      totalMarks: totalMarks || 100,
      durationMinutes: durationMinutes || 180,
      createdBy: userEmail,
      createdAt: new Date().toISOString(),
      isPublic: true
    }).returning();

    return NextResponse.json({
      success: true,
      exam: result[0]
    });
  } catch (error) {
    console.error('Create mock exam error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}