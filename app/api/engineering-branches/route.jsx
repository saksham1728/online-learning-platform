import { NextResponse } from "next/server";
import { db } from "../../../config/db";
import { engineeringBranchesTable, userBranchesTable, branchSubjectsTable } from "../../../config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export async function GET(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    if (action === 'user-branches') {
      // Get user's enrolled branches
      const userBranches = await db.select({
        branchCode: userBranchesTable.branchCode,
        branchName: engineeringBranchesTable.branchName,
        isPrimary: userBranchesTable.isPrimary,
        semester: userBranchesTable.semester,
        enrollmentDate: userBranchesTable.enrollmentDate
      })
      .from(userBranchesTable)
      .innerJoin(engineeringBranchesTable, eq(userBranchesTable.branchCode, engineeringBranchesTable.branchCode))
      .where(eq(userBranchesTable.userEmail, user.primaryEmailAddress?.emailAddress));

      return NextResponse.json({
        success: true,
        branches: userBranches
      });
    }

    // Get all available branches
    const branches = await db.select().from(engineeringBranchesTable);
    
    return NextResponse.json({
      success: true,
      branches: branches
    });
  } catch (error) {
    console.error('Get branches error:', error);
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
    const { action, branchCode, semester, academicYear, isPrimary } = body;

    if (action === 'enroll') {
      // Check if user is already enrolled in this branch
      const existingEnrollment = await db.select()
        .from(userBranchesTable)
        .where(eq(userBranchesTable.userEmail, user.primaryEmailAddress?.emailAddress))
        .where(eq(userBranchesTable.branchCode, branchCode));

      if (existingEnrollment.length > 0) {
        return NextResponse.json({ error: 'Already enrolled in this branch' }, { status: 400 });
      }

      // If this is primary branch, unset other primary branches
      if (isPrimary) {
        await db.update(userBranchesTable)
          .set({ isPrimary: false })
          .where(eq(userBranchesTable.userEmail, user.primaryEmailAddress?.emailAddress));
      }

      // Enroll user in branch
      const result = await db.insert(userBranchesTable).values({
        userEmail: user.primaryEmailAddress?.emailAddress,
        branchCode,
        semester: semester || 1,
        academicYear: academicYear || new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
        isPrimary: isPrimary || false,
        enrollmentDate: new Date().toISOString()
      }).returning();

      return NextResponse.json({
        success: true,
        enrollment: result[0]
      });
    }

    if (action === 'create-branch') {
      // Admin function to create new branches
      const { branchName, description, subjects, toolsAvailable } = body;
      
      const result = await db.insert(engineeringBranchesTable).values({
        branchCode,
        branchName,
        description,
        subjects: JSON.stringify(subjects || []),
        toolsAvailable: JSON.stringify(toolsAvailable || []),
        createdAt: new Date().toISOString()
      }).returning();

      return NextResponse.json({
        success: true,
        branch: result[0]
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Branch operation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}