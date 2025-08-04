import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Rate limiting map
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

function checkRateLimit(userEmail) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(userEmail) || [];

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

export async function GET(req) {
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
            "Rate limit exceeded. Please wait before requesting new cards.",
        },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(req.url);
    const count = parseInt(searchParams.get("count")) || 10;

    try {
      const prompt = `
Generate ${count} diverse and engaging knowledge cards for a "Knowledge Dating" feature where students swipe through interesting topics. Each card should be about cutting-edge, trending, or fascinating topics that would excite young learners.

Categories to include:
- Latest AI tools and technologies
- New programming languages/frameworks
- Breakthrough scientific discoveries
- Innovative startups and products
- Emerging tech trends (Web3, AR/VR, IoT, etc.)
- New electric vehicles and sustainable tech
- Space exploration updates
- Cybersecurity trends
- Health tech innovations
- Gaming and entertainment tech

For each card, provide:
1. A catchy, intriguing title (max 60 characters)
2. A brief, exciting description (max 150 characters) 
3. A category/tag
4. An engaging emoji
5. A "swipe right to learn more" hook

Format as JSON array:
{
  "cards": [
    {
      "id": "unique_id",
      "title": "Catchy title here",
      "description": "Brief exciting description that makes you want to learn more",
      "category": "AI Tools",
      "emoji": "🤖",
      "hook": "Swipe right to discover how this changes everything!",
      "trending": true/false,
      "difficulty": "Beginner/Intermediate/Advanced"
    }
  ]
}

Make each card feel like a mini-discovery that students would be excited to explore. Focus on very recent developments (2024-2025) and make them sound fascinating and accessible.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in AI response");
      }

      const parsedResponse = JSON.parse(jsonMatch[0]);

      // Validate and enhance the cards
      const enhancedCards = parsedResponse.cards.map((card, index) => ({
        id: card.id || `card_${Date.now()}_${index}`,
        title: card.title || "Interesting Topic",
        description: card.description || "Discover something new!",
        category: card.category || "Technology",
        emoji: card.emoji || "🚀",
        hook: card.hook || "Swipe right to learn more!",
        trending:
          card.trending !== undefined ? card.trending : Math.random() > 0.5,
        difficulty: card.difficulty || "Intermediate",
        createdAt: new Date().toISOString(),
      }));

      return NextResponse.json({
        success: true,
        cards: enhancedCards,
        total: enhancedCards.length,
        generatedAt: new Date().toISOString(),
      });
    } catch (aiError) {
      console.error("AI generation error:", aiError);

      // Fallback cards if AI fails
      const fallbackCards = [
        {
          id: `fallback_${Date.now()}_1`,
          title: "ChatGPT's New Code Interpreter",
          description:
            "AI can now run and debug your code in real-time. Revolutionary for developers!",
          category: "AI Tools",
          emoji: "🤖",
          hook: "Swipe right to see how it codes better than humans!",
          trending: true,
          difficulty: "Intermediate",
          createdAt: new Date().toISOString(),
        },
        {
          id: `fallback_${Date.now()}_2`,
          title: "Tesla's New 4680 Battery Tech",
          description:
            "5x more energy, 6x more power. This changes everything about EVs!",
          category: "Electric Vehicles",
          emoji: "⚡",
          hook: "Swipe right to discover the battery revolution!",
          trending: true,
          difficulty: "Beginner",
          createdAt: new Date().toISOString(),
        },
        {
          id: `fallback_${Date.now()}_3`,
          title: "Quantum Internet is Here",
          description:
            "China just achieved 1000km quantum communication. Unhackable internet incoming!",
          category: "Quantum Tech",
          emoji: "🔮",
          hook: "Swipe right to enter the quantum realm!",
          trending: true,
          difficulty: "Advanced",
          createdAt: new Date().toISOString(),
        },
        {
          id: `fallback_${Date.now()}_4`,
          title: "Neuralink's First Human Trial",
          description:
            "Brain-computer interfaces are real. Control devices with your thoughts!",
          category: "BioTech",
          emoji: "🧠",
          hook: "Swipe right to explore the future of human-AI merger!",
          trending: true,
          difficulty: "Advanced",
          createdAt: new Date().toISOString(),
        },
        {
          id: `fallback_${Date.now()}_5`,
          title: "Rust is Eating the World",
          description:
            "Memory-safe systems programming. Even Linux kernel is adopting it!",
          category: "Programming",
          emoji: "🦀",
          hook: "Swipe right to join the Rust revolution!",
          trending: true,
          difficulty: "Intermediate",
          createdAt: new Date().toISOString(),
        },
      ];

      return NextResponse.json({
        success: true,
        cards: fallbackCards,
        total: fallbackCards.length,
        generatedAt: new Date().toISOString(),
        fallback: true,
        message: "AI temporarily unavailable. Showing curated trending topics.",
      });
    }
  } catch (error) {
    console.error("Knowledge dating cards error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to generate knowledge cards",
      },
      { status: 500 }
    );
  }
}
