import { NextResponse } from "next/server";
import { db } from "../../../../config/db";
import { quizzesTable } from "../../../../config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export async function GET(req, { params }) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { quizId } = params;

    const result = await db.select().from(quizzesTable)
      .where(eq(quizzesTable.quizId, quizId));

    if (result.length === 0) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    const quiz = result[0];

    // Parse JSON fields
    const parsedQuiz = {
      ...quiz,
      settings: typeof quiz.settings === 'string' ? JSON.parse(quiz.settings) : quiz.settings,
      questions: typeof quiz.questions === 'string' ? JSON.parse(quiz.questions) : quiz.questions
    };

    return NextResponse.json({
      success: true,
      quiz: parsedQuiz
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { quizId } = params;

    // Check if quiz exists and user owns it
    const existingQuiz = await db.select().from(quizzesTable)
      .where(eq(quizzesTable.quizId, quizId));

    if (existingQuiz.length === 0) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    if (existingQuiz[0].creatorEmail !== user.primaryEmailAddress?.emailAddress) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await db.delete(quizzesTable)
      .where(eq(quizzesTable.quizId, quizId));

    return NextResponse.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Delete quiz error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}