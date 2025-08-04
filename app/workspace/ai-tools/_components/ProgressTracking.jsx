import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Badge } from '../../../../components/ui/badge'
import { Progress } from '../../../../components/ui/progress'
import { TrendingUp, Target, BookOpen, Award, Calendar, BarChart3 } from 'lucide-react'

function ProgressTracking({ data }) {
  const { overview, recentAttempts, practiceStats } = data

  // Calculate learning streaks and patterns
  const calculateStreak = () => {
    // This would be more sophisticated with real date-based data
    const recentActivity = [...recentAttempts, ...practiceStats].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )
    return Math.min(recentActivity.length, 7) // Simplified streak calculation
  }

  const currentStreak = calculateStreak()

  // Calculate improvement trend
  const getImprovementTrend = () => {
    if (recentAttempts.length < 2) return { trend: 'neutral', change: 0 }
    
    const recent = recentAttempts.slice(0, 3)
    const older = recentAttempts.slice(3, 6)
    
    const recentAvg = recent.reduce((sum, attempt) => 
      sum + (attempt.score / attempt.maxScore) * 100, 0) / recent.length
    const olderAvg = older.length > 0 ? 
      older.reduce((sum, attempt) => sum + (attempt.score / attempt.maxScore) * 100, 0) / older.length : recentAvg
    
    const change = Math.round(recentAvg - olderAvg)
    
    if (change > 5) return { trend: 'improving', change }
    if (change < -5) return { trend: 'declining', change }
    return { trend: 'stable', change }
  }

  const improvement = getImprovementTrend()

  // Learning goals and milestones
  const learningGoals = [
    {
      title: 'Quiz Master',
      description: 'Take 10 quizzes',
      current: overview.totalAttempts,
      target: 10,
      icon: Target,
      color: 'blue'
    },
    {
      title: 'Practice Champion',
      description: 'Complete 20 practice sessions',
      current: overview.totalPracticeSessions,
      target: 20,
      icon: BookOpen,
      color: 'green'
    },
    {
      title: 'High Achiever',
      description: 'Maintain 85% average',
      current: overview.averageScore,
      target: 85,
      icon: Award,
      color: 'purple'
    },
    {
      title: 'Consistent Learner',
      description: '7-day learning streak',
      current: currentStreak,
      target: 7,
      icon: Calendar,
      color: 'orange'
    }
  ]

  const getGoalColor = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      purple: 'bg-purple-100 text-purple-800',
      orange: 'bg-orange-100 text-orange-800'
    }
    return colors[color] || colors.blue
  }

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'declining':
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
      default:
        return <BarChart3 className="h-4 w-4 text-gray-500" />
    }
  }

  const getTrendMessage = (trend, change) => {
    switch (trend) {
      case 'improving':
        return `+${change}% improvement in recent attempts`
      case 'declining':
        return `${change}% decline in recent attempts`
      default:
        return 'Performance is stable'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-green-500" />
          <span>Progress Tracking</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Performance Trend */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Performance Trend</h3>
            {getTrendIcon(improvement.trend)}
          </div>
          <p className="text-sm text-gray-600 mb-3">
            {getTrendMessage(improvement.trend, improvement.change)}
          </p>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{overview.averageScore}%</div>
              <div className="text-xs text-gray-500">Overall Average</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{currentStreak}</div>
              <div className="text-xs text-gray-500">Day Streak</div>
            </div>
          </div>
        </div>

        {/* Learning Goals */}
        <div>
          <h3 className="font-semibold mb-4">Learning Goals</h3>
          <div className="space-y-4">
            {learningGoals.map((goal, index) => {
              const progress = Math.min((goal.current / goal.target) * 100, 100)
              const isCompleted = goal.current >= goal.target
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <goal.icon className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-sm">{goal.title}</span>
                      {isCompleted && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          Completed!
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-gray-600">
                      {goal.current}/{goal.target}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-gray-500">{goal.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Weekly Activity */}
        <div>
          <h3 className="font-semibold mb-3">Recent Activity</h3>
          <div className="grid grid-cols-7 gap-1">
            {[...Array(7)].map((_, index) => {
              // Simplified activity visualization
              const hasActivity = index < currentStreak
              return (
                <div
                  key={index}
                  className={`h-8 rounded ${
                    hasActivity ? 'bg-green-200' : 'bg-gray-100'
                  }`}
                  title={`Day ${index + 1}`}
                />
              )
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>7 days ago</span>
            <span>Today</span>
          </div>
        </div>

        {/* Achievements */}
        <div>
          <h3 className="font-semibold mb-3">Recent Achievements</h3>
          <div className="space-y-2">
            {overview.totalAttempts >= 1 && (
              <div className="flex items-center space-x-2 text-sm">
                <Award className="h-4 w-4 text-yellow-500" />
                <span>First Quiz Completed</span>
              </div>
            )}
            {overview.totalPracticeSessions >= 1 && (
              <div className="flex items-center space-x-2 text-sm">
                <BookOpen className="h-4 w-4 text-blue-500" />
                <span>Practice Mode Unlocked</span>
              </div>
            )}
            {overview.averageScore >= 80 && (
              <div className="flex items-center space-x-2 text-sm">
                <Target className="h-4 w-4 text-green-500" />
                <span>High Achiever (80%+ average)</span>
              </div>
            )}
            {currentStreak >= 3 && (
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="h-4 w-4 text-purple-500" />
                <span>Learning Streak ({currentStreak} days)</span>
              </div>
            )}
            
            {/* Show message if no achievements yet */}
            {overview.totalAttempts === 0 && overview.totalPracticeSessions === 0 && (
              <div className="text-center py-4 text-gray-500">
                <Award className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Complete activities to earn achievements</p>
              </div>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="font-medium text-sm mb-2">Suggested Next Steps</h4>
          <div className="space-y-1 text-xs text-gray-600">
            {overview.totalAttempts === 0 && (
              <div>🎯 Take your first quiz to establish your baseline</div>
            )}
            {overview.totalPracticeSessions === 0 && overview.totalAttempts > 0 && (
              <div>📚 Try practice mode to reinforce your learning</div>
            )}
            {overview.averageScore < 70 && (
              <div>💪 Focus on practice to improve your scores</div>
            )}
            {currentStreak === 0 && (
              <div>🔥 Start a learning streak by studying daily</div>
            )}
            {overview.averageScore >= 80 && currentStreak >= 3 && (
              <div>🌟 Great progress! Consider exploring advanced topics</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ProgressTracking