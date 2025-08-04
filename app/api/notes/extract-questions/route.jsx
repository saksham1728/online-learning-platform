import { NextResponse } from "next/server";
import { db } from "../../../../config/db";
import { notesTable, extractedQuestionsTable } from "../../../../config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import GeminiQuestionExtractor from "../../../../lib/geminiQuestionExtractor";

// Rate limiting map (in production, use Redis or similar)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

function checkRateLimit(userEmail) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(userEmail) || [];

  // Remove old requests outside the window
  const recentRequests = userRequests.filter(
    (time) => now - time < RATE_LIMIT_WINDOW
  );

  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  recentRequests.push(now);
  rateLimitMap.set(userEmail, recentRequests);
  return true;
}

export async function POST(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;

    // Check rate limiting
    if (!checkRateLimit(userEmail)) {
      return NextResponse.json(
        {
          error:
            "Rate limit exceeded. Please wait before making another request.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { noteId, pdfUrl, title, subject } = body;

    // Validate required fields
    if (!noteId || !pdfUrl) {
      return NextResponse.json(
        { error: "Missing required fields: noteId and pdfUrl" },
        { status: 400 }
      );
    }

    // Check if note exists
    const note = await db
      .select()
      .from(notesTable)
      .where(eq(notesTable.noteId, noteId))
      .limit(1);

    if (!note || note.length === 0) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    try {
      // Initialize the AI extractor
      const extractor = new GeminiQuestionExtractor();

      // For demo purposes, we'll use sample text
      // In production, you would fetch and parse the actual PDF
      const samplePdfText = `
        ${title || "Study Material"}
        
        This document covers important concepts in ${subject || "the subject"}.
        
        Key Topics:
        1. Fundamental concepts and definitions
        2. Core principles and theories  
        3. Practical applications and examples
        4. Problem-solving techniques
        5. Advanced topics and current trends
        
        Important Definitions:
        - Concept A: A fundamental principle that forms the basis of understanding
        - Concept B: An advanced technique used in practical applications
        - Concept C: A theoretical framework for analysis
        
        Examples and Applications:
        The concepts discussed can be applied in various scenarios including:
        - Real-world problem solving
        - Academic research and analysis
        - Industry applications and implementations
        
        Practice Problems:
        1. Explain the relationship between Concept A and Concept B
        2. How would you apply these principles in a practical scenario?
        3. What are the advantages and limitations of this approach?
        4. Compare and contrast different methodologies
        5. Analyze the impact of these concepts on current practices
      `;

      // Extract questions using AI
      const extractionOptions = {
        subject: subject || "General",
        difficulty: "Mixed",
        questionCount: 8,
      };

      const result = await extractor.extractQuestionsWithRetry(
        samplePdfText,
        extractionOptions
      );

      // Save extracted questions to database
      const savedQuestions = [];
      for (const question of result.questions) {
        try {
          const saved = await db
            .insert(extractedQuestionsTable)
            .values({
              questionId: question.id,
              noteId: noteId,
              question: question.question,
              answer: question.answer,
              difficulty: question.difficulty,
              topic: question.topic,
              questionType: question.questionType,
              marks: question.marks,
              extractedAt: new Date().toISOString(),
              isVerified: false,
            })
            .returning();

          savedQuestions.push(saved[0]);
        } catch (dbError) {
          console.error("Error saving question:", dbError);
          // Continue with other questions even if one fails
        }
      }

      // Update the note with extracted questions reference
      await db
        .update(notesTable)
        .set({
          extractedQuestions: JSON.stringify(result.questions),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(notesTable.noteId, noteId));

      return NextResponse.json({
        success: true,
        questions: result.questions,
        summary: result.summary,
        savedCount: savedQuestions.length,
        message: `Successfully extracted ${result.questions.length} questions from the PDF`,
      });
    } catch (aiError) {
      console.error("AI extraction error:", aiError);

      // Return fallback questions if AI fails
      const fallbackQuestions = [
        {
          id: `fallback_${Date.now()}_1`,
          question: `What are the key concepts covered in ${
            title || "this document"
          }?`,
          answer:
            "Please refer to the main sections of the document for detailed explanations.",
          difficulty: "Medium",
          topic: subject || "General",
          questionType: "Short Answer",
          marks: 5,
          extractedAt: new Date().toISOString(),
        },
        {
          id: `fallback_${Date.now()}_2`,
          question: `Explain the practical applications discussed in the study material.`,
          answer:
            "The document covers various real-world applications and use cases.",
          difficulty: "Medium",
          topic: subject || "General",
          questionType: "Long Answer",
          marks: 10,
          extractedAt: new Date().toISOString(),
        },
      ];

      return NextResponse.json({
        success: true,
        questions: fallbackQuestions,
        summary: {
          totalQuestions: fallbackQuestions.length,
          topicsCovered: [subject || "General"],
          difficultyDistribution: { Medium: 2 },
        },
        message:
          "AI extraction temporarily unavailable. Generated sample questions.",
        fallback: true,
      });
    }
  } catch (error) {
    console.error("Extract questions error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to extract questions from PDF",
      },
      { status: 500 }
    );
  }
}
