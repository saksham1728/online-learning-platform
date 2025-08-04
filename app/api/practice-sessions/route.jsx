import { NextResponse } from "next/server";
import { db } from "../../../config/db";
import { practiceSessionsTable } from "../../../config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, desc } from "drizzle-orm";

export async function GET(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      // Get specific session
      const result = await db.select().from(practiceSessionsTable)
        .where(eq(practiceSessionsTable.sessionId, sessionId));
      
      if (result.length === 0) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        session: result[0]
      });
    } else {
      // Get all sessions for user and calculate stats
      const sessions = await db.select().from(practiceSessionsTable)
        .where(eq(practiceSessionsTable.userEmail, user.primaryEmailAddress?.emailAddress))
        .orderBy(desc(practiceSessionsTable.id));

      // Calculate stats
      const totalSessions = sessions.length;
      const totalQuestions = sessions.reduce((sum, session) => sum + (session.questionsAnswered || 0), 0);
      const totalCorrect = sessions.reduce((sum, session) => sum + (session.correctAnswers || 0), 0);
      const averageScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

      // Get recent sessions with parsed data
      const recentSessions = sessions.slice(0, 10).map(session => ({
        ...session,
        sessionData: typeof session.sessionData === 'string' ? 
          JSON.parse(session.sessionData) : session.sessionData
      }));

      return NextResponse.json({
        success: true,
        stats: {
          totalSessions,
          totalQuestions,
          averageScore,
          recentSessions
        }
      });
    }
  } catch (error) {
    console.error('Get practice sessions error:', error);
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
      sessionId,
      topic,
      questionsAnswered,
      correctAnswers,
      sessionData
    } = body;

    // Validate required fields
    if (!sessionId || !topic || questionsAnswered === undefined || correctAnswers === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if session already exists (for updates)
    const existingSession = await db.select().from(practiceSessionsTable)
      .where(eq(practiceSessionsTable.sessionId, sessionId));

    if (existingSession.length > 0) {
      // Update existing session
      const result = await db.update(practiceSessionsTable)
        .set({
          questionsAnswered,
          correctAnswers,
          sessionData: JSON.stringify(sessionData || {}),
          updatedAt: new Date().toISOString()
        })
        .where(eq(practiceSessionsTable.sessionId, sessionId))
        .returning();

      return NextResponse.json({
        success: true,
        session: result[0]
      });
    } else {
      // Create new session
      const result = await db.insert(practiceSessionsTable).values({
        sessionId,
        userEmail: user.primaryEmailAddress?.emailAddress,
        topic,
        questionsAnswered,
        correctAnswers,
        sessionData: JSON.stringify(sessionData || {}),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }).returning();

      return NextResponse.json({
        success: true,
        session: result[0]
      });
    }
  } catch (error) {
    console.error('Create/update practice session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}