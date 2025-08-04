import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiQuestionExtractor {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async extractQuestions(pdfText, options = {}) {
    try {
      const prompt = this.buildExtractionPrompt(pdfText, options);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseQuestions(text);
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to extract questions using AI');
    }
  }

  buildExtractionPrompt(text, options) {
    const { subject = 'General', difficulty = 'Mixed', questionCount = 10 } = options;
    
    return `
You are an expert educator tasked with extracting practice questions from educational content.

INSTRUCTIONS:
1. Extract ${questionCount} high-quality practice questions from the provided text
2. Focus on ${subject} concepts if specified
3. Include questions of ${difficulty} difficulty level
4. Provide clear, concise answers where possible
5. Categorize questions by topic/chapter
6. Format the response as valid JSON

REQUIRED JSON FORMAT:
{
  "questions": [
    {
      "question": "Clear, well-formed question text",
      "answer": "Comprehensive answer (if available in text)",
      "difficulty": "Easy|Medium|Hard",
      "topic": "Specific topic/chapter name",
      "questionType": "MCQ|Short Answer|Long Answer|Numerical",
      "marks": 1-10
    }
  ],
  "summary": {
    "totalQuestions": number,
    "topicsCovered": ["topic1", "topic2"],
    "difficultyDistribution": {"Easy": count, "Medium": count, "Hard": count}
  }
}

CONTENT TO ANALYZE:
${text.substring(0, 8000)} // Limit text to avoid token limits

Generate diverse, educational questions that test understanding, application, and analysis of the concepts presented.
`;
  }

  parseQuestions(responseText) {
    try {
      // Clean the response text to extract JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      
      const jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr);
      
      // Validate the structure
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error('Invalid response structure');
      }
      
      // Ensure each question has required fields
      const validQuestions = parsed.questions.map((q, index) => ({
        id: `q_${Date.now()}_${index}`,
        question: q.question || 'Question not available',
        answer: q.answer || 'Answer not provided',
        difficulty: q.difficulty || 'Medium',
        topic: q.topic || 'General',
        questionType: q.questionType || 'Short Answer',
        marks: q.marks || 2,
        extractedAt: new Date().toISOString()
      }));
      
      return {
        questions: validQuestions,
        summary: parsed.summary || {
          totalQuestions: validQuestions.length,
          topicsCovered: [...new Set(validQuestions.map(q => q.topic))],
          difficultyDistribution: this.calculateDifficultyDistribution(validQuestions)
        }
      };
    } catch (error) {
      console.error('Error parsing questions:', error);
      throw new Error('Failed to parse AI response');
    }
  }

  calculateDifficultyDistribution(questions) {
    return questions.reduce((acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    }, {});
  }

  async pdfToText(pdfBuffer) {
    // This is a placeholder for PDF to text conversion
    // In a real implementation, you would use a library like pdf-parse
    try {
      // For now, return a sample text that would come from PDF parsing
      return `
        This is sample text extracted from a PDF document.
        It would contain the actual content of the uploaded PDF file.
        The PDF parsing would be handled by a library like pdf-parse or similar.
      `;
    } catch (error) {
      throw new Error('Failed to extract text from PDF');
    }
  }

  // Retry mechanism for API calls
  async extractQuestionsWithRetry(pdfText, options = {}, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.extractQuestions(pdfText, options);
      } catch (error) {
        lastError = error;
        console.warn(`Attempt ${attempt} failed:`, error.message);
        
        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    
    throw lastError;
  }
}

export default GeminiQuestionExtractor;