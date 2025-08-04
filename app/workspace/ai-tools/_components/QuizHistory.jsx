import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Badge } from '../../../../components/ui/badge'
import { Button } from '../../../../components/ui/button'
import { Clock, Calendar, Trophy, Eye, RotateCcw } from 'lucide-react'
import Link from 'next/link'

function QuizHistory({ attempts }) {
  const formatTime = (seconds) => {
    if (!seconds) return 'N/A'
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getScoreColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 80) return 'text-blue-600'
    if (percentage >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadge = (score, maxScore) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 90) return { text: 'Excellent', color: 'bg-green-100 text-green-800' }
    if (percentage >= 80) return { text: 'Good', color: 'bg-blue-100 text-blue-800' }
    if (percentage >= 70) return { text: 'Pass', color: 'bg-yellow-100 text-yellow-800' }
    return { text: 'Needs Work', color: 'bg-red-100 text-red-800' }
  }

  if (!attempts || attempts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-6 w-6 text-blue-500" />
            <span>Quiz History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Quiz History</h3>
            <p className="text-gray-500 mb-4">You haven't taken any quizzes yet</p>
            <Link href="/workspace/ai-tools/quiz-generator">
              <Button>Create Your First Quiz</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-6 w-6 text-blue-500" />
            <span>Quiz History</span>
          </div>
          <Badge variant="outline">{attempts.length} attempts</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {attempts.map((attempt, index) => {
            const percentage = Math.round((attempt.score / attempt.maxScore) * 100)
            const scoreBadge = getScoreBadge(attempt.score, attempt.maxScore)
            
            return (
              <div key={attempt.attemptId || index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {formatDate(attempt.createdAt)}
                      </span>
                    </div>
                  </div>
                  <Badge className={scoreBadge.color}>
                    {scoreBadge.text}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className={`text-lg font-bold ${getScoreColor(attempt.score, attempt.maxScore)}`}>
                      {percentage}%
                    </div>
                    <div className="text-xs text-gray-600">Score</div>
                  </div>
                  
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-gray-700">
                      {attempt.score}/{attempt.maxScore}
                    </div>
                    <div className="text-xs text-gray-600">Points</div>
                  </div>
                  
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="text-lg font-bold text-green-600">
                      {formatTime(attempt.timeTaken)}
                    </div>
                    <div className="text-xs text-gray-600">Time</div>
                  </div>
                  
                  <div className="text-center p-2 bg-purple-50 rounded">
                    <div className="text-lg font-bold text-purple-600">
                      {attempt.isCompleted ? 'Complete' : 'Incomplete'}
                    </div>
                    <div className="text-xs text-gray-600">Status</div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Attempt ID: {attempt.attemptId?.slice(-8) || 'N/A'}
                  </div>
                  <div className="flex space-x-2">
                    <Link href={`/workspace/ai-tools/quiz-results/${attempt.attemptId}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Results
                      </Button>
                    </Link>
                    <Link href={`/workspace/ai-tools/quiz-take/${attempt.quizId}`}>
                      <Button variant="outline" size="sm">
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Retake
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {attempts.length >= 10 && (
          <div className="text-center mt-6 pt-4 border-t">
            <Button variant="outline">
              View All History
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default QuizHistory