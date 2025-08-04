import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { paperContent, paperTitle, subjectCode, difficulty = 'medium' } = body;

    if (!paperContent) {
      return NextResponse.json({ error: 'Paper content is required' }, { status: 400 });
    }

    console.log('Generating quiz from question paper using Gemini AI...');

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create prompt for quiz generation
    const prompt = `
      Based on the following question paper content, generate an interactive quiz with multiple choice questions.
      
      Question Paper: ${paperTitle}
      Subject: ${subjectCode}
      Difficulty Level: ${difficulty}
      
      Paper Content:
      ${paperContent}
      
      Please generate a quiz in the following JSON format:
      {
        "title": "Quiz based on ${paperTitle}",
        "description": "Interactive quiz generated from the question paper",
        "subject": "${subjectCode}",
        "difficulty": "${difficulty}",
        "timeLimit": 30,
        "questions": [
          {
            "id": 1,
            "question": "Question text here",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": 0,
            "explanation": "Explanation for the correct answer",
            "marks": 2
          }
        ],
        "totalMarks": "calculated total marks",
        "passingMarks": "60% of total marks"
      }
      
      Instructions:
      1. Generate 15-20 multiple choice questions based on the paper content
      2. Cover all major topics mentioned in the question paper
      3. Make questions challenging but fair for the given difficulty level
      4. Provide clear explanations for correct answers
      5. Ensure options are plausible and not obviously wrong
      6. Calculate total marks and passing marks correctly
    `;

    // Generate quiz using Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    let quizData;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        quizData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      return NextResponse.json({ 
        error: 'Failed to generate quiz', 
        details: 'Invalid response format from AI' 
      }, { status: 500 });
    }

    // Add metadata
    quizData.generatedFrom = 'question-paper';
    quizData.sourceTitle = paperTitle;
    quizData.createdAt = new Date().toISOString();
    quizData.createdBy = user.primaryEmailAddress?.emailAddress;

    console.log('Quiz generated successfully:', quizData.title);

    return NextResponse.json({
      success: true,
      quiz: quizData,
      message: 'Quiz generated successfully from question paper'
    });

  } catch (error) {
    console.error('Quiz generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz', details: error.message },
      { status: 500 }
    );
  }
}