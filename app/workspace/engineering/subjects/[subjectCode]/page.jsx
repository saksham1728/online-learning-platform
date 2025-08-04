"use client"
import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, BookOpen, FileText, Video, Code, Target, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../../../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card'
import { Badge } from '../../../../../components/ui/badge'
import { Progress } from '../../../../../components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../../components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../../../../components/ui/accordion'
import { useUser } from '@clerk/nextjs'
import axios from 'axios'
import { toast } from 'sonner'

function SubjectContent() {
  const params = useParams()
  const { subjectCode } = params
  const [subject, setSubject] = useState(null)
  const [userBranch, setUserBranch] = useState(null)
  const [progress, setProgress] = useState({})
  const [loading, setLoading] = useState(true)
  const { user } = useUser()

  // Sample content structure - in real app, this would come from database
  const sampleContent = {
    modules: [
      {
        id: 1,
        title: "Introduction and Fundamentals",
        description: "Basic concepts and foundational knowledge",
        estimatedHours: 8,
        topics: [
          {
            id: 1,
            title: "Course Overview",
            type: "reading",
            duration: "30 min",
            completed: true,
            resources: [
              { type: "pdf", title: "Course Syllabus", url: "#" },
              { type: "video", title: "Introduction Video", url: "#" }
            ]
          },
          {
            id: 2,
            title: "Basic Concepts",
            type: "reading",
            duration: "45 min",
            completed: false,
            resources: [
              { type: "pdf", title: "Chapter 1 Notes", url: "#" },
              { type: "quiz", title: "Concept Check Quiz", url: "#" }
            ]
          },
          {
            id: 3,
            title: "Historical Background",
            type: "video",
            duration: "25 min",
            completed: false,
            resources: [
              { type: "video", title: "History Lecture", url: "#" },
              { type: "pdf", title: "Timeline Reference", url: "#" }
            ]
          }
        ]
      },
      {
        id: 2,
        title: "Core Principles",
        description: "Deep dive into fundamental principles",
        estimatedHours: 12,
        topics: [
          {
            id: 4,
            title: "Principle 1: Foundation",
            type: "reading",
            duration: "60 min",
            completed: false,
            resources: [
              { type: "pdf", title: "Detailed Notes", url: "#" },
              { type: "practice", title: "Practice Problems", url: "#" }
            ]
          },
          {
            id: 5,
            title: "Principle 2: Applications",
            type: "coding",
            duration: "90 min",
            completed: false,
            resources: [
              { type: "code", title: "Code Examples", url: "#" },
              { type: "assignment", title: "Programming Task", url: "#" }
            ]
          }
        ]
      },
      {
        id: 3,
        title: "Advanced Topics",
        description: "Advanced concepts and real-world applications",
        estimatedHours: 15,
        topics: [
          {
            id: 6,
            title: "Advanced Theory",
            type: "reading",
            duration: "75 min",
            completed: false,
            resources: [
              { type: "pdf", title: "Advanced Concepts", url: "#" },
              { type: "research", title: "Research Papers", url: "#" }
            ]
          },
          {
            id: 7,
            title: "Case Studies",
            type: "project",
            duration: "120 min",
            completed: false,
            resources: [
              { type: "project", title: "Industry Case Study", url: "#" },
              { type: "presentation", title: "Project Guidelines", url: "#" }
            ]
          }
        ]
      }
    ],
    assessments: [
      {
        id: 1,
        title: "Module 1 Quiz",
        type: "quiz",
        questions: 10,
        duration: "20 min",
        maxScore: 100,
        completed: true,
        score: 85
      },
      {
        id: 2,
        title: "Mid-term Assignment",
        type: "assignment",
        duration: "1 week",
        maxScore: 100,
        completed: false,
        dueDate: "2024-02-15"
      },
      {
        id: 3,
        title: "Final Project",
        type: "project",
        duration: "2 weeks",
        maxScore: 200,
        completed: false,
        dueDate: "2024-03-01"
      }
    ]
  }

  useEffect(() => {
    if (user) {
      fetchUserBranch()
      fetchSubjectDetails()
      fetchProgress()
    }
  }, [user, subjectCode])

  const fetchUserBranch = async () => {
    try {
      const response = await axios.get('/api/user-branches')
      const branches = response.data.branches || []
      const primary = branches.find(b => b.isPrimary) || branches[0]
      setUserBranch(primary)
    } catch (error) {
      console.error('Failed to fetch user branch:', error)
    }
  }

  const fetchSubjectDetails = async () => {
    try {
      if (!userBranch) return
      
      const response = await axios.get(`/api/branch-subjects?branchCode=${userBranch.branchCode}&subjectCode=${subjectCode}`)
      if (response.data.success && response.data.subjects.length > 0) {
        setSubject(response.data.subjects[0])
      }
    } catch (error) {
      console.error('Failed to fetch subject details:', error)
      toast.error('Failed to load subject information')
    } finally {
      setLoading(false)
    }
  }

  const fetchProgress = async () => {
    try {
      if (!userBranch) return
      
      const response = await axios.get(`/api/branch-progress?branchCode=${userBranch.branchCode}&subjectCode=${subjectCode}`)
      if (response.data.success) {
        const progressData = response.data.progress || []
        const progressMap = {}
        progressData.forEach(p => {
          progressMap[p.activityType] = p.completionPercentage
        })
        setProgress(progressMap)
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error)
    }
  }

  const getResourceIcon = (type) => {
    switch (type) {
      case 'pdf': return <FileText className="h-4 w-4" />
      case 'video': return <Video className="h-4 w-4" />
      case 'code': return <Code className="h-4 w-4" />
      case 'quiz': return <Target className="h-4 w-4" />
      case 'practice': return <Target className="h-4 w-4" />
      default: return <BookOpen className="h-4 w-4" />
    }
  }

  const getTopicIcon = (type) => {
    switch (type) {
      case 'reading': return <BookOpen className="h-5 w-5 text-blue-500" />
      case 'video': return <Video className="h-5 w-5 text-red-500" />
      case 'coding': return <Code className="h-5 w-5 text-green-500" />
      case 'project': return <Target className="h-5 w-5 text-purple-500" />
      default: return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const calculateModuleProgress = (module) => {
    const completedTopics = module.topics.filter(t => t.completed).length
    return Math.round((completedTopics / module.topics.length) * 100)
  }

  const calculateOverallProgress = () => {
    const allTopics = sampleContent.modules.flatMap(m => m.topics)
    const completedTopics = allTopics.filter(t => t.completed).length
    return Math.round((completedTopics / allTopics.length) * 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading subject content...</p>
        </div>
      </div>
    )
  }

  if (!subject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto" />
          <h2 className="text-2xl font-semibold text-gray-600">Subject Not Found</h2>
          <p className="text-gray-500">The requested subject could not be found</p>
          <Link href="/workspace/engineering/subjects">
            <Button>Back to Subjects</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/workspace/engineering/subjects">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Subjects
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{subject.subjectName}</h1>
            <p className="text-gray-600">{subject.subjectCode} • {subject.credits} Credits</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant={subject.isCore ? "default" : "secondary"}>
            {subject.isCore ? "Core Subject" : "Elective"}
          </Badge>
          <div className="text-right">
            <div className="text-2xl font-bold">{calculateOverallProgress()}%</div>
            <div className="text-sm text-gray-600">Complete</div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{calculateOverallProgress()}%</span>
              </div>
              <Progress value={calculateOverallProgress()} className="h-3" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {sampleContent.modules.reduce((sum, m) => sum + m.topics.length, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Topics</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {sampleContent.modules.reduce((sum, m) => sum + m.topics.filter(t => t.completed).length, 0)}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">
                  {sampleContent.modules.reduce((sum, m) => sum + m.estimatedHours, 0)}h
                </div>
                <div className="text-sm text-gray-600">Est. Duration</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="modules" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="modules">Learning Modules</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-6">
          <div className="space-y-4">
            {sampleContent.modules.map((module, index) => (
              <Card key={module.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">Module {index + 1}: {module.title}</CardTitle>
                      <p className="text-gray-600 mt-1">{module.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{calculateModuleProgress(module)}%</div>
                      <div className="text-sm text-gray-600">
                        <Clock className="h-4 w-4 inline mr-1" />
                        {module.estimatedHours}h
                      </div>
                    </div>
                  </div>
                  <Progress value={calculateModuleProgress(module)} className="h-2" />
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {module.topics.map((topic, topicIndex) => (
                      <AccordionItem key={topic.id} value={`topic-${topic.id}`}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center space-x-3">
                            {getTopicIcon(topic.type)}
                            <div className="text-left">
                              <div className="font-medium">{topic.title}</div>
                              <div className="text-sm text-gray-600">{topic.duration}</div>
                            </div>
                            {topic.completed && (
                              <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pl-8 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {topic.resources.map((resource, resourceIndex) => (
                                <div key={resourceIndex} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50">
                                  {getResourceIcon(resource.type)}
                                  <span className="text-sm">{resource.title}</span>
                                  <Button size="sm" variant="ghost" className="ml-auto">
                                    Open
                                  </Button>
                                </div>
                              ))}
                            </div>
                            <div className="flex space-x-2 pt-2">
                              <Button size="sm" variant={topic.completed ? "secondary" : "default"}>
                                {topic.completed ? "Review" : "Start Learning"}
                              </Button>
                              {!topic.completed && (
                                <Button size="sm" variant="outline">
                                  Mark Complete
                                </Button>
                              )}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleContent.assessments.map((assessment) => (
              <Card key={assessment.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{assessment.title}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="capitalize">{assessment.type}</Badge>
                    {assessment.completed && (
                      <Badge variant="default">Completed</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    {assessment.questions && (
                      <div className="flex justify-between">
                        <span>Questions:</span>
                        <span>{assessment.questions}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{assessment.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max Score:</span>
                      <span>{assessment.maxScore}</span>
                    </div>
                    {assessment.score && (
                      <div className="flex justify-between font-semibold">
                        <span>Your Score:</span>
                        <span className="text-green-600">{assessment.score}/{assessment.maxScore}</span>
                      </div>
                    )}
                    {assessment.dueDate && !assessment.completed && (
                      <div className="flex justify-between text-red-600">
                        <span>Due Date:</span>
                        <span>{assessment.dueDate}</span>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full" 
                    variant={assessment.completed ? "outline" : "default"}
                  >
                    {assessment.completed ? "Review" : "Start"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Study Materials</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <span>Complete Lecture Notes</span>
                  </div>
                  <Button size="sm" variant="outline">Download</Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Video className="h-5 w-5 text-red-500" />
                    <span>Video Lectures Playlist</span>
                  </div>
                  <Button size="sm" variant="outline">Watch</Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="h-5 w-5 text-green-500" />
                    <span>Reference Textbook</span>
                  </div>
                  <Button size="sm" variant="outline">View</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Practice Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Target className="h-5 w-5 text-purple-500" />
                    <span>Practice Question Bank</span>
                  </div>
                  <Button size="sm" variant="outline">Practice</Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-orange-500" />
                    <span>Previous Year Papers</span>
                  </div>
                  <Button size="sm" variant="outline">View</Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Code className="h-5 w-5 text-indigo-500" />
                    <span>Lab Exercises</span>
                  </div>
                  <Button size="sm" variant="outline">Start</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SubjectContent