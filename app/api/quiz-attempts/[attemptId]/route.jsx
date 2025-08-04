import { NextResponse } from "next/server";
import { db } from "../../../../config/db";
import { quizAttemptsTable, quizzesTable } from "../../../../config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export async function GET(req, { params }) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { attemptId } = params;

    // Get attempt with quiz data
    const attemptResult = await db.select().from(quizAttemptsTable)
      .where(eq(quizAttemptsTable.attemptId, attemptId));

    if (attemptResult.length === 0) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    const attempt = attemptResult[0];

    // Verify user owns this attempt
    if (attempt.userEmail !== user.primaryEmailAddress?.emailAddress) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get associated quiz
    const quizResult = await db.select().from(quizzesTable)
      .where(eq(quizzesTable.quizId, attempt.quizId));

    if (quizResult.length === 0) {
      return NextResponse.json({ error: 'Associated quiz not found' }, { status: 404 });
    }

    const quiz = quizResult[0];

    // Parse JSON fields
    const parsedAttempt = {
      ...attempt,
      answers: typeof attempt.answers === 'string' ? JSON.parse(attempt.answers) : attempt.answers
    };

    const parsedQuiz = {
      ...quiz,
      settings: typeof quiz.settings === 'string' ? JSON.parse(quiz.settings) : quiz.settings,
      questions: typeof quiz.questions === 'string' ? JSON.parse(quiz.questions) : quiz.questions
    };

    return NextResponse.json({
      success: true,
      attempt: parsedAttempt,
      quiz: parsedQuiz
    });
  } catch (error) {
    console.error('Get quiz attempt error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}