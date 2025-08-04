"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Heart,
  X,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Clock,
  User,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { toast } from "sonner";

function KnowledgeDating() {
  const [cards, setCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [detailsData, setDetailsData] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [likedCards, setLikedCards] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const cardRef = useRef(null);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      loadCards();
    }
  }, [user]);

  const loadCards = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/knowledge-dating/cards?count=10");

      if (response.data.success) {
        setCards(response.data.cards);
        setCurrentCardIndex(0);
        if (response.data.fallback) {
          toast.info(
            "AI temporarily unavailable. Showing curated trending topics."
          );
        } else {
          toast.success("Fresh knowledge cards loaded!");
        }
      } else {
        toast.error("Failed to load knowledge cards");
      }
    } catch (error) {
      console.error("Failed to load cards:", error);
      toast.error("Failed to load knowledge cards");
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction) => {
    if (isAnimating || currentCardIndex >= cards.length) return;

    const currentCard = cards[currentCardIndex];

    if (direction === "right") {
      // User liked this card, add to liked cards
      setLikedCards((prev) => [...prev, currentCard]);

      // Start loading details immediately
      setLoadingDetails(true);

      // Load detailed information in background
      const loadDetails = async () => {
        try {
          const response = await axios.post("/api/knowledge-dating/details", {
            title: currentCard.title,
            category: currentCard.category,
            description: currentCard.description,
          });

          if (response.data.success) {
            setDetailsData(response.data.details);
            // Show details after a brief delay for better UX
            setTimeout(() => {
              setShowDetails(true);
              setLoadingDetails(false);
            }, 800);
          }
        } catch (error) {
          console.error("Failed to load details:", error);
          toast.error("Failed to load detailed information");
          setLoadingDetails(false);
        }
      };

      // Start loading details
      loadDetails();
    }

    // Start card animation immediately
    setIsAnimating(true);
    setSwipeDirection(direction);

    // Move to next card after animation
    setTimeout(() => {
      setCurrentCardIndex((prev) => prev + 1);
      setSwipeDirection(null);
      setIsAnimating(false);
    }, 300);
  };

  const handleRefresh = () => {
    loadCards();
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setDetailsData(null);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const currentCard = cards[currentCardIndex];
  const hasMoreCards = currentCardIndex < cards.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading fresh knowledge cards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/workspace">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Knowledge Dating 💕
              </h1>
              <p className="text-gray-600">
                Swipe right on topics you want to explore, left to skip
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-sm">
              <Heart className="h-4 w-4 mr-1 text-pink-500" />
              {likedCards.length} Liked
            </Badge>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Refresh Cards
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>
              Card {Math.min(currentCardIndex + 1, cards.length)} of{" "}
              {cards.length}
            </span>
            <span>
              {Math.max(0, cards.length - currentCardIndex - 1)} remaining
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(
                  ((currentCardIndex + 1) / cards.length) * 100,
                  100
                )}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center px-6 pb-6">
        {hasMoreCards ? (
          <div className="relative w-full max-w-md">
            {/* Current Card */}
            <Card
              ref={cardRef}
              className={`relative w-full h-[500px] cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-xl ${
                swipeDirection === "right"
                  ? "translate-x-full rotate-12 opacity-0"
                  : swipeDirection === "left"
                  ? "-translate-x-full -rotate-12 opacity-0"
                  : ""
              }`}
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
              }}
            >
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-between mb-4">
                  <Badge className={getDifficultyColor(currentCard.difficulty)}>
                    {currentCard.difficulty}
                  </Badge>
                  {currentCard.trending && (
                    <Badge className="bg-orange-100 text-orange-800">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Trending
                    </Badge>
                  )}
                </div>
                <div className="text-6xl mb-4">{currentCard.emoji}</div>
                <CardTitle className="text-2xl font-bold text-white mb-2">
                  {currentCard.title}
                </CardTitle>
                <Badge variant="secondary" className="mb-4">
                  {currentCard.category}
                </Badge>
              </CardHeader>

              <CardContent className="text-center space-y-6">
                <p className="text-lg text-gray-100 leading-relaxed">
                  {currentCard.description}
                </p>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-yellow-200 font-medium">
                    {currentCard.hook}
                  </p>
                </div>

                <div className="flex items-center justify-center space-x-2 text-sm text-gray-200">
                  <Clock className="h-4 w-4" />
                  <span>Just generated</span>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-center space-x-8 mt-8">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full w-16 h-16 border-2 border-red-300 hover:bg-red-50 hover:border-red-400"
                onClick={() => handleSwipe("left")}
                disabled={isAnimating}
              >
                <X className="h-8 w-8 text-red-500" />
              </Button>

              <Button
                size="lg"
                className="rounded-full w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                onClick={() => handleSwipe("right")}
                disabled={isAnimating}
              >
                <Heart className="h-8 w-8 text-white" />
              </Button>
            </div>

            {/* Swipe Instructions */}
            <div className="text-center mt-6 space-y-2">
              <p className="text-gray-600 text-sm">
                <X className="h-4 w-4 inline text-red-500 mr-1" />
                Swipe left to skip
                <span className="mx-4">•</span>
                <Heart className="h-4 w-4 inline text-pink-500 mr-1" />
                Swipe right to learn more
              </p>
            </div>
          </div>
        ) : (
          // No more cards
          <Card className="w-full max-w-md text-center p-8">
            <CardContent className="space-y-6">
              <div className="text-6xl">🎉</div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  All caught up!
                </h3>
                <p className="text-gray-600">
                  You've swiped through all available knowledge cards.
                </p>
              </div>

              {likedCards.length > 0 && (
                <div className="bg-pink-50 rounded-lg p-4">
                  <h4 className="font-semibold text-pink-800 mb-2">
                    Your Liked Topics ({likedCards.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {likedCards.slice(0, 5).map((card, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {card.emoji} {card.title}
                      </Badge>
                    ))}
                    {likedCards.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{likedCards.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <Button onClick={handleRefresh} className="w-full">
                <Sparkles className="h-4 w-4 mr-2" />
                Get Fresh Cards
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Beautiful Loading Overlay */}
      {loadingDetails && (
        <div className="fixed inset-0 bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20 max-w-sm mx-4 text-center">
            <div className="relative mb-6">
              {/* Animated rings */}
              <div className="w-20 h-20 mx-auto relative">
                <div className="absolute inset-0 rounded-full border-4 border-pink-200"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-pink-500 animate-spin"></div>
                <div
                  className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin"
                  style={{
                    animationDirection: "reverse",
                    animationDuration: "1.5s",
                  }}
                ></div>
                <div
                  className="absolute inset-4 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin"
                  style={{ animationDuration: "2s" }}
                ></div>

                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-pink-500 animate-pulse" />
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Generating Deep Insights
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              AI is crafting personalized content just for you...
            </p>

            {/* Progress dots */}
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && detailsData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-hidden">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden mx-auto">
            {/* Modal Header */}
            <div className="p-6 border-b bg-gradient-to-r from-pink-500 to-purple-500 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{detailsData.title}</h2>
                  <p className="text-pink-100 mt-1">
                    Deep dive into this fascinating topic
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleCloseDetails}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Overview */}
              <div className="mb-8">
                <p className="text-lg text-gray-700 leading-relaxed">
                  {detailsData.overview}
                </p>
              </div>

              {/* Quick Facts */}
              {detailsData.quickFacts && (
                <div className="mb-8 bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Quick Facts
                  </h3>
                  <ul className="space-y-2">
                    {detailsData.quickFacts.map((fact, index) => (
                      <li
                        key={index}
                        className="text-blue-700 flex items-start"
                      >
                        <span className="text-blue-500 mr-2">•</span>
                        {fact}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Detailed Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {detailsData.sections?.map((section, index) => (
                  <Card key={index} className="h-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <span className="text-2xl mr-2">{section.emoji}</span>
                        {section.heading}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">
                        {section.content}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Related Topics */}
              {detailsData.relatedTopics && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Related Topics to Explore
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {detailsData.relatedTopics.map((topic, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-100"
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default KnowledgeDating;
