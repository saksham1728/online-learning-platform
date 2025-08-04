"use client"
import React, { useState, useEffect } from 'react'
import { ArrowLeft, Upload, FileText, Brain, Briefcase, TrendingUp, MapPin, Clock, ExternalLink, Star, Download } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Badge } from '../../../../components/ui/badge'
import { Progress } from '../../../../components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs'
import { useUser } from '@clerk/nextjs'
import axios from 'axios'
import { toast } from 'sonner'

function CareerServices() {
  const [userBranch, setUserBranch] = useState(null)
  const [resumeData, setResumeData] = useState(null)
  const [jobRecommendations, setJobRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploadingResume, setUploadingResume] = useState(false)
  const [analyzingResume, setAnalyzingResume] = useState(false)
  const [scrapingJobs, setScrapingJobs] = useState(false)
  const { user } = useUser()

  useEffect(() => {
    if (user) {
      fetchUserBranch()
      loadResumeData()
    }
  }, [user])

  const fetchUserBranch = async () => {
    try {
      const response = await axios.get('/api/user-branches')
      const branches = response.data.branches || []
      const primary = branches.find(b => b.isPrimary) || branches[0]
      setUserBranch(primary)
    } catch (error) {
      console.error('Failed to fetch user branch:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadResumeData = async () => {
    try {
      const response = await axios.get('/api/resume-analysis')
      if (response.data.success && response.data.resume) {
        setResumeData(response.data.resume)
        loadJobRecommendations(response.data.resume)
      }
    } catch (error) {
      console.error('Failed to load resume data:', error)
    }
  }

  const loadJobRecommendations = async (resume, forceRefresh = false) => {
    try {
      setScrapingJobs(true)
      const response = await axios.post('/api/job-recommendations', {
        resumeData: resume,
        branchCode: userBranch?.branchCode,
        forceRefresh: forceRefresh
      })
      if (response.data.success) {
        setJobRecommendations(response.data.jobs || [])
        if (response.data.source === 'fresh_scrape') {
          toast.success(`Scraped ${response.data.totalJobs} fresh jobs from multiple portals!`)
        } else {
          toast.info(`Loaded ${response.data.jobs.length} jobs (${response.data.source})`)
        }
      }
    } catch (error) {
      console.error('Failed to load job recommendations:', error)
      toast.error('Failed to load job recommendations. Please try again.')
      setJobRecommendations([])
    } finally {
      setScrapingJobs(false)
    }
  }

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('File size should be less than 5MB')
      return
    }

    setUploadingResume(true)
    setAnalyzingResume(true)

    try {
      const formData = new FormData()
      formData.append('resume', file)

      const response = await axios.post('/api/resume-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        toast.success('Resume uploaded successfully!')
        setResumeData(response.data.analysis)
        loadJobRecommendations(response.data.analysis)
      }
    } catch (error) {
      console.error('Resume upload failed:', error)
      toast.error('Failed to upload resume')
      // Show demo analysis for testing
      showDemoAnalysis()
    } finally {
      setUploadingResume(false)
      setAnalyzingResume(false)
    }
  }

  const showDemoAnalysis = () => {
    const demoResume = {
      personalInfo: {
        name: user?.firstName + ' ' + user?.lastName,
        email: user?.primaryEmailAddress?.emailAddress,
        phone: '+91 9876543210',
        location: 'Bangalore, India'
      },
      skills: {
        technical: ['Java', 'Python', 'JavaScript', 'React', 'Node.js', 'MySQL', 'Git'],
        soft: ['Problem Solving', 'Team Work', 'Communication', 'Leadership']
      },
      experience: {
        years: 0.5,
        internships: 2,
        projects: 5
      },
      education: {
        degree: userBranch?.branchName || 'Computer Science Engineering',
        university: 'VTU',
        cgpa: 8.2,
        year: 2024
      },
      analysisScore: 78,
      strengths: [
        'Strong technical skills in modern web technologies',
        'Good academic performance',
        'Multiple project experiences'
      ],
      improvements: [
        'Add more industry experience',
        'Include certifications',
        'Improve soft skills section'
      ],
      recommendations: [
        'Consider getting AWS or Google Cloud certifications',
        'Add more details about project impact and results',
        'Include links to GitHub and portfolio'
      ]
    }
    setResumeData(demoResume)
    loadJobRecommendations(demoResume)
  }



  const getMatchScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100'
    if (score >= 80) return 'text-blue-600 bg-blue-100'
    if (score >= 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading career services...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/workspace/engineering-portal/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Career Services</h1>
            <p className="text-gray-600">
              AI-powered resume analysis and job recommendations for {userBranch?.branchName || 'Engineering'}
            </p>
          </div>
        </div>
      </div>

      {/* Resume Upload Section */}
      {!resumeData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-6 w-6 text-blue-500" />
              <span>Upload Your Resume</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Upload your resume for AI analysis</h3>
              <p className="text-gray-600 mb-4">
                Get personalized job recommendations and resume improvement suggestions
              </p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleResumeUpload}
                style={{ display: 'none' }}
                id="resume-upload"
                disabled={uploadingResume}
              />
              <Button 
                disabled={uploadingResume} 
                onClick={() => document.getElementById('resume-upload')?.click()}
                className="cursor-pointer"
              >
                {uploadingResume ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose PDF File
                  </>
                )}
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Supported format: PDF (Max 5MB)
              </p>
            </div>
            
            <div className="text-center">
              <Button variant="outline" onClick={showDemoAnalysis}>
                <Brain className="h-4 w-4 mr-2" />
                Try Demo Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resume Analysis Results */}
      {resumeData && (
        <Tabs defaultValue="analysis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analysis">Resume Analysis</TabsTrigger>
            <TabsTrigger value="jobs">Job Recommendations</TabsTrigger>
            <TabsTrigger value="improvements">Improvement Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-6">
            {/* Resume Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Resume Analysis Score</span>
                  <div className={`text-3xl font-bold ${getScoreColor(resumeData.analysisScore)}`}>
                    {resumeData.analysisScore}/100
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={resumeData.analysisScore} className="mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-green-600 mb-2">Strengths</h4>
                    <ul className="space-y-1">
                      {resumeData.strengths.map((strength, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-600 mb-2">Areas for Improvement</h4>
                    <ul className="space-y-1">
                      {resumeData.improvements.map((improvement, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <span className="text-orange-500 mr-2">!</span>
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Technical Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {resumeData.skills.technical.map((skill, index) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Soft Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {resumeData.skills.soft.map((skill, index) => (
                      <Badge key={index} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Experience & Education */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Experience</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Experience:</span>
                    <span className="font-semibold">{resumeData.experience.years} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Internships:</span>
                    <span className="font-semibold">{resumeData.experience.internships}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Projects:</span>
                    <span className="font-semibold">{resumeData.experience.projects}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Education</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Degree:</span>
                    <span className="font-semibold">{resumeData.education.degree}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>University:</span>
                    <span className="font-semibold">{resumeData.education.university}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CGPA:</span>
                    <span className="font-semibold">{resumeData.education.cgpa}/10</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            {scrapingJobs ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <div className="relative mb-6">
                      {/* Animated rings */}
                      <div className="w-20 h-20 mx-auto relative">
                        <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
                        <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-green-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                        <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{ animationDuration: '2s' }}></div>
                        
                        {/* Center icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Briefcase className="h-8 w-8 text-blue-500 animate-pulse" />
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      🔍 Scraping Job Portals
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Finding the best job matches from multiple portals...
                    </p>
                    
                    {/* Portal status indicators */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="text-blue-600 font-semibold text-sm">LinkedIn</div>
                        <div className="text-xs text-blue-500 mt-1">Searching...</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="text-green-600 font-semibold text-sm">Internshala</div>
                        <div className="text-xs text-green-500 mt-1">Searching...</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="text-purple-600 font-semibold text-sm">Indeed</div>
                        <div className="text-xs text-purple-500 mt-1">Searching...</div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3">
                        <div className="text-orange-600 font-semibold text-sm">Naukri</div>
                        <div className="text-xs text-orange-500 mt-1">Searching...</div>
                      </div>
                    </div>
                    
                    {/* Progress dots */}
                    <div className="flex justify-center space-x-1 mt-6">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">Recommended Jobs ({jobRecommendations.length})</h3>
                    {jobRecommendations.length > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        Last updated: {new Date().toLocaleString()} • 
                        <span className="ml-1">Fresh jobs from LinkedIn, Internshala, Indeed & Naukri</span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button 
                      onClick={() => loadJobRecommendations(resumeData, true)} 
                      disabled={scrapingJobs}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {scrapingJobs ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Scraping...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Refresh Jobs
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {jobRecommendations.map((job) => (
                  <Card key={job.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold">{job.title}</h3>
                            <Badge className={getMatchScoreColor(job.matchScore)}>
                              {job.matchScore}% Match
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center">
                              <Briefcase className="h-4 w-4 mr-1" />
                              {job.company}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {job.location}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {job.type}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <span><strong>Experience:</strong> {job.experience}</span>
                            <span><strong>Salary:</strong> {job.salary}</span>
                            <span><strong>Source:</strong> {job.source}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500 mb-2">
                            Posted: {new Date(job.postedDate).toLocaleDateString()}
                          </div>
                          <div className="flex flex-col space-y-2">
                            {(job.url || job.applyUrl) ? (
                              <Button size="sm" asChild className="bg-green-600 hover:bg-green-700">
                                <a 
                                  href={job.url || job.applyUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  onClick={() => {
                                    // Track application click
                                    console.log('Application clicked:', job.title, job.company, job.source);
                                    toast.success(`Opening ${job.source} application...`);
                                  }}
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Apply Now
                                </a>
                              </Button>
                            ) : (
                              <Button size="sm" disabled className="opacity-50">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Link Unavailable
                              </Button>
                            )}
                            
                            {/* Quick Actions */}
                            <div className="flex space-x-1">
                              <Button 
                                size="xs" 
                                variant="outline"
                                onClick={() => {
                                  // Save job functionality
                                  toast.success(`Saved ${job.title} to your bookmarks`);
                                }}
                              >
                                <Star className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="xs" 
                                variant="outline"
                                onClick={() => {
                                  // Share job functionality
                                  if (navigator.share) {
                                    navigator.share({
                                      title: `${job.title} at ${job.company}`,
                                      text: `Check out this job opportunity: ${job.title} at ${job.company}`,
                                      url: job.url || job.applyUrl
                                    });
                                  } else {
                                    navigator.clipboard.writeText(job.url || job.applyUrl);
                                    toast.success('Job link copied to clipboard!');
                                  }
                                }}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-3">{job.description}</p>

                      <div className="space-y-2">
                        <div>
                          <span className="font-semibold text-sm">Required Skills:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {job.skills.map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="font-semibold text-sm">Requirements:</span>
                          <ul className="text-sm text-gray-600 mt-1">
                            {job.requirements.map((req, index) => (
                              <li key={index} className="flex items-start">
                                <span className="mr-2">•</span>
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {jobRecommendations.length === 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-12">
                        <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Job Recommendations</h3>
                        <p className="text-gray-500 mb-4">
                          Upload your resume to get personalized job recommendations.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="improvements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-6 w-6 text-purple-500" />
                  <span>AI-Powered Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resumeData.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
                      <Star className="h-5 w-5 text-purple-500 mt-0.5" />
                      <div>
                        <p className="text-gray-700">{recommendation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Skill Development</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-700">Trending Skills for {userBranch?.branchName}</h4>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {['React', 'Node.js', 'AWS', 'Docker', 'Kubernetes'].map((skill, index) => (
                          <Badge key={index} className="bg-blue-100 text-blue-700">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-700">Recommended Certifications</h4>
                      <ul className="text-sm text-green-600 mt-2 space-y-1">
                        <li>• AWS Certified Developer</li>
                        <li>• Google Cloud Professional</li>
                        <li>• Oracle Java Certification</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resume Enhancement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <h4 className="font-semibold text-orange-700">Format Improvements</h4>
                      <ul className="text-sm text-orange-600 mt-2 space-y-1">
                        <li>• Use action verbs in descriptions</li>
                        <li>• Quantify achievements with numbers</li>
                        <li>• Keep it to 1-2 pages maximum</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <h4 className="font-semibold text-red-700">Content Suggestions</h4>
                      <ul className="text-sm text-red-600 mt-2 space-y-1">
                        <li>• Add project impact metrics</li>
                        <li>• Include relevant coursework</li>
                        <li>• Add portfolio/GitHub links</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

export default CareerServices