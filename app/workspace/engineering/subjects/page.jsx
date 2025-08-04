"use client"
import React, { useState, useEffect } from 'react'
import { ArrowLeft, BookOpen, Clock, Award, CheckCircle, Circle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Badge } from '../../../../components/ui/badge'
import { Progress } from '../../../../components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs'
import { useUser } from '@clerk/nextjs'
import axios from 'axios'
import { toast } from 'sonner'

function SubjectHierarchy() {
  const [userBranch, setUserBranch] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [progress, setProgress] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedSemester, setSelectedSemester] = useState('all')
  const { user } = useUser()

  useEffect(() => {
    if (user) {
      fetchUserBranch()
    }
  }, [user])

  useEffect(() => {
    if (userBranch) {
      fetchSubjects()
      fetchProgress()
    }
  }, [userBranch])

  const fetchUserBranch = async () => {
    try {
      const response = await axios.get('/api/user-branches')
      const branches = response.data.branches || []
      const primary = branches.find(b => b.isPrimary) || branches[0]
      setUserBranch(primary)
    } catch (error) {
      console.error('Failed to fetch user branch:', error)
      toast.error('Failed to load branch information')
    }
  }

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`/api/branch-subjects?branchCode=${userBranch.branchCode}`)
      if (response.data.success) {
        setSubjects(response.data.subjects || [])
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error)
      toast.error('Failed to load subjects')
    } finally {
      setLoading(false)
    }
  }

  const fetchProgress = async () => {
    try {
      const response = await axios.get(`/api/branch-progress?branchCode=${userBranch.branchCode}`)
      if (response.data.success) {
        const progressData = response.data.progress || []
        const progressMap = {}
        progressData.forEach(p => {
          if (!progressMap[p.subjectCode]) {
            progressMap[p.subjectCode] = []
          }
          progressMap[p.subjectCode].push(p)
        })
        setProgress(progressMap)
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error)
    }
  }

  const getSubjectProgress = (subjectCode) => {
    const subjectProgress = progress[subjectCode] || []
    if (subjectProgress.length === 0) return 0
    
    const avgProgress = subjectProgress.reduce((sum, p) => sum + p.completionPercentage, 0) / subjectProgress.length
    return Math.round(avgProgress)
  }

  const getPrerequisiteStatus = (subject) => {
    const prerequisites = JSON.parse(subject.prerequisites || '[]')
    if (prerequisites.length === 0) return { met: true, missing: [] }
    
    const missing = prerequisites.filter(prereq => {
      const prereqProgress = getSubjectProgress(prereq)
      return prereqProgress < 70 // Consider 70% as completion threshold
    })
    
    return {
      met: missing.length === 0,
      missing: missing
    }
  }

  const groupSubjectsBySemester = () => {
    const grouped = {}
    subjects.forEach(subject => {
      if (!grouped[subject.semester]) {
        grouped[subject.semester] = []
      }
      grouped[subject.semester].push(subject)
    })
    return grouped
  }

  const getSubjectsByType = (semester) => {
    const semesterSubjects = subjects.filter(s => s.semester === semester)
    return {
      core: semesterSubjects.filter(s => s.isCore),
      elective: semesterSubjects.filter(s => !s.isCore)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading subjects...</p>
        </div>
      </div>
    )
  }

  if (!userBranch) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto" />
          <h2 className="text-2xl font-semibold text-gray-600">No Branch Selected</h2>
          <p className="text-gray-500">Please select your engineering branch to view subjects</p>
          <Link href="/workspace/engineering/branch-selection">
            <Button>Select Branch</Button>
          </Link>
        </div>
      </div>
    )
  }

  const groupedSubjects = groupSubjectsBySemester()
  const semesters = Object.keys(groupedSubjects).sort((a, b) => parseInt(a) - parseInt(b))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/workspace/engineering/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Subject Hierarchy</h1>
            <p className="text-gray-600">
              {userBranch.branchName} - Semester-wise subject organization
            </p>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{subjects.length}</div>
                <div className="text-sm text-gray-600">Total Subjects</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Award className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{subjects.filter(s => s.isCore).length}</div>
                <div className="text-sm text-gray-600">Core Subjects</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{subjects.reduce((sum, s) => sum + s.credits, 0)}</div>
                <div className="text-sm text-gray-600">Total Credits</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">
                  {Object.keys(progress).filter(code => getSubjectProgress(code) >= 70).length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Semester Tabs */}
      <Tabs value={selectedSemester} onValueChange={setSelectedSemester}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Semesters</TabsTrigger>
          {semesters.slice(0, 4).map(sem => (
            <TabsTrigger key={sem} value={sem}>Semester {sem}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {semesters.map(semester => (
            <Card key={semester}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Semester {semester}</span>
                  <Badge variant="outline">
                    {groupedSubjects[semester].length} Subjects
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedSubjects[semester].map((subject, index) => {
                    const subjectProgress = getSubjectProgress(subject.subjectCode)
                    const prereqStatus = getPrerequisiteStatus(subject)
                    
                    return (
                      <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{subject.subjectName}</h3>
                            <p className="text-sm text-gray-600 mb-2">{subject.subjectCode}</p>
                            <div className="flex items-center space-x-2">
                              {subject.isCore ? (
                                <Badge variant="default" className="text-xs">Core</Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">Elective</Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {subject.credits} Credits
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            {subjectProgress >= 70 ? (
                              <CheckCircle className="h-6 w-6 text-green-500" />
                            ) : (
                              <Circle className="h-6 w-6 text-gray-300" />
                            )}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{subjectProgress}%</span>
                          </div>
                          <Progress value={subjectProgress} className="h-2" />
                        </div>

                        {/* Prerequisites */}
                        {JSON.parse(subject.prerequisites || '[]').length > 0 && (
                          <div className="mb-3">
                            <div className="text-sm font-medium mb-1">Prerequisites:</div>
                            <div className="flex flex-wrap gap-1">
                              {JSON.parse(subject.prerequisites).map((prereq, i) => (
                                <Badge 
                                  key={i} 
                                  variant={getSubjectProgress(prereq) >= 70 ? "default" : "destructive"}
                                  className="text-xs"
                                >
                                  {prereq}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            disabled={!prereqStatus.met}
                          >
                            Study
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1"
                            disabled={!prereqStatus.met}
                          >
                            Practice
                          </Button>
                        </div>

                        {!prereqStatus.met && (
                          <div className="mt-2 text-xs text-red-600">
                            Complete prerequisites first: {prereqStatus.missing.join(', ')}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {semesters.map(semester => (
          <TabsContent key={semester} value={semester} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Core Subjects */}
              <Card>
                <CardHeader>
                  <CardTitle>Core Subjects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getSubjectsByType(parseInt(semester)).core.map((subject, index) => {
                      const subjectProgress = getSubjectProgress(subject.subjectCode)
                      const prereqStatus = getPrerequisiteStatus(subject)
                      
                      return (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{subject.subjectName}</h3>
                            <Badge variant="outline">{subject.credits} Credits</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{subject.subjectCode}</p>
                          
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{subjectProgress}%</span>
                          </div>
                          <Progress value={subjectProgress} className="h-2 mb-3" />
                          
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              Study
                            </Button>
                            <Button size="sm" className="flex-1">
                              Practice
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Elective Subjects */}
              <Card>
                <CardHeader>
                  <CardTitle>Elective Subjects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getSubjectsByType(parseInt(semester)).elective.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No elective subjects for this semester</p>
                      </div>
                    ) : (
                      getSubjectsByType(parseInt(semester)).elective.map((subject, index) => {
                        const subjectProgress = getSubjectProgress(subject.subjectCode)
                        
                        return (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold">{subject.subjectName}</h3>
                              <Badge variant="secondary">{subject.credits} Credits</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{subject.subjectCode}</p>
                            
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{subjectProgress}%</span>
                            </div>
                            <Progress value={subjectProgress} className="h-2 mb-3" />
                            
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" className="flex-1">
                                Study
                              </Button>
                              <Button size="sm" className="flex-1">
                                Practice
                              </Button>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

export default SubjectHierarchy