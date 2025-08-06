import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      topic, 
      description, 
      category = 'general',
      difficulty = 'medium',
      questionCount = 10,
      questionTypes = ['multiple-choice']
    } = body;

    if (!topic || !topic.trim()) {
      return NextResponse.json({ 
        error: 'Topic is required' 
      }, { status: 400 });
    }

    // Validate question count
    if (questionCount < 1 || questionCount > 30) {
      return NextResponse.json({ 
        error: 'Question count must be between 1 and 30' 
      }, { status: 400 });
    }

    console.log('Generating question bank:', { topic, difficulty, questionCount });

    // Initialize Gemini AI
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Build the prompt for question generation
    const prompt = buildQuestionGenerationPrompt(
      topic, 
      description, 
      difficulty, 
      questionCount, 
      questionTypes
    );

    // Generate questions using Gemini AI
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('Gemini AI response received');

    // Parse the AI response
    const questions = parseAIResponse(text);

    if (!questions || questions.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to generate questions. Please try again.' 
      }, { status: 500 });
    }

    // Create question bank object
    const questionBank = {
      id: generateId(),
      topic: topic.trim(),
      description: description?.trim() || '',
      category,
      difficulty,
      questions,
      createdAt: new Date().toISOString(),
      createdBy: user.primaryEmailAddress?.emailAddress,
      questionCount: questions.length
    };

    // Store the question bank using shared storage
    const questionBankStorage = require('../../../../lib/questionBankStorage');
    questionBankStorage.addQuestionBank(questionBank);

    console.log(`Successfully generated ${questions.length} questions for topic: ${topic}`);

    return NextResponse.json({
      success: true,
      questionBank,
      message: `Successfully generated ${questions.length} questions!`
    });

  } catch (error) {
    console.error('Question bank generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate question bank', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

function buildQuestionGenerationPrompt(topic, description, difficulty, questionCount, questionTypes) {
  const difficultyInstructions = {
    easy: 'Create basic, fundamental questions that test core concepts and definitions.',
    medium: 'Create intermediate questions that require understanding and application of concepts.',
    hard: 'Create advanced questions that require analysis, synthesis, and critical thinking.'
  };

  const typeInstructions = questionTypes.includes('multiple-choice') 
    ? 'Focus primarily on multiple-choice questions with 4 options (A, B, C, D).'
    : 'Create a mix of question types as specified.';

  return `You are an expert educator creating a question bank for students. Generate exactly ${questionCount} high-quality educational questions about "${topic}".

${description ? `Additional context: ${description}` : ''}

Requirements:
- Difficulty level: ${difficulty} (${difficultyInstructions[difficulty]})
- ${typeInstructions}
- Each question should be clear, unambiguous, and educationally valuable
- Provide correct answers and brief explanations
- Cover different aspects of the topic
- Ensure questions are factually accurate

Format your response as a JSON array with this exact structure:
[
  {
    "question": "What is the primary purpose of...",
    "type": "multiple-choice",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "A",
    "explanation": "Brief explanation of why this is correct...",
    "difficulty": "${difficulty}",
    "topic": "${topic}"
  }
]

Generate exactly ${questionCount} questions. Ensure the JSON is valid and properly formatted.`;
}

function parseAIResponse(text) {
  try {
    // Clean the response text
    let cleanText = text.trim();
    
    // Remove markdown code blocks if present
    cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Find JSON array in the text
    const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      cleanText = jsonMatch[0];
    }

    // Parse JSON
    const questions = JSON.parse(cleanText);
    
    if (!Array.isArray(questions)) {
      throw new Error('Response is not an array');
    }

    // Validate and clean questions
    return questions.map((q, index) => ({
      id: generateId(),
      question: q.question || `Question ${index + 1}`,
      type: q.type || 'multiple-choice',
      options: Array.isArray(q.options) ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: q.correctAnswer || 'A',
      explanation: q.explanation || 'No explanation provided',
      difficulty: q.difficulty || 'medium',
      topic: q.topic || 'General'
    }));

  } catch (error) {
    console.error('Failed to parse AI response:', error);
    console.log('Raw AI response:', text);
    
    // Fallback: try to extract questions manually
    return extractQuestionsManually(text);
  }
}

function extractQuestionsManually(text) {
  // Fallback method to extract questions if JSON parsing fails
  const questions = [];
  const lines = text.split('\n');
  
  let currentQuestion = null;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Look for question patterns
    if (trimmedLine.match(/^\d+\./) || trimmedLine.includes('?')) {
      if (currentQuestion) {
        questions.push(currentQuestion);
      }
      
      currentQuestion = {
        id: generateId(),
        question: trimmedLine.replace(/^\d+\.\s*/, ''),
        type: 'multiple-choice',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 'A',
        explanation: 'Generated from AI response',
        difficulty: 'medium',
        topic: 'General'
      };
    }
  }
  
  if (currentQuestion) {
    questions.push(currentQuestion);
  }
  
  return questions.slice(0, 10); // Limit to 10 questions as fallback
}

function generateId() {
  return 'qb_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}