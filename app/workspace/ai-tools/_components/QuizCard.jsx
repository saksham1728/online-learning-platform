import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '../../../../components/ui/button'
import { Badge } from '../../../../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { 
  Play, 
  Edit, 
  Copy, 
  Trash2, 
  MoreVertical, 
  Clock, 
  Target, 
  FileQuestion,
  Calendar,
  Users
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../../components/ui/dropdown-menu'

function QuizCard({ quiz, onDelete, onDuplicate }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    await onDelete(quiz.quizId)
    setIsDeleting(false)
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2">{quiz.title}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/workspace/ai-tools/quiz-editor/${quiz.quizId}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Quiz
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(quiz)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {quiz.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{quiz.description}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quiz Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <FileQuestion className="h-4 w-4 text-blue-500" />
            <span>{quiz.questions?.length || 0} Questions</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-green-500" />
            <span>{quiz.settings?.timeLimit || 30} min</span>
          </div>
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-purple-500" />
            <span>{quiz.settings?.passingScore || 70}% to pass</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-orange-500" />
            <span>0 attempts</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <Badge className={getDifficultyColor(quiz.settings?.difficulty)}>
            {quiz.settings?.difficulty || 'intermediate'}
          </Badge>
          <Badge variant="outline">{quiz.topic}</Badge>
        </div>

        {/* Date */}
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <Calendar className="h-3 w-3" />
          <span>Created {formatDate(quiz.createdAt)}</span>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-2">
          <Link href={`/workspace/ai-tools/quiz-take/${quiz.quizId}`} className="flex-1">
            <Button className="w-full" size="sm">
              <Play className="h-4 w-4 mr-2" />
              Take Quiz
            </Button>
          </Link>
          <Link href={`/workspace/ai-tools/quiz-editor/${quiz.quizId}`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default QuizCard