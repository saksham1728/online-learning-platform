"use client"
import React, { useState, useEffect, useRef } from 'react'
import { Button } from '../../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Input } from '../../../../components/ui/input'
import { Badge } from '../../../../components/ui/badge'
import { Progress } from '../../../../components/ui/progress'
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  Briefcase,
  TrendingUp,
  Award,
  MapPin,
  Clock,
  DollarSign,
  ExternalLink,
  Bookmark,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Target,
  Users,
  Building
} from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'
import { toast } from 'sonner'

function CareerServicesPage() {
  const [activeTab, setActiveTab] = useState('upload')
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeAnalysis, setResumeAnalysis] = useState(null)
  const [jobMatches, setJobMatches] = useState([])
  const [availableJobs, setAvailableJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchUserData()
    generateSampleJobs()
  }, [])

  const fetchUserData = async () => {
    try {
      // Fetch user's resumes
      const resumesResponse = await axios.get('/api/career-services?action=resumes')
      if (resumesResponse.data.success && resumesResponse.data.resumes.length > 0) {
        const latestResume = resumesResponse.data.resumes[0]
        setResumeAnalysis({
          ...latestResume,
          parsedData: typeof latestResume.parsedData === 'string' 
            ? JSON.parse(latestResume.parsedData) 
            : latestResume.parsedData
        })
        setActiveTab('analysis')
      }

      // Fetch job matches
      const matchesResponse = await axios.get('/api/career-services?action=job-matches')
      if (matchesResponse.data.success) {
        setJobMatches(matchesResponse.data.matches || [])
      }

      // Fetch available jobs
      const jobsResponse = await axios.get('/api/career-services?action=jobs')
      if (jobsResponse.data.success) {
        setAvailableJobs(jobsResponse.data.jobs || [])
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    }
  }

  const generateSampleJobs = async () => {
    try {
      await axios.post('/api/career-services', { action: 'generate-jobs' })
    } catch (error) {
      console.error('Failed to generate sample jobs:', error)
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file')
      return
    }

    setResumeFile(file)
    
    // For demo purposes, we'll use sample resume text
    const sampleResumeText = `
    John Doe
    Software Engineer
    Email: john.doe@email.com
    Phone: +91-9876543210
    Location: Bangalore, India

    EXPERIENCE
    Software Engineer at TechCorp (2022-2024)
    - Developed web applications using React and Node.js
    - Implemented RESTful APIs and database integration
    - Collaborated with cross-functional teams on product development
    - Improved application performance by 30%

    Junior Developer at StartupXYZ (2021-2022)
    - Built responsive web interfaces using HTML, CSS, JavaScript
    - Worked on mobile app development using React Native
    - Participated in code reviews and agile development processes

    EDUCATION
    Bachelor of Technology in Computer Science
    ABC University (2017-2021)
    CGPA: 8.5/10

    SKILLS
    Programming Languages: JavaScript, Python, Java, C++
    Web Technologies: React, Node.js, HTML, CSS, Express.js
    Databases: MySQL, MongoDB, PostgreSQL
    Tools: Git, Docker, AWS, VS Code
    Soft Skills: Problem Solving, Team Collaboration, Communication

    PROJECTS
    E-commerce Platform (2023)
    - Built full-stack e-commerce application using MERN stack
    - Implemented payment gateway integration and user authentication
    - Technologies: React, Node.js, MongoDB, Stripe API

    Task Management App (2022)
    - Developed task management application with real-time updates
    - Used Socket.io for real-time communication
    - Technologies: React, Node.js, Socket.io, PostgreSQL

    CERTIFICATIONS
    - AWS Certified Developer Associate (2023)
    - MongoDB Certified Developer (2022)
    `

    try {
      setAnalyzing(true)
      const response = await axios.post('/api/career-services', {
        action: 'analyze-resume',
        resumeText: sampleResumeText,
        fileName: file.name,
        fileUrl: URL.createObjectURL(file)
      })

      if (response.data.success) {
        setResumeAnalysis({
          ...response.data.resume,
          parsedData: response.data.analysis
        })
        setActiveTab('analysis')
        toast.success('Resume analyzed successfully!')
      }
    } catch (error) {
      console.error('Resume analysis error:', error)
      toast.error('Failed to analyze resume')
    } finally {
      setAnalyzing(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const renderUploadTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-6 w-6 text-primary" />
            <span>Upload Your Resume</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {resumeFile ? resumeFile.name : 'Drop your resume here or click to upload'}
              </h3>
              <p className="text-gray-600 mb-4">
                Supports PDF files up to 10MB
              </p>
              <Button disabled={analyzing}>
                {analyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </>
                )}
              </Button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">What happens after upload?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• AI analyzes your resume and extracts key information</li>
                <li>• Skills, experience, and education are automatically identified</li>
                <li>• You get a comprehensive resume score and improvement suggestions</li>
                <li>• Personalized job recommendations are generated based on your profile</li>
                <li>• Missing skills for target roles are highlighted</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderAnalysisTab = () => {
    if (!resumeAnalysis) {
      return (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Resume Analysis Available</h3>
          <p className="text-gray-500 mb-6">Upload your resume to get detailed analysis and recommendations</p>
          <Button onClick={() => setActiveTab('upload')}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Resume
          </Button>
        </div>
      )
    }

    const analysis = resumeAnalysis.parsedData
    const score = analysis?.analysisScore || resumeAnalysis.analysisScore || 75

    return (
      <div className="space-y-6">
        {/* Overall Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Award className="h-6 w-6 text-primary" />
                <span>Resume Analysis</span>
              </span>
              <Badge className={`${getScoreBg(score)} ${getScoreColor(score)}`}>
                {score}/100
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Score</span>
                  <span className={`font-semibold ${getScoreColor(score)}`}>{score}%</span>
                </div>
                <Progress value={score} className="h-3" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {analysis?.skills?.technical?.length || 5}
                  </div>
                  <div className="text-sm text-blue-800">Technical Skills</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {analysis?.experience?.totalYears || 2}
                  </div>
                  <div className="text-sm text-green-800">Years Experience</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {analysis?.projects?.length || 2}
                  </div>
                  <div className="text-sm text-purple-800">Projects</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Skills Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Technical Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {(analysis?.skills?.technical || ['JavaScript', 'React', 'Node.js', 'Python', 'SQL']).map((skill, index) => (
                    <Badge key={index} variant="outline">{skill}</Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Missing Skills (High Demand)</h4>
                <div className="flex flex-wrap gap-2">
                  {(analysis?.missingSkills || ['Cloud Computing', 'DevOps', 'System Design', 'Docker', 'Kubernetes']).map((skill, index) => (
                    <Badge key={index} className="bg-red-100 text-red-800">{skill}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>AI Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(analysis?.recommendations || [
                'Add more quantifiable achievements to demonstrate impact',
                'Include cloud computing skills to match current market demands',
                'Add system design experience for senior role eligibility',
                'Consider obtaining relevant certifications in your field'
              ]).map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-blue-800">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderJobsTab = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{availableJobs.length}</div>
                <div className="text-sm text-gray-600">Available Jobs</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{jobMatches.length}</div>
                <div className="text-sm text-gray-600">Matched Jobs</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-gray-600">Applications</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">85%</div>
                <div className="text-sm text-gray-600">Match Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Listings */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recommended Jobs</h2>
        
        {availableJobs.length > 0 ? (
          <div className="space-y-4">
            {availableJobs.map((job) => (
              <Card key={job.jobId} className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Building className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold">{job.title}</h3>
                          <p className="text-gray-600">{job.company}</p>
                          
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4" />
                              <span>{job.salaryRange}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{job.experienceRequired}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mt-3">
                            <Badge className="bg-green-100 text-green-800">
                              85% Match
                            </Badge>
                            <Badge variant="outline">{job.jobType}</Badge>
                            <Badge variant="outline">{job.sourcePortal}</Badge>
                          </div>

                          <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                            {job.jobDescription}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      <Button size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Apply
                      </Button>
                      <Button variant="outline" size="sm">
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Job Recommendations Yet</h3>
              <p className="text-gray-500 mb-6">Upload your resume to get personalized job recommendations</p>
              <Button onClick={() => setActiveTab('upload')}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Resume
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/workspace/engineering">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Engineering
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Career Services</h1>
            <p className="text-gray-600">AI-powered resume analysis and job recommendations</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { id: 'upload', label: 'Upload Resume', icon: Upload },
            { id: 'analysis', label: 'Resume Analysis', icon: FileText },
            { id: 'jobs', label: 'Job Recommendations', icon: Briefcase }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'upload' && renderUploadTab()}
      {activeTab === 'analysis' && renderAnalysisTab()}
      {activeTab === 'jobs' && renderJobsTab()}
    </div>
  )
}

export default CareerServicesPage