import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Badge } from '../../../../components/ui/badge'
import { Progress } from '../../../../components/ui/progress'
import { TrendingUp, TrendingDown, Minus, Award, Target, Clock } from 'lucide-react'

function PersonalDashboard({ data }) {
  const { overview, recentAttempts } = data

  // Calculate trends (simplified - would need historical data for real trends)
  const getTrendIcon = (current, previous = 0) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPerformanceLevel = (score) => {
    if (score >= 90) return { level: 'Expert', color: 'bg-green-100 text-green-800' }
    if (score >= 80) return { level: 'Proficient', color: 'bg-blue-100 text-blue-800' }
    if (score >= 70) return { level: 'Developing', color: 'bg-yellow-100 text-yellow-800' }
    return { level: 'Beginner', color: 'bg-red-100 text-red-800' }
  }

  const performanceLevel = getPerformanceLevel(overview.averageScore)

  // Calculate recent performance trend
  const recentScores = recentAttempts.slice(0, 5).map(attempt => 
    Math.round((attempt.score / attempt.maxScore) * 100)
  )
  const recentAverage = recentScores.length > 0 ? 
    Math.round(recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Award className="h-6 w-6 text-purple-500" />
          <span>Personal Dashboard</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Performance Level */}
        <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {overview.averageScore}%
          </div>
          <Badge className={performanceLevel.color}>
            {performanceLevel.level}
          </Badge>
          <div className="text-sm text-gray-600 mt-2">Overall Performance</div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Quiz Accuracy</span>
            </div>
            <div className="text-xl font-bold text-blue-600">
              {overview.averageScore}%
            </div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Clock className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Practice Accuracy</span>
            </div>
            <div className="text-xl font-bold text-green-600">
              {overview.practiceAccuracy}%
            </div>
          </div>
        </div>

        {/* Recent Performance */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center justify-between">
            <span>Recent Performance</span>
            {getTrendIcon(recentAverage, overview.averageScore)}
          </h3>
          
          {recentScores.length > 0 ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Last 5 attempts average</span>
                <span className={`font-semibold ${getScoreColor(recentAverage)}`}>
                  {recentAverage}%
                </span>
              </div>
              <Progress value={recentAverage} className="h-2" />
              
              {/* Score trend visualization */}
              <div className="flex space-x-1 mt-3">
                {recentScores.map((score, index) => (
                  <div
                    key={index}
                    className="flex-1 bg-gray-200 rounded-full overflow-hidden"
                    style={{ height: '20px' }}
                  >
                    <div
                      className={`h-full rounded-full ${
                        score >= 80 ? 'bg-green-500' : 
                        score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Oldest</span>
                <span>Most Recent</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <Target className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No recent quiz attempts</p>
              <p className="text-xs">Take a quiz to see your performance trend</p>
            </div>
          )}
        </div>

        {/* Activity Summary */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-700">{overview.totalAttempts}</div>
            <div className="text-xs text-gray-500">Total Attempts</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-700">{overview.totalPracticeSessions}</div>
            <div className="text-xs text-gray-500">Practice Sessions</div>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="font-medium text-sm mb-2">Quick Insights</h4>
          <div className="space-y-1 text-xs text-gray-600">
            {overview.averageScore >= 90 && (
              <div>🎉 Excellent performance! You're mastering the material.</div>
            )}
            {overview.averageScore >= 70 && overview.averageScore < 90 && (
              <div>👍 Good progress! Keep practicing to reach expert level.</div>
            )}
            {overview.averageScore < 70 && (
              <div>📚 Focus on fundamentals. More practice will help improve your scores.</div>
            )}
            {overview.totalPracticeSessions > overview.totalAttempts && (
              <div>🎯 Great practice habits! Your preparation shows dedication.</div>
            )}
            {overview.totalAttempts === 0 && (
              <div>🚀 Ready to start? Take your first quiz to establish your baseline.</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PersonalDashboard