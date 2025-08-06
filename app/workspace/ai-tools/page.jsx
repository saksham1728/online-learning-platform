"use client"
import React from 'react'
import { Brain, FileQuestion, Target, TrendingUp, Zap, BookOpen } from 'lucide-react'
import ToolCard from './_components/ToolCard'
import QuickActions from './_components/QuickActions'

function AITools() {
  const aiTools = [
    {
      id: 'quiz-generator',
      title: 'Quiz Generator',
      description: 'Generate intelligent quizzes and assessments using AI for any topic or course content.',
      icon: FileQuestion,
      color: 'bg-blue-500',
      href: '/workspace/ai-tools/quiz-generator',
      features: ['Multiple question types', 'Difficulty levels', 'Instant feedback', 'Performance tracking']
    },
    {
      id: 'practice-mode',
      title: 'Practice Mode',
      description: 'Practice with unlimited AI-generated questions on specific topics to reinforce learning.',
      icon: Target,
      color: 'bg-green-500',
      href: '/workspace/ai-tools/practice',
      features: ['Unlimited questions', 'Topic-focused', 'Immediate explanations', 'Progress tracking']
    },
    {
      id: 'analytics',
      title: 'Performance Analytics',
      description: 'Track your quiz performance and identify areas for improvement with detailed analytics.',
      icon: TrendingUp,
      color: 'bg-purple-500',
      href: '/workspace/ai-tools/analytics',
      features: ['Performance insights', 'Progress tracking', 'Weakness identification', 'Study recommendations']
    },
    {
      id: 'question-bank',
      title: 'Question Bank',
      description: 'Manage and organize your custom question collections for reuse across multiple quizzes.',
      icon: BookOpen,
      color: 'bg-orange-500',
      href: '/workspace/ai-tools/question-bank',
      features: ['Question organization', 'Tagging system', 'Reusable templates', 'Performance tracking']
    }
  ]

  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-6 py-4 sm:py-6">
      {/* Header */}
      <div className="text-center space-y-3 sm:space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          <h1 className="text-2xl sm:text-4xl font-bold">AI Tools</h1>
        </div>
        <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
          Enhance your learning experience with powerful AI-driven tools for quiz generation, practice, and performance analysis.
        </p>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {aiTools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  )
}

export default AITools