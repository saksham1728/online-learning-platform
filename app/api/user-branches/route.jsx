import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from '../../../config/db.jsx';
import { userBranchesTable, engineeringBranchesTable } from '../../../config/schema.js';
import { eq } from 'drizzle-orm';

export async function GET(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.primaryEmailAddress?.emailAddress;
    
    // Get user's branches from database
    const userBranches = await db.select({
      branchCode: userBranchesTable.branchCode,
      branchName: engineeringBranchesTable.branchName,
      isPrimary: userBranchesTable.isPrimary,
      semester: userBranchesTable.semester,
      academicYear: userBranchesTable.academicYear,
      enrollmentDate: userBranchesTable.enrollmentDate
    })
    .from(userBranchesTable)
    .leftJoin(engineeringBranchesTable, eq(userBranchesTable.branchCode, engineeringBranchesTable.branchCode))
    .where(eq(userBranchesTable.userEmail, userEmail));

    // If no branches found, create a default CSE branch
    if (userBranches.length === 0) {
      // First, ensure CSE branch exists
      const cseBranch = await db.select()
        .from(engineeringBranchesTable)
        .where(eq(engineeringBranchesTable.branchCode, 'CSE'))
        .limit(1);

      if (cseBranch.length === 0) {
        // Create CSE branch
        await db.insert(engineeringBranchesTable).values({
          branchCode: 'CSE',
          branchName: 'Computer Science Engineering',
          description: 'Computer Science and Engineering branch focusing on software development, algorithms, and computer systems.',
          subjects: JSON.stringify(['Programming', 'Data Structures', 'Algorithms', 'Database Systems', 'Computer Networks']),
          toolsAvailable: JSON.stringify(['Career Services', 'Quiz Generator', 'Mock Exams']),
          createdAt: new Date().toISOString()
        });
      }

      // Create user branch entry
      await db.insert(userBranchesTable).values({
        userEmail: userEmail,
        branchCode: 'CSE',
        enrollmentDate: new Date().toISOString(),
        isPrimary: true,
        semester: 1,
        academicYear: '2024-2025'
      });

      // Return the default branch
      return NextResponse.json({
        success: true,
        branches: [{
          branchCode: 'CSE',
          branchName: 'Computer Science Engineering',
          isPrimary: true,
          semester: 1,
          academicYear: '2024-2025',
          enrollmentDate: new Date().toISOString()
        }]
      });
    }

    return NextResponse.json({
      success: true,
      branches: userBranches
    });

  } catch (error) {
    console.error('User branches fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user branches', details: error.message },
      { status: 500 }
    );
  }
}