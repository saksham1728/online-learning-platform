import { NextResponse } from "next/server";
import { db } from "../../../config/db";
import { quizAttemptsTable, quizzesTable } from "../../../config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, desc, and } from "drizzle-orm";

export async function GET(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get('quizId');
    const attemptId = searchParams.get('attemptId');

    if (attemptId) {
      // Get specific attempt
      const result = await db.select().from(quizAttemptsTable)
        .where(eq(quizAttemptsTable.attemptId, attemptId));
      
      if (result.length === 0) {
        return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        attempt: result[0]
      });
    } else if (quizId) {
      // Get attempts for specific quiz
      const result = await db.select().from(quizAttemptsTable)
        .where(and(
          eq(quizAttemptsTable.quizId, quizId),
          eq(quizAttemptsTable.userEmail, user.primaryEmailAddress?.emailAddress)
        ))
        .orderBy(desc(quizAttemptsTable.id));

      return NextResponse.json({
        success: true,
        attempts: result
      });
    } else {
      // Get all attempts for user
      const result = await db.select().from(quizAttemptsTable)
        .where(eq(quizAttemptsTable.userEmail, user.primaryEmailAddress?.emailAddress))
        .orderBy(desc(quizAttemptsTable.id));

      return NextResponse.json({
        success: true,
        attempts: result
      });
    }
  } catch (error) {
    console.error('Get quiz attempts error:', error);
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
      attemptId,
      quizId,
      answers,
      score,
      maxScore,
      startTime,
      endTime,
      isCompleted = true,
      timeTaken
    } = body;

    // Validate required fields
    if (!attemptId || !quizId || !answers || score === undefined || maxScore === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify quiz exists
    const quizResult = await db.select().from(quizzesTable)
      .where(eq(quizzesTable.quizId, quizId));

    if (quizResult.length === 0) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    const result = await db.insert(quizAttemptsTable).values({
      attemptId,
      quizId,
      userEmail: user.primaryEmailAddress?.emailAddress,
      answers: JSON.stringify(answers),
      score,
      maxScore,
      startTime,
      endTime,
      isCompleted,
      timeTaken,
      createdAt: new Date().toISOString()
    }).returning();

    return NextResponse.json({
      success: true,
      attempt: result[0]
    });
  } catch (error) {
    console.error('Create quiz attempt error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}