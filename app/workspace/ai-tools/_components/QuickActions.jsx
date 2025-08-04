"use client"
import React from 'react'
import Link from 'next/link'
import { Button } from '../../../../components/ui/button'
import { Plus, Play, BarChart3, BookOpen } from 'lucide-react'

function QuickActions() {
  const quickActions = [
    {
      title: 'Create Quiz',
      description: 'Generate a new quiz instantly',
      icon: Plus,
      href: '/workspace/ai-tools/quiz-generator',
      variant: 'default'
    },
    {
      title: 'Start Practice',
      description: 'Begin a practice session',
      icon: Play,
      href: '/workspace/ai-tools/practice',
      variant: 'outline'
    },
    {
      title: 'View Analytics',
      description: 'Check your performance',
      icon: BarChart3,
      href: '/workspace/ai-tools/analytics',
      variant: 'outline'
    },
    {
      title: 'My Quizzes',
      description: 'Manage your quizzes',
      icon: BookOpen,
      href: '/workspace/ai-tools/my-quizzes',
      variant: 'outline'
    }
  ]

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <Link key={index} href={action.href}>
            <Button 
              variant={action.variant} 
              className="w-full h-auto p-4 flex flex-col items-center space-y-2 hover:scale-105 transition-transform"
            >
              <action.icon className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">{action.title}</div>
                <div className="text-xs opacity-75">{action.description}</div>
              </div>
            </Button>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default QuickActions