"use client"
import React, { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../../../../components/ui/button'
import QuizGeneratorForm from '../_components/QuizGeneratorForm'
import QuestionPreview from '../_components/QuestionPreview'

function QuizGenerator() {
  const [generatedQuestions, setGeneratedQuestions] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [quizSettings, setQuizSettings] = useState(null)

  const handleQuestionsGenerated = (questions, settings) => {
    setGeneratedQuestions(questions)
    setQuizSettings(settings)
  }

  const handleGenerationStart = () => {
    setIsGenerating(true)
  }

  const handleGenerationEnd = () => {
    setIsGenerating(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/workspace/ai-tools">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to AI Tools
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Quiz Generator</h1>
          <p className="text-gray-600">Create intelligent quizzes using AI for any topic</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quiz Generation Form */}
        <div className="space-y-6">
          <QuizGeneratorForm
            onQuestionsGenerated={handleQuestionsGenerated}
            onGenerationStart={handleGenerationStart}
            onGenerationEnd={handleGenerationEnd}
            isGenerating={isGenerating}
          />
        </div>

        {/* Questions Preview */}
        <div className="space-y-6">
          <QuestionPreview
            questions={generatedQuestions}
            quizSettings={quizSettings}
            isGenerating={isGenerating}
          />
        </div>
      </div>
    </div>
  )
}

export default QuizGenerator