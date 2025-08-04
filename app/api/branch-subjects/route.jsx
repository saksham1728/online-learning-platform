import { NextResponse } from "next/server";
import { db } from "../../../config/db";
import { branchSubjectsTable, engineeringBranchesTable } from "../../../config/schema";
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
    const semester = searchParams.get('semester');

    let query = db.select().from(branchSubjectsTable);
    let conditions = [];

    if (branchCode) {
      conditions.push(eq(branchSubjectsTable.branchCode, branchCode));
    }
    if (semester) {
      conditions.push(eq(branchSubjectsTable.semester, parseInt(semester)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const subjects = await query;

    return NextResponse.json({
      success: true,
      subjects: subjects
    });
  } catch (error) {
    console.error('Get branch subjects error:', error);
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
      subjectName,
      semester,
      credits,
      isCore,
      prerequisites,
      syllabus
    } = body;

    // Validate required fields
    if (!branchCode || !subjectCode || !subjectName || !semester) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if branch exists
    const branchExists = await db.select().from(engineeringBranchesTable)
      .where(eq(engineeringBranchesTable.branchCode, branchCode));
    
    if (branchExists.length === 0) {
      return NextResponse.json(
        { error: 'Branch not found' },
        { status: 404 }
      );
    }

    const result = await db.insert(branchSubjectsTable).values({
      branchCode,
      subjectCode,
      subjectName,
      semester,
      credits: credits || 3,
      isCore: isCore !== undefined ? isCore : true,
      prerequisites: JSON.stringify(prerequisites || []),
      syllabus: JSON.stringify(syllabus || {})
    }).returning();

    return NextResponse.json({
      success: true,
      subject: result[0]
    });
  } catch (error) {
    console.error('Create branch subject error:', error);
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
      subjectName,
      semester,
      credits,
      isCore,
      prerequisites,
      syllabus
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Subject ID is required' },
        { status: 400 }
      );
    }

    const updateData = {};
    if (subjectName !== undefined) updateData.subjectName = subjectName;
    if (semester !== undefined) updateData.semester = semester;
    if (credits !== undefined) updateData.credits = credits;
    if (isCore !== undefined) updateData.isCore = isCore;
    if (prerequisites !== undefined) updateData.prerequisites = JSON.stringify(prerequisites);
    if (syllabus !== undefined) updateData.syllabus = JSON.stringify(syllabus);

    const result = await db.update(branchSubjectsTable)
      .set(updateData)
      .where(eq(branchSubjectsTable.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      subject: result[0]
    });
  } catch (error) {
    console.error('Update branch subject error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}