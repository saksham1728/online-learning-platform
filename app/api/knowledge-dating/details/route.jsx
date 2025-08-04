import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, category, description } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    try {
      const prompt = `
You are an expert educator creating detailed, engaging content for curious students. Based on this topic:

Title: "${title}"
Category: "${category}"
Brief Description: "${description}"

Create comprehensive, exciting content that includes:

1. **What is it?** - Clear, simple explanation
2. **Why is it revolutionary?** - What makes this significant
3. **Real-world applications** - How it's being used now
4. **Future implications** - Where this is heading
5. **How to get started** - Practical steps for students
6. **Key players/companies** - Who's leading this space
7. **Learning resources** - Where to learn more
8. **Career opportunities** - Job prospects in this field

Make it conversational, exciting, and educational. Use emojis appropriately. Format as JSON:

{
  "title": "Enhanced title",
  "overview": "Comprehensive overview paragraph",
  "sections": [
    {
      "heading": "What is it?",
      "content": "Detailed explanation...",
      "emoji": "🤔"
    },
    {
      "heading": "Why Revolutionary?",
      "content": "Significance explanation...",
      "emoji": "🚀"
    },
    {
      "heading": "Real-World Applications",
      "content": "Current applications...",
      "emoji": "🌍"
    },
    {
      "heading": "Future Implications",
      "content": "Future possibilities...",
      "emoji": "🔮"
    },
    {
      "heading": "Getting Started",
      "content": "Practical steps...",
      "emoji": "🎯"
    },
    {
      "heading": "Key Players",
      "content": "Companies and leaders...",
      "emoji": "🏢"
    },
    {
      "heading": "Learning Resources",
      "content": "Where to learn more...",
      "emoji": "📚"
    },
    {
      "heading": "Career Opportunities",
      "content": "Job prospects...",
      "emoji": "💼"
    }
  ],
  "quickFacts": [
    "Interesting fact 1",
    "Interesting fact 2",
    "Interesting fact 3"
  ],
  "relatedTopics": [
    "Related topic 1",
    "Related topic 2",
    "Related topic 3"
  ]
}

Keep it engaging, informative, and inspiring for students!
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in AI response");
      }

      const detailedInfo = JSON.parse(jsonMatch[0]);

      return NextResponse.json({
        success: true,
        details: {
          ...detailedInfo,
          originalCard: { title, category, description },
          generatedAt: new Date().toISOString(),
        },
      });
    } catch (aiError) {
      console.error("AI detail generation error:", aiError);

      // Fallback detailed content
      const fallbackDetails = {
        title: title,
        overview: `${title} is an exciting development in ${category} that's changing how we think about technology and innovation. This breakthrough represents a significant step forward in the field.`,
        sections: [
          {
            heading: "What is it?",
            content: `${title} is a cutting-edge development in ${category} that combines innovative technology with practical applications. It represents the latest advancement in this rapidly evolving field.`,
            emoji: "🤔",
          },
          {
            heading: "Why Revolutionary?",
            content:
              "This technology is revolutionary because it solves long-standing problems in new and innovative ways, opening up possibilities that weren't available before.",
            emoji: "🚀",
          },
          {
            heading: "Real-World Applications",
            content:
              "Currently being used in various industries to improve efficiency, reduce costs, and create new opportunities for innovation and growth.",
            emoji: "🌍",
          },
          {
            heading: "Future Implications",
            content:
              "The future looks bright with this technology potentially transforming entire industries and creating new ways of working and living.",
            emoji: "🔮",
          },
          {
            heading: "Getting Started",
            content:
              "Start by researching the basics, following key companies in the space, and looking for online courses or tutorials to build foundational knowledge.",
            emoji: "🎯",
          },
          {
            heading: "Key Players",
            content:
              "Major tech companies and innovative startups are leading the development in this space, with significant investment and research ongoing.",
            emoji: "🏢",
          },
          {
            heading: "Learning Resources",
            content:
              "Online courses, documentation, YouTube tutorials, and community forums are great places to start learning more about this topic.",
            emoji: "📚",
          },
          {
            heading: "Career Opportunities",
            content:
              "This field offers exciting career opportunities with high demand for skilled professionals and competitive salaries.",
            emoji: "💼",
          },
        ],
        quickFacts: [
          "This is a rapidly growing field with lots of opportunities",
          "Major companies are investing heavily in this technology",
          "Skills in this area are highly sought after by employers",
        ],
        relatedTopics: [
          "Artificial Intelligence",
          "Machine Learning",
          "Data Science",
        ],
      };

      return NextResponse.json({
        success: true,
        details: {
          ...fallbackDetails,
          originalCard: { title, category, description },
          generatedAt: new Date().toISOString(),
          fallback: true,
        },
        message: "AI temporarily unavailable. Showing general information.",
      });
    }
  } catch (error) {
    console.error("Knowledge dating details error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to generate detailed information",
      },
      { status: 500 }
    );
  }
}
