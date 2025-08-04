import { NextResponse } from "next/server";
import { db } from "../../../config/db";
import { mockExamAttemptsTable } from "../../../config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and, desc } from "drizzle-orm";

export async function GET(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.primaryEmailAddress?.emailAddress;
    const { searchParams } = new URL(req.url);
    const examId = searchParams.get('examId');

    let query = db.select().from(mockExamAttemptsTable)
      .where(eq(mockExamAttemptsTable.userEmail, userEmail));

    if (examId) {
      query = query.where(eq(mockExamAttemptsTable.examId, examId));
    }

    const attempts = await query.orderBy(desc(mockExamAttemptsTable.attemptedAt));

    return NextResponse.json({
      success: true,
      attempts: attempts
    });
  } catch (error) {
    console.error('Get mock exam attempts error:', error);
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
      answers,
      score,
      maxScore,
      timeTaken,
      completedAt
    } = body;

    const userEmail = user.primaryEmailAddress?.emailAddress;

    // Validate required fields
    if (!examId || !answers || score === undefined || !maxScore) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const percentage = Math.round((score / maxScore) * 100);

    const result = await db.insert(mockExamAttemptsTable).values({
      userEmail,
      examId,
      answers: JSON.stringify(answers),
      score,
      maxScore,
      percentage,
      timeTaken: timeTaken || 0,
      attemptedAt: new Date().toISOString(),
      completedAt: completedAt || new Date().toISOString()
    }).returning();

    return NextResponse.json({
      success: true,
      attempt: result[0]
    });
  } catch (error) {
    console.error('Create mock exam attempt error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}