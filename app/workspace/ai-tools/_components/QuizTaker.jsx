"use client"
import React, { useState, useEffect } from 'react'
import { Button } from '../../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Progress } from '../../../../components/ui/progress'
import { ChevronLeft, ChevronRight, Flag, Send } from 'lucide-react'
import QuestionRenderer from './QuestionRenderer'
import axios from 'axios'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'

function QuizTaker({ quiz, session, onComplete, onSessionUpdate }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useUser()

  const questions = quiz.questions || []
  const totalQuestions = questions.length
  const progress = ((currentQuestion + 1) / totalQuestions) * 100

  useEffect(() => {
    // Update session when current question changes
    onSessionUpdate({
      ...session,
      currentQuestion,
      answers: Object.values(answers)
    })
  }, [currentQuestion, answers])

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        answer,
        timestamp: new Date().toISOString()
      }
    }))
  }

  const toggleFlag = (questionIndex) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionIndex)) {
        newSet.delete(questionIndex)
      } else {
        newSet.add(questionIndex)
      }
      return newSet
    })
  }

  const goToQuestion = (index) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentQuestion(index)
    }
  }

  const calculateScore = () => {
    let correctAnswers = 0
    let totalPoints = 0

    questions.forEach(question => {
      const userAnswer = answers[question.id]
      totalPoints += question.points || 1

      if (userAnswer) {
        if (question.type === 'multiple_choice' || question.type === 'true_false') {
          if (userAnswer.answer === question.correctAnswer) {
            correctAnswers += question.points || 1
          }
        } else if (question.type === 'short_answer' || question.type === 'fill_blank') {
          // Simple string comparison for now - could be enhanced with fuzzy matching
          const userAnswerText = userAnswer.answer?.toLowerCase().trim()
          const correctAnswerText = question.correctAnswer?.toLowerCase().trim()
          if (userAnswerText === correctAnswerText) {
            correctAnswers += question.points || 1
          }
        }
      }
    })

    return {
      score: correctAnswers,
      maxScore: totalPoints,
      percentage: totalPoints > 0 ? Math.round((correctAnswers / totalPoints) * 100) : 0
    }
  }

  const submitQuiz = async () => {
    if (!user) {
      toast.error('Please sign in to submit quiz')
      return
    }

    // Check if all questions are answered
    const unansweredQuestions = questions.filter(q => !answers[q.id])
    if (unansweredQuestions.length > 0) {
      const proceed = confirm(
        `You have ${unansweredQuestions.length} unanswered questions. Do you want to submit anyway?`
      )
      if (!proceed) return
    }

    try {
      setIsSubmitting(true)
      
      const results = calculateScore()
      const attemptData = {
        attemptId: uuidv4(),
        quizId: quiz.quizId,
        userEmail: user.primaryEmailAddress?.emailAddress,
        answers: Object.values(answers),
        score: results.score,
        maxScore: results.maxScore,
        startTime: session.startTime.toISOString(),
        endTime: new Date().toISOString(),
        isCompleted: true,
        timeTaken: Math.floor((new Date() - session.startTime) / 1000) // in seconds
      }

      const response = await axios.post('/api/quiz-attempts', attemptData)
      
      if (response.data.success) {
        toast.success('Quiz submitted successfully!')
        onComplete({
          ...results,
          attemptId: attemptData.attemptId,
          timeTaken: attemptData.timeTaken
        })
      } else {
        throw new Error('Failed to submit quiz')
      }
    } catch (error) {
      console.error('Submit quiz error:', error)
      toast.error('Failed to submit quiz. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!questions.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No questions available for this quiz.</p>
      </div>
    )
  }

  const currentQuestionData = questions[currentQuestion]

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{currentQuestion + 1} of {totalQuestions}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Question Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            {questions.map((_, index) => (
              <Button
                key={index}
                variant={currentQuestion === index ? "default" : answers[questions[index].id] ? "outline" : "ghost"}
                size="sm"
                onClick={() => goToQuestion(index)}
                className={`relative ${flaggedQuestions.has(index) ? 'ring-2 ring-yellow-400' : ''}`}
              >
                {index + 1}
                {flaggedQuestions.has(index) && (
                  <Flag className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500 fill-current" />
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Question */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Question {currentQuestion + 1}</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleFlag(currentQuestion)}
                className={flaggedQuestions.has(currentQuestion) ? 'bg-yellow-100' : ''}
              >
                <Flag className={`h-4 w-4 ${flaggedQuestions.has(currentQuestion) ? 'text-yellow-600 fill-current' : ''}`} />
              </Button>
              <span className="text-sm text-gray-500">
                {currentQuestionData.points || 1} point{(currentQuestionData.points || 1) !== 1 ? 's' : ''}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <QuestionRenderer
            question={currentQuestionData}
            answer={answers[currentQuestionData.id]?.answer}
            onAnswerChange={(answer) => handleAnswerChange(currentQuestionData.id, answer)}
          />
        </CardContent>
      </Card>

      {/* Navigation and Submit */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => goToQuestion(currentQuestion - 1)}
          disabled={currentQuestion === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex space-x-2">
          {currentQuestion === totalQuestions - 1 ? (
            <Button
              onClick={submitQuiz}
              disabled={isSubmitting}
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Quiz
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={() => goToQuestion(currentQuestion + 1)}
              disabled={currentQuestion === totalQuestions - 1}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* Quiz Summary */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {Object.keys(answers).length}
              </div>
              <div className="text-sm text-gray-600">Answered</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {flaggedQuestions.size}
              </div>
              <div className="text-sm text-gray-600">Flagged</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {totalQuestions - Object.keys(answers).length}
              </div>
              <div className="text-sm text-gray-600">Remaining</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {Math.round(progress)}%
              </div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default QuizTaker