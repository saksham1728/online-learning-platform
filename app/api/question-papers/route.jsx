import { NextResponse } from "next/server";
import { db } from "../../../config/db";
import { questionPapersTable } from "../../../config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and, desc } from "drizzle-orm";

export async function GET(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const branchCode = searchParams.get('branchCode');
    const subjectCode = searchParams.get('subjectCode');
    const year = searchParams.get('year');
    const university = searchParams.get('university');

    let query = db.select().from(questionPapersTable);
    let conditions = [];

    if (branchCode) {
      conditions.push(eq(questionPapersTable.branchCode, branchCode));
    }
    if (subjectCode) {
      conditions.push(eq(questionPapersTable.subjectCode, subjectCode));
    }
    if (year) {
      conditions.push(eq(questionPapersTable.examYear, parseInt(year)));
    }
    if (university) {
      conditions.push(eq(questionPapersTable.university, university));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const papers = await query.orderBy(desc(questionPapersTable.examYear));

    return NextResponse.json({
      success: true,
      papers: papers
    });
  } catch (error) {
    console.error('Get question papers error:', error);
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
      paperId,
      branchCode,
      subjectCode,
      title,
      university,
      examYear,
      examType,
      pdfUrl,
      totalMarks,
      durationMinutes,
      difficultyLevel
    } = body;

    // Validate required fields
    if (!paperId || !branchCode || !subjectCode || !title || !examYear) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await db.insert(questionPapersTable).values({
      paperId,
      branchCode,
      subjectCode,
      title,
      university: university || 'Unknown',
      examYear,
      examType: examType || 'Regular',
      pdfUrl: pdfUrl || '',
      extractedQuestions: JSON.stringify([]),
      difficultyLevel: difficultyLevel || 'Medium',
      totalMarks: totalMarks || 100,
      durationMinutes: durationMinutes || 180,
      uploadDate: new Date().toISOString()
    }).returning();

    return NextResponse.json({
      success: true,
      paper: result[0]
    });
  } catch (error) {
    console.error('Create question paper error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}