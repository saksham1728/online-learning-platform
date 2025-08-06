import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
const questionBankStorage = require('../../../lib/questionBankStorage');

export async function GET(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.primaryEmailAddress?.emailAddress;
    
    // Get question banks for the current user
    const userQuestionBanks = questionBankStorage.getUserQuestionBanks(userEmail);

    return NextResponse.json({
      success: true,
      questionBanks: userQuestionBanks
    });

  } catch (error) {
    console.error('Failed to fetch question banks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch question banks' },
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
    const questionBank = {
      ...body,
      id: body.id || generateId(),
      createdBy: user.primaryEmailAddress?.emailAddress,
      createdAt: body.createdAt || new Date().toISOString()
    };

    // Store the question bank
    questionBankStorage.addQuestionBank(questionBank);

    return NextResponse.json({
      success: true,
      questionBank
    });

  } catch (error) {
    console.error('Failed to create question bank:', error);
    return NextResponse.json(
      { error: 'Failed to create question bank' },
      { status: 500 }
    );
  }
}

function generateId() {
  return 'qb_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}