import { NextResponse } from "next/server";
import { GoogleGenAI } from '@google/genai';
import { currentUser } from "@clerk/nextjs/server";

const QUIZ_GENERATION_PROMPT = `
Generate quiz questions based on the following parameters. Return ONLY valid JSON without any markdown formatting or code blocks.

Requirements:
- Topic: {topic}
- Number of questions: {questionCount}
- Difficulty level: {difficulty}
- Question types: {questionTypes}

For each question, provide:
1. question: The question text
2. type: The question type (multiple_choice, true_false, short_answer, fill_blank)
3. options: Array of answer choices (for multiple choice only)
4. correctAnswer: The correct answer(s)
5. explanation: Brief explanation of the correct answer
6. difficulty: The difficulty level
7. points: Points for this question (1-5 based on difficulty)

JSON Schema:
{
  "questions": [
    {
      "id": "string",
      "question": "string",
      "type": "multiple_choice|true_false|short_answer|fill_blank",
      "options": ["string"] (only for multiple_choice),
      "correctAnswer": "string or array",
      "explanation": "string",
      "difficulty": "beginner|intermediate|advanced",
      "points": number
    }
  ]
}

Generate diverse, educational questions that test understanding, not just memorization. Make sure questions are clear, unambiguous, and appropriate for the specified difficulty level.
`;

export async function POST(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      topic, 
      questionCount = 10, 
      difficulty = 'intermediate', 
      questionTypes = ['multiple_choice', 'true_false'] 
    } = body;

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // Initialize Gemini AI
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const model = 'gemini-2.0-flash';
    const config = {
      responseMimeType: 'text/plain',
    };

    // Prepare the prompt with parameters
    const prompt = QUIZ_GENERATION_PROMPT
      .replace('{topic}', topic)
      .replace('{questionCount}', questionCount)
      .replace('{difficulty}', difficulty)
      .replace('{questionTypes}', questionTypes.join(', '));

    const contents = [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ];

    // Generate questions using AI
    const response = await ai.models.generateContent({
      model,
      config,
      contents,
    });

    const rawResponse = response?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawResponse) {
      throw new Error('No response from AI service');
    }

    // Clean and parse the response
    const cleanedResponse = rawResponse
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    let questionsData;
    try {
      questionsData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', cleanedResponse);
      throw new Error('Invalid response format from AI service');
    }

    // Validate and enhance the questions
    const questions = questionsData.questions?.map((q, index) => ({
      id: `q_${Date.now()}_${index}`,
      question: q.question,
      type: q.type,
      options: q.options || [],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty || difficulty,
      points: q.points || (difficulty === 'beginner' ? 1 : difficulty === 'intermediate' ? 2 : 3),
      topic: topic
    })) || [];

    if (questions.length === 0) {
      throw new Error('No questions generated');
    }

    return NextResponse.json({
      success: true,
      questions,
      metadata: {
        topic,
        questionCount: questions.length,
        difficulty,
        questionTypes,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Quiz generation error:', error);
    
    // Return fallback questions if AI fails
    const fallbackQuestions = generateFallbackQuestions(req.body?.topic, req.body?.questionCount || 5);
    
    return NextResponse.json({
      success: true,
      questions: fallbackQuestions,
      metadata: {
        topic: req.body?.topic || 'General Knowledge',
        questionCount: fallbackQuestions.length,
        difficulty: req.body?.difficulty || 'intermediate',
        questionTypes: ['multiple_choice'],
        generatedAt: new Date().toISOString(),
        fallback: true
      }
    });
  }
}

// Fallback questions generator
function generateFallbackQuestions(topic, count) {
  const fallbackQuestions = [];
  
  for (let i = 0; i < count; i++) {
    fallbackQuestions.push({
      id: `fallback_${Date.now()}_${i}`,
      question: `Sample question ${i + 1} about ${topic || 'the topic'}?`,
      type: 'multiple_choice',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option A',
      explanation: 'This is a sample explanation for the correct answer.',
      difficulty: 'intermediate',
      points: 2,
      topic: topic || 'General Knowledge'
    });
  }
  
  return fallbackQuestions;
}