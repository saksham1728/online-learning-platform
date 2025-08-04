"use client"
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Badge } from '../../../../components/ui/badge'
import { Button } from '../../../../components/ui/button'
import { CheckCircle, XCircle, AlertCircle, Eye, EyeOff, ChevronDown, ChevronRight } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../../../components/ui/collapsible'

function ResultsDisplay({ attempt, quiz, showCorrectAnswers = true }) {
  const [showAnswers, setShowAnswers] = useState(showCorrectAnswers)
  const [expandedQuestions, setExpandedQuestions] = useState(new Set())

  if (!attempt || !quiz) return null

  const questions = quiz.questions || []
  const userAnswers = attempt.answers || []

  // Create a map of user answers by question ID
  const answerMap = userAnswers.reduce((acc, answer) => {
    acc[answer.questionId] = answer
    return acc
  }, {})

  const toggleQuestion = (questionId) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  const isCorrect = (question, userAnswer) => {
    if (!userAnswer) return false

    switch (question.type) {
      case 'multiple_choice':
      case 'true_false':
        return userAnswer.answer === question.correctAnswer
      case 'short_answer':
      case 'fill_blank':
        const userText = userAnswer.answer?.toLowerCase().trim()
        const correctText = question.correctAnswer?.toLowerCase().trim()
        return userText === correctText
      case 'multiple_select':
        const userAnswers = Array.isArray(userAnswer.answer) ? userAnswer.answer : []
        const correctAnswers = Array.isArray(question.correctAnswer) ? question.correctAnswer : []
        return userAnswers.length === correctAnswers.length && 
               userAnswers.every(ans => correctAnswers.includes(ans))
      default:
        return false
    }
  }

  const getQuestionIcon = (question, userAnswer) => {
    if (!userAnswer) {
      return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
    
    if (isCorrect(question, userAnswer)) {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    } else {
      return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getQuestionStatus = (question, userAnswer) => {
    if (!userAnswer) return 'unanswered'
    return isCorrect(question, userAnswer) ? 'correct' : 'incorrect'
  }

  const renderUserAnswer = (question, userAnswer) => {
    if (!userAnswer) {
      return <span className="text-gray-500 italic">Not answered</span>
    }

    switch (question.type) {
      case 'multiple_choice':
      case 'true_false':
      case 'short_answer':
      case 'fill_blank':
        return <span>{userAnswer.answer}</span>
      case 'multiple_select':
        const answers = Array.isArray(userAnswer.answer) ? userAnswer.answer : []
        return (
          <div className="space-y-1">
            {answers.map((answer, index) => (
              <div key={index}>• {answer}</div>
            ))}
          </div>
        )
      default:
        return <span>{JSON.stringify(userAnswer.answer)}</span>
    }
  }

  const renderCorrectAnswer = (question) => {
    switch (question.type) {
      case 'multiple_choice':
      case 'true_false':
      case 'short_answer':
      case 'fill_blank':
        return <span className="text-green-600 font-medium">{question.correctAnswer}</span>
      case 'multiple_select':
        const answers = Array.isArray(question.correctAnswer) ? question.correctAnswer : []
        return (
          <div className="space-y-1">
            {answers.map((answer, index) => (
              <div key={index} className="text-green-600 font-medium">• {answer}</div>
            ))}
          </div>
        )
      default:
        return <span className="text-green-600 font-medium">{JSON.stringify(question.correctAnswer)}</span>
    }
  }

  const correctCount = questions.filter(q => isCorrect(q, answerMap[q.id])).length
  const incorrectCount = questions.filter(q => answerMap[q.id] && !isCorrect(q, answerMap[q.id])).length
  const unansweredCount = questions.filter(q => !answerMap[q.id]).length

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Question Results</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnswers(!showAnswers)}
            >
              {showAnswers ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showAnswers ? 'Hide' : 'Show'} Answers
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{correctCount}</div>
              <div className="text-sm text-green-800">Correct</div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{incorrectCount}</div>
              <div className="text-sm text-red-800">Incorrect</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{unansweredCount}</div>
              <div className="text-sm text-gray-800">Unanswered</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Details */}
      <Card>
        <CardHeader>
          <CardTitle>Question by Question Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.map((question, index) => {
            const userAnswer = answerMap[question.id]
            const status = getQuestionStatus(question, userAnswer)
            const isExpanded = expandedQuestions.has(question.id)

            return (
              <Collapsible key={question.id}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-4 h-auto border rounded-lg hover:bg-gray-50"
                    onClick={() => toggleQuestion(question.id)}
                  >
                    <div className="flex items-center space-x-3">
                      {getQuestionIcon(question, userAnswer)}
                      <div className="text-left">
                        <div className="font-medium">Question {index + 1}</div>
                        <div className="text-sm text-gray-600 line-clamp-1">
                          {question.question}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={status === 'correct' ? 'default' : status === 'incorrect' ? 'destructive' : 'secondary'}
                      >
                        {status === 'correct' ? 'Correct' : status === 'incorrect' ? 'Incorrect' : 'Unanswered'}
                      </Badge>
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </div>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4">
                  <div className="space-y-4 mt-4 border-t pt-4">
                    {/* Question Text */}
                    <div>
                      <h4 className="font-medium mb-2">Question:</h4>
                      <p className="text-gray-700">{question.question}</p>
                    </div>

                    {/* Multiple Choice Options */}
                    {question.type === 'multiple_choice' && question.options && (
                      <div>
                        <h4 className="font-medium mb-2">Options:</h4>
                        <div className="space-y-1">
                          {question.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className={`p-2 rounded border ${
                                option === question.correctAnswer
                                  ? 'bg-green-50 border-green-200'
                                  : option === userAnswer?.answer
                                  ? 'bg-red-50 border-red-200'
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <span className="font-medium mr-2">
                                {String.fromCharCode(65 + optIndex)}.
                              </span>
                              {option}
                              {option === question.correctAnswer && (
                                <CheckCircle className="inline h-4 w-4 ml-2 text-green-500" />
                              )}
                              {option === userAnswer?.answer && option !== question.correctAnswer && (
                                <XCircle className="inline h-4 w-4 ml-2 text-red-500" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* User Answer */}
                    <div>
                      <h4 className="font-medium mb-2">Your Answer:</h4>
                      <div className={`p-3 rounded-lg ${
                        status === 'correct' ? 'bg-green-50' : 
                        status === 'incorrect' ? 'bg-red-50' : 'bg-gray-50'
                      }`}>
                        {renderUserAnswer(question, userAnswer)}
                      </div>
                    </div>

                    {/* Correct Answer */}
                    {showAnswers && status !== 'correct' && (
                      <div>
                        <h4 className="font-medium mb-2">Correct Answer:</h4>
                        <div className="p-3 bg-green-50 rounded-lg">
                          {renderCorrectAnswer(question)}
                        </div>
                      </div>
                    )}

                    {/* Explanation */}
                    {showAnswers && question.explanation && (
                      <div>
                        <h4 className="font-medium mb-2">Explanation:</h4>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-blue-800">{question.explanation}</p>
                        </div>
                      </div>
                    )}

                    {/* Points */}
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Points: {question.points || 1}</span>
                      <span>Difficulty: {question.difficulty}</span>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}

export default ResultsDisplay