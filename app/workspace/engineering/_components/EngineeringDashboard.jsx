"use client"
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Button } from '../../../../components/ui/button'
import { Badge } from '../../../../components/ui/badge'
import { 
  FileText, 
  Code, 
  Calculator, 
  Zap, 
  BookOpen, 
  TrendingUp,
  Upload,
  Briefcase,
  Mic,
  TestTube,
  Cpu,
  Settings,
  Target,
  Award
} from 'lucide-react'
import Link from 'next/link'

function EngineeringDashboard({ selectedBranch, userBranches }) {
  const [activeTab, setActiveTab] = useState('overview')

  const getFeaturesByBranch = (branchCode) => {
    const commonFeatures = [
      {
        id: 'question-papers',
        title: 'Previous Year Papers',
        description: 'Access 10+ years of question papers',
        icon: FileText,
        color: 'bg-blue-500',
        href: `/workspace/engineering/question-papers?branch=${branchCode}`,
        available: true
      },
      {
        id: 'mock-exams',
        title: 'Mock Exams',
        description: 'AI-generated mock exams based on patterns',
        icon: Target,
        color: 'bg-green-500',
        href: `/workspace/engineering/mock-exams?branch=${branchCode}`,
        available: true
      },
      {
        id: 'pdf-reader',
        title: 'PDF Voice Reader',
        description: 'Listen to your study materials',
        icon: Mic,
        color: 'bg-purple-500',
        href: `/workspace/engineering/pdf-reader`,
        available: true
      },
      {
        id: 'career-services',
        title: 'Career Services',
        description: 'Resume analysis & job recommendations',
        icon: Briefcase,
        color: 'bg-orange-500',
        href: `/workspace/engineering/career`,
        available: true
      }
    ]

    const branchSpecificFeatures = {
      'CSE': [
        {
          id: 'coding-ide',
          title: 'Coding IDE',
          description: 'Practice coding with multi-language support',
          icon: Code,
          color: 'bg-indigo-500',
          href: `/workspace/engineering/ide`,
          available: true
        },
        {
          id: 'algorithm-visualizer',
          title: 'Algorithm Visualizer',
          description: 'Interactive algorithm demonstrations',
          icon: Cpu,
          color: 'bg-cyan-500',
          href: `/workspace/engineering/algorithms`,
          available: true
        },
        {
          id: 'system-design',
          title: 'System Design Tools',
          description: 'Design distributed systems',
          icon: Settings,
          color: 'bg-gray-500',
          href: `/workspace/engineering/system-design`,
          available: true
        }
      ],
      'IT': [
        {
          id: 'coding-ide',
          title: 'Coding IDE',
          description: 'Practice coding with multi-language support',
          icon: Code,
          color: 'bg-indigo-500',
          href: `/workspace/engineering/ide`,
          available: true
        },
        {
          id: 'database-tools',
          title: 'Database Tools',
          description: 'ER diagrams and SQL practice',
          icon: Calculator,
          color: 'bg-teal-500',
          href: `/workspace/engineering/database`,
          available: true
        }
      ],
      'ECE': [
        {
          id: 'circuit-simulator',
          title: 'Circuit Simulator',
          description: 'Design and simulate electronic circuits',
          icon: Zap,
          color: 'bg-yellow-500',
          href: `/workspace/engineering/circuits`,
          available: true
        },
        {
          id: 'signal-processing',
          title: 'Signal Processing Lab',
          description: 'FFT, filtering, and signal analysis',
          icon: TrendingUp,
          color: 'bg-pink-500',
          href: `/workspace/engineering/signals`,
          available: true
        }
      ],
      'EEE': [
        {
          id: 'power-systems',
          title: 'Power System Tools',
          description: 'Power flow and stability analysis',
          icon: Zap,
          color: 'bg-red-500',
          href: `/workspace/engineering/power`,
          available: true
        }
      ],
      'MECH': [
        {
          id: 'thermodynamics',
          title: 'Thermodynamics Calculator',
          description: 'Cycle analysis and calculations',
          icon: Calculator,
          color: 'bg-orange-600',
          href: `/workspace/engineering/thermo`,
          available: true
        },
        {
          id: 'cad-viewer',
          title: 'CAD Viewer',
          description: 'View and analyze 3D models',
          icon: TestTube,
          color: 'bg-gray-600',
          href: `/workspace/engineering/cad`,
          available: true
        }
      ],
      'CIVIL': [
        {
          id: 'structural-analysis',
          title: 'Structural Analysis',
          description: 'Beam and truss analysis tools',
          icon: Calculator,
          color: 'bg-green-600',
          href: `/workspace/engineering/structural`,
          available: true
        }
      ]
    }

    return [...commonFeatures, ...(branchSpecificFeatures[branchCode] || [])]
  }

  const features = getFeaturesByBranch(selectedBranch?.branchCode)

  const stats = [
    { label: 'Question Papers', value: '500+', icon: FileText, color: 'text-blue-600' },
    { label: 'Mock Exams Taken', value: '0', icon: Target, color: 'text-green-600' },
    { label: 'Study Hours', value: '0h', icon: BookOpen, color: 'text-purple-600' },
    { label: 'Skill Score', value: '0%', icon: Award, color: 'text-orange-600' }
  ]

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-gray-100`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Welcome Message */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500 rounded-lg text-white">
              <BookOpen className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-blue-900">
                Welcome to {selectedBranch?.branchName}!
              </h2>
              <p className="text-blue-700 mt-1">
                Access specialized tools, previous year papers, and AI-powered study resources tailored for your branch.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Available Tools & Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${feature.color} text-white`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    {feature.available && (
                      <Badge variant="outline" className="text-xs mt-1">
                        Available
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm">{feature.description}</p>
                <Link href={feature.href}>
                  <Button className="w-full" disabled={!feature.available}>
                    {feature.available ? 'Launch Tool' : 'Coming Soon'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No recent activity</p>
            <p className="text-sm">Start using the tools above to see your activity here</p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <Upload className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-green-900">Upload Resume</h3>
              <p className="text-sm text-green-700 mb-4">Get personalized job recommendations</p>
              <Link href="/workspace/engineering/career">
                <Button variant="outline" size="sm">
                  Upload Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <Target className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-purple-900">Take Mock Exam</h3>
              <p className="text-sm text-purple-700 mb-4">Test your knowledge with AI-generated exams</p>
              <Link href={`/workspace/engineering/mock-exams?branch=${selectedBranch?.branchCode}`}>
                <Button variant="outline" size="sm">
                  Start Exam
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <FileText className="h-8 w-8 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold text-orange-900">Question Papers</h3>
              <p className="text-sm text-orange-700 mb-4">Access previous year papers</p>
              <Link href={`/workspace/engineering/question-papers?branch=${selectedBranch?.branchCode}`}>
                <Button variant="outline" size="sm">
                  Browse Papers
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default EngineeringDashboard