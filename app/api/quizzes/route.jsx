import { NextResponse } from "next/server";
import { db } from "../../../config/db";
import { quizzesTable } from "../../../config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, desc } from "drizzle-orm";

export async function GET(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get('quizId');

    if (quizId) {
      // Get specific quiz
      const result = await db.select().from(quizzesTable)
        .where(eq(quizzesTable.quizId, quizId));
      
      if (result.length === 0) {
        return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        quiz: result[0]
      });
    } else {
      // Get all quizzes for the user
      const result = await db.select().from(quizzesTable)
        .where(eq(quizzesTable.creatorEmail, user.primaryEmailAddress?.emailAddress))
        .orderBy(desc(quizzesTable.id));

      return NextResponse.json({
        success: true,
        quizzes: result
      });
    }
  } catch (error) {
    console.error('Get quizzes error:', error);
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
      quizId,
      title,
      description,
      topic,
      courseId,
      settings,
      questions,
      isPublished = true
    } = body;

    // Validate required fields
    if (!quizId || !title || !topic || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await db.insert(quizzesTable).values({
      quizId,
      title,
      description: description || '',
      topic,
      courseId,
      creatorEmail: user.primaryEmailAddress?.emailAddress,
      settings: JSON.stringify(settings || {}),
      questions: JSON.stringify(questions),
      isPublished,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }).returning();

    return NextResponse.json({
      success: true,
      quiz: result[0]
    });
  } catch (error) {
    console.error('Create quiz error:', error);
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
      quizId,
      title,
      description,
      topic,
      settings,
      questions,
      isPublished
    } = body;

    if (!quizId) {
      return NextResponse.json(
        { error: 'Quiz ID is required' },
        { status: 400 }
      );
    }

    // Check if quiz exists and user owns it
    const existingQuiz = await db.select().from(quizzesTable)
      .where(eq(quizzesTable.quizId, quizId));

    if (existingQuiz.length === 0) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    if (existingQuiz[0].creatorEmail !== user.primaryEmailAddress?.emailAddress) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (topic !== undefined) updateData.topic = topic;
    if (settings !== undefined) updateData.settings = JSON.stringify(settings);
    if (questions !== undefined) updateData.questions = JSON.stringify(questions);
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    const result = await db.update(quizzesTable)
      .set(updateData)
      .where(eq(quizzesTable.quizId, quizId))
      .returning();

    return NextResponse.json({
      success: true,
      quiz: result[0]
    });
  } catch (error) {
    console.error('Update quiz error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}