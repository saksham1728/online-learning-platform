import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
const questionBankStorage = require("../../../../lib/questionBankStorage");

export async function DELETE(req, { params }) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bankId } = await params;
    const userEmail = user.primaryEmailAddress?.emailAddress;

    // Delete the question bank
    const deletedBank = questionBankStorage.deleteQuestionBank(
      bankId,
      userEmail
    );

    if (!deletedBank) {
      return NextResponse.json(
        {
          error: "Question bank not found or unauthorized",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Question bank deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete question bank:", error);
    return NextResponse.json(
      { error: "Failed to delete question bank" },
      { status: 500 }
    );
  }
}

export async function GET(req, { params }) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bankId } = await params;
    const userEmail = user.primaryEmailAddress?.emailAddress;

    // Find the question bank
    const questionBank = questionBankStorage.getQuestionBank(bankId, userEmail);

    if (!questionBank) {
      return NextResponse.json(
        {
          error: "Question bank not found or unauthorized",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      questionBank,
    });
  } catch (error) {
    console.error("Failed to fetch question bank:", error);
    return NextResponse.json(
      { error: "Failed to fetch question bank" },
      { status: 500 }
    );
  }
}
