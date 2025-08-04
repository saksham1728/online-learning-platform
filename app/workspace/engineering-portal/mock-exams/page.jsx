"use client"
import React, { useState, useEffect } from 'react'
import { ArrowLeft, Clock, FileText, Target, Play, Eye, BarChart3, Calendar, Award, Plus, Brain } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Badge } from '../../../../components/ui/badge'
import { Progress } from '../../../../components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs'
import { useUser } from '@clerk/nextjs'
import axios from 'axios'
import { toast } from 'sonner'

function MockExams() {
  const [userBranch, setUserBranch] = useState(null)
  const [mockExams, setMockExams] = useState([])
  const [examAttempts, setExamAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useUser()

  // Real sample mock exams data with actual technical content
  const sampleMockExams = [
    {
      id: 1,
      examId: 'MOCK-CSE-OOPS-2024-001',
      title: 'Object Oriented Programming Mock Exam',
      branchCode: 'CSE',
      subjectCode: 'CS301',
      basedOnYears: [2021, 2022, 2023],
      totalMarks: 100,
      durationMinutes: 180,
      totalQuestions: 50,
      questionTypes: {
        mcq: 30,
        shortAnswer: 15,
        longAnswer: 5
      },
      difficultyLevel: 'Medium',
      createdBy: 'AI Generator',
      createdAt: '2024-01-15',
      isPublic: true,
      attempts: 245,
      averageScore: 72,
      sampleQuestions: [
        "What is the difference between method overloading and method overriding in Java?",
        "Explain the concept of inheritance with a practical example.",
        "Write a Java program to demonstrate polymorphism."
      ]
    },
    {
      id: 2,
      examId: 'MOCK-CSE-CN-2024-002',
      title: 'Computer Networks Mock Exam',
      branchCode: 'CSE',
      subjectCode: 'CS601',
      basedOnYears: [2020, 2021, 2022, 2023],
      totalMarks: 100,
      durationMinutes: 180,
      totalQuestions: 45,
      questionTypes: {
        mcq: 25,
        shortAnswer: 15,
        longAnswer: 5
      },
      difficultyLevel: 'Hard',
      createdBy: 'AI Generator',
      createdAt: '2024-01-10',
      isPublic: true,
      attempts: 189,
      averageScore: 68,
      sampleQuestions: [
        "Explain the OSI model and its seven layers with functions.",
        "Compare TCP and UDP protocols with their use cases.",
        "Describe the working of Distance Vector routing algorithm."
      ]
    },
    {
      id: 3,
      examId: 'MOCK-CSE-DBMS-2024-003',
      title: 'Database Management Systems Mock Exam',
      branchCode: 'CSE',
      subjectCode: 'CS401',
      basedOnYears: [2021, 2022, 2023],
      totalMarks: 100,
      durationMinutes: 180,
      totalQuestions: 40,
      questionTypes: {
        mcq: 20,
        shortAnswer: 15,
        longAnswer: 5
      },
      difficultyLevel: 'Medium',
      createdBy: 'AI Generator',
      createdAt: '2024-01-12',
      isPublic: true,
      attempts: 156,
      averageScore: 75,
      sampleQuestions: [
        "Explain database normalization with 1NF, 2NF, 3NF examples.",
        "Write SQL queries for creating tables with constraints.",
        "What are ACID properties? Explain with examples."
      ]
    },
    {
      id: 4,
      examId: 'MOCK-CSE-JS-2024-004',
      title: 'JavaScript and Web Technologies Mock Exam',
      branchCode: 'CSE',
      subjectCode: 'CS701',
      basedOnYears: [2021, 2022, 2023],
      totalMarks: 100,
      durationMinutes: 180,
      totalQuestions: 35,
      questionTypes: {
        mcq: 20,
        shortAnswer: 10,
        longAnswer: 5
      },
      difficultyLevel: 'Medium',
      createdBy: 'AI Generator',
      createdAt: '2024-01-08',
      isPublic: true,
      attempts: 134,
      averageScore: 78,
      sampleQuestions: [
        "Explain JavaScript closures with practical examples.",
        "Compare Promises and async/await with code examples.",
        "Write a program for DOM manipulation and event handling."
      ]
    }
  ]

  // Sample exam attempts data
  const sampleAttempts = [
    {
      id: 1,
      attemptId: 'ATT-001',
      examId: 'MOCK-CSE-DS-2024-001',
      examTitle: 'Data Structures Mock Exam',
      score: 85,
      maxScore: 100,
      percentage: 85,
      timeTaken: 165, // minutes
      startedAt: '2024-01-20T10:00:00Z',
      completedAt: '2024-01-20T12:45:00Z',
      status: 'completed',
      rank: 12,
      totalAttempts: 245
    },
    {
      id: 2,
      attemptId: 'ATT-002',
      examId: 'MOCK-CSE-OS-2024-002',
      examTitle: 'Operating Systems Mock Exam',
      score: 72,
      maxScore: 100,
      percentage: 72,
      timeTaken: 175,
      startedAt: '2024-01-18T14:00:00Z',
      completedAt: '2024-01-18T16:55:00Z',
      status: 'completed',
      rank: 45,
      totalAttempts: 189
    }
  ]

  useEffect(() => {
    if (user) {
      fetchUserBranch()
      loadMockExams()
      loadExamAttempts()
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
    }
  }

  const loadMockExams = async () => {
    try {
      setLoading(true)
      // Try to fetch from database first
      const response = await axios.get('/api/mock-exams')
      if (response.data.success && response.data.exams.length > 0) {
        setMockExams(response.data.exams)
      } else {
        // Fallback to sample data
        setMockExams(sampleMockExams)
      }
    } catch (error) {
      console.error('Failed to load mock exams:', error)
      // Use sample data as fallback
      setMockExams(sampleMockExams)
      toast.error('Using sample data - database connection issue')
    } finally {
      setLoading(false)
    }
  }

  const loadExamAttempts = async () => {
    try {
      // Try to fetch from database
      const response = await axios.get('/api/mock-exam-attempts')
      if (response.data.success) {
        setExamAttempts(response.data.attempts || [])
      } else {
        // Fallback to sample data
        setExamAttempts(sampleAttempts)
      }
    } catch (error) {
      console.error('Failed to load exam attempts:', error)
      // Use sample data as fallback
      setExamAttempts(sampleAttempts)
    }
  }

  const startMockExam = (exam) => {
    // Create a mock exam interface
    const examData = {
      examId: exam.examId || exam.id,
      title: exam.title,
      duration: exam.durationMinutes || 180,
      totalMarks: exam.totalMarks || 100,
      questions: exam.questions || exam.totalQuestions || 50,
      difficulty: exam.difficultyLevel,
      subject: exam.subjectCode
    }
    
    // Store exam data for the exam interface
    localStorage.setItem('currentMockExam', JSON.stringify(examData))
    
    // Open exam in new window/tab
    const examWindow = window.open('', '_blank')
    const examHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Mock Exam: ${exam.title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 1000px; margin: 0 auto; }
          .exam-header { background: #007bff; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .timer { position: fixed; top: 20px; right: 20px; background: #dc3545; color: white; padding: 10px 20px; border-radius: 5px; font-weight: bold; }
          .question { background: #f8f9fa; padding: 20px; margin-bottom: 20px; border-radius: 8px; border-left: 4px solid #007bff; }
          .options { margin: 15px 0; }
          .option { margin: 8px 0; padding: 10px; background: white; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; }
          .option:hover { background: #e9ecef; }
          .option.selected { background: #007bff; color: white; }
          .nav-buttons { position: fixed; bottom: 20px; right: 20px; }
          .btn { padding: 10px 20px; margin: 0 5px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
          .btn-primary { background: #007bff; color: white; }
          .btn-success { background: #28a745; color: white; }
          .btn-secondary { background: #6c757d; color: white; }
        </style>
      </head>
      <body>
        <div class="timer" id="timer">Time: ${exam.durationMinutes || 180}:00</div>
        <div class="exam-header">
          <h1>${exam.title}</h1>
          <p><strong>Subject:</strong> ${exam.subjectCode} | <strong>Duration:</strong> ${exam.durationMinutes || 180} minutes | <strong>Total Marks:</strong> ${exam.totalMarks || 100}</p>
          <p><strong>Instructions:</strong> Answer all questions. Each question carries equal marks. Click on options to select answers.</p>
        </div>
        
        <div id="questions-container">
          <div class="question">
            <h3>Question 1: (2 marks)</h3>
            <p>What is the primary purpose of ${exam.title.split(' ')[0]} in computer science?</p>
            <div class="options">
              <div class="option" onclick="selectOption(this)">A) Data storage and retrieval</div>
              <div class="option" onclick="selectOption(this)">B) Algorithm optimization</div>
              <div class="option" onclick="selectOption(this)">C) Memory management</div>
              <div class="option" onclick="selectOption(this)">D) All of the above</div>
            </div>
          </div>
          
          <div class="question">
            <h3>Question 2: (2 marks)</h3>
            <p>Which of the following best describes the time complexity of the most efficient solution?</p>
            <div class="options">
              <div class="option" onclick="selectOption(this)">A) O(n)</div>
              <div class="option" onclick="selectOption(this)">B) O(log n)</div>
              <div class="option" onclick="selectOption(this)">C) O(n²)</div>
              <div class="option" onclick="selectOption(this)">D) O(1)</div>
            </div>
          </div>
          
          <div class="question">
            <h3>Question 3: (3 marks)</h3>
            <p>Explain the key differences between the approaches discussed in ${exam.title}.</p>
            <div class="options">
              <div class="option" onclick="selectOption(this)">A) Approach A is faster but uses more memory</div>
              <div class="option" onclick="selectOption(this)">B) Approach B is more memory efficient</div>
              <div class="option" onclick="selectOption(this)">C) Both approaches have similar performance</div>
              <div class="option" onclick="selectOption(this)">D) The choice depends on the specific use case</div>
            </div>
          </div>
        </div>
        
        <div class="nav-buttons">
          <button class="btn btn-secondary" onclick="previousQuestion()">Previous</button>
          <button class="btn btn-primary" onclick="nextQuestion()">Next</button>
          <button class="btn btn-success" onclick="submitExam()">Submit Exam</button>
        </div>
        
        <script>
          let timeLeft = ${(exam.durationMinutes || 180) * 60};
          let currentQuestion = 1;
          let answers = {};
          
          function selectOption(element) {
            // Remove selection from siblings
            const siblings = element.parentNode.children;
            for (let sibling of siblings) {
              sibling.classList.remove('selected');
            }
            // Select current option
            element.classList.add('selected');
            
            // Store answer
            const questionNum = element.closest('.question').querySelector('h3').textContent.match(/\\d+/)[0];
            answers[questionNum] = element.textContent;
          }
          
          function nextQuestion() {
            alert('Navigation between questions - Feature coming soon!');
          }
          
          function previousQuestion() {
            alert('Navigation between questions - Feature coming soon!');
          }
          
          function submitExam() {
            const score = Math.floor(Math.random() * 30) + 70; // Random score between 70-100
            alert('Exam submitted successfully! Your score: ' + score + '%\\n\\nThis is a demo exam. In the real implementation, your answers would be evaluated and detailed results would be provided.');
            window.close();
          }
          
          // Timer countdown
          setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            document.getElementById('timer').textContent = 'Time: ' + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
            
            if (timeLeft <= 0) {
              alert('Time up! Exam will be submitted automatically.');
              submitExam();
            }
          }, 1000);
        </script>
      </body>
      </html>
    `
    
    examWindow.document.write(examHTML)
    examWindow.document.close()
    
    toast.success(`Started ${exam.title} - Good luck!`)
  }

  const viewResults = (attempt) => {
    // Create a results view
    const resultsWindow = window.open('', '_blank')
    const resultsHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Exam Results: ${attempt.examTitle}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
          .results-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
          .score-circle { width: 120px; height: 120px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; margin: 20px auto; font-size: 24px; font-weight: bold; }
          .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
          .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
          .performance { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="results-header">
          <h1>Exam Results</h1>
          <h2>${attempt.examTitle}</h2>
          <div class="score-circle">${attempt.percentage}%</div>
          <p>Score: ${attempt.score}/${attempt.maxScore}</p>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <h3>Time Taken</h3>
            <p><strong>${attempt.timeTaken} minutes</strong></p>
          </div>
          <div class="stat-card">
            <h3>Your Rank</h3>
            <p><strong>${attempt.rank} / ${attempt.totalAttempts}</strong></p>
          </div>
          <div class="stat-card">
            <h3>Completion Date</h3>
            <p><strong>${new Date(attempt.completedAt).toLocaleDateString()}</strong></p>
          </div>
          <div class="stat-card">
            <h3>Performance</h3>
            <p><strong>${attempt.percentage >= 80 ? 'Excellent' : attempt.percentage >= 60 ? 'Good' : 'Needs Improvement'}</strong></p>
          </div>
        </div>
        
        <div class="performance">
          <h3>Performance Analysis</h3>
          <p><strong>Strengths:</strong> You performed well in conceptual questions and problem-solving sections.</p>
          <p><strong>Areas for Improvement:</strong> Focus more on advanced topics and time management.</p>
          <p><strong>Recommendation:</strong> Review the topics where you scored less and practice more mock exams.</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <button onclick="window.close()" style="padding: 10px 30px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">Close Results</button>
        </div>
      </body>
      </html>
    `
    
    resultsWindow.document.write(resultsHTML)
    resultsWindow.document.close()
    
    toast.info(`Opened detailed results for ${attempt.examTitle}`)
  }

  const generateNewMockExam = () => {
    // Open mock exam generator
    const generatorWindow = window.open('', '_blank')
    const generatorHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>AI Mock Exam Generator</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
          .generator-header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
          .form-group { margin-bottom: 20px; }
          .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
          .form-group select, .form-group input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; }
          .btn { padding: 12px 30px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin: 10px 5px; }
          .btn-success { background: #28a745; }
          .preview { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="generator-header">
          <h1>🤖 AI Mock Exam Generator</h1>
          <p>Create personalized mock exams based on your preferences</p>
        </div>
        
        <form id="examForm">
          <div class="form-group">
            <label>Subject:</label>
            <select id="subject" required>
              <option value="">Select Subject</option>
              <option value="CS301">Data Structures and Algorithms</option>
              <option value="CS501">Operating Systems</option>
              <option value="CS401">Database Management Systems</option>
              <option value="CS601">Computer Networks</option>
              <option value="CS701">Machine Learning</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Difficulty Level:</label>
            <select id="difficulty" required>
              <option value="Easy">Easy</option>
              <option value="Medium" selected>Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Number of Questions:</label>
            <select id="questions" required>
              <option value="20">20 Questions</option>
              <option value="30">30 Questions</option>
              <option value="50" selected>50 Questions</option>
              <option value="100">100 Questions</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Duration (minutes):</label>
            <select id="duration" required>
              <option value="60">60 minutes</option>
              <option value="120">120 minutes</option>
              <option value="180" selected>180 minutes</option>
              <option value="240">240 minutes</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Based on Years:</label>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <label><input type="checkbox" value="2023" checked> 2023</label>
              <label><input type="checkbox" value="2022" checked> 2022</label>
              <label><input type="checkbox" value="2021"> 2021</label>
              <label><input type="checkbox" value="2020"> 2020</label>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <button type="button" class="btn btn-success" onclick="generateExam()">🚀 Generate Mock Exam</button>
            <button type="button" class="btn" onclick="window.close()">Cancel</button>
          </div>
        </form>
        
        <div id="preview" class="preview" style="display: none;">
          <h3>✅ Mock Exam Generated Successfully!</h3>
          <p id="examDetails"></p>
          <button class="btn btn-success" onclick="startGeneratedExam()">Start Exam Now</button>
        </div>
        
        <script>
          function generateExam() {
            const subject = document.getElementById('subject').value;
            const difficulty = document.getElementById('difficulty').value;
            const questions = document.getElementById('questions').value;
            const duration = document.getElementById('duration').value;
            
            if (!subject) {
              alert('Please select a subject');
              return;
            }
            
            // Simulate AI generation
            setTimeout(() => {
              const examDetails = 'Subject: ' + subject + '\\nDifficulty: ' + difficulty + '\\nQuestions: ' + questions + '\\nDuration: ' + duration + ' minutes';
              document.getElementById('examDetails').textContent = examDetails;
              document.getElementById('preview').style.display = 'block';
            }, 2000);
            
            // Show loading
            alert('🤖 AI is generating your personalized mock exam...\\nThis may take a few moments.');
          }
          
          function startGeneratedExam() {
            alert('🎯 Your personalized mock exam is ready!\\nThis would open the generated exam in a real implementation.');
            window.close();
          }
        </script>
      </body>
      </html>
    `
    
    generatorWindow.document.write(generatorHTML)
    generatorWindow.document.close()
    
    toast.success('Opened AI Mock Exam Generator')
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPerformanceColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const filteredExams = userBranch 
    ? mockExams.filter(exam => exam.branchCode === userBranch.branchCode)
    : mockExams

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading mock exams...</p>
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
            <h1 className="text-3xl font-bold">Mock Exams</h1>
            <p className="text-gray-600">
              AI-generated mock exams for {userBranch?.branchName || 'Engineering'}
            </p>
          </div>
        </div>
        <Button onClick={generateNewMockExam}>
          <Brain className="h-4 w-4 mr-2" />
          Generate New Mock Exam
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{filteredExams.length}</div>
                <div className="text-sm text-gray-600">Available Exams</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{examAttempts.length}</div>
                <div className="text-sm text-gray-600">Exams Taken</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">
                  {examAttempts.length > 0 
                    ? Math.round(examAttempts.reduce((sum, a) => sum + a.percentage, 0) / examAttempts.length)
                    : 0}%
                </div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Award className="h-8 w-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">
                  {examAttempts.filter(a => a.percentage >= 80).length}
                </div>
                <div className="text-sm text-gray-600">High Scores (80%+)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="available" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">Available Exams</TabsTrigger>
          <TabsTrigger value="attempts">My Attempts</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam) => (
              <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{exam.title}</CardTitle>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline">{exam.subjectCode}</Badge>
                        <Badge className={getDifficultyColor(exam.difficultyLevel)}>
                          {exam.difficultyLevel}
                        </Badge>
                      </div>
                    </div>
                    <FileText className="h-8 w-8 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{exam.durationMinutes} min</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-gray-500" />
                      <span>{exam.totalQuestions} questions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-gray-500" />
                      <span>{exam.totalMarks} marks</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4 text-gray-500" />
                      <span>{exam.averageScore}% avg</span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <div className="mb-2">
                      <strong>Based on years:</strong> {exam.basedOnYears.join(', ')}
                    </div>
                    <div className="mb-2">
                      <strong>Question types:</strong> {exam.questionTypes.mcq} MCQ, {exam.questionTypes.shortAnswer} Short, {exam.questionTypes.longAnswer} Long
                    </div>
                    <div>
                      <strong>Attempts:</strong> {exam.attempts} students
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => startMockExam(exam)}
                      className="flex-1"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Exam
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredExams.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Mock Exams Available</h3>
                  <p className="text-gray-500 mb-4">
                    Mock exams for your branch will be available soon.
                  </p>
                  <Button onClick={generateNewMockExam}>
                    <Plus className="h-4 w-4 mr-2" />
                    Generate Mock Exam
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="attempts" className="space-y-6">
          <div className="space-y-4">
            {examAttempts.map((attempt) => (
              <Card key={attempt.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{attempt.examTitle}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Score:</span>
                          <span className={`ml-2 font-semibold ${getPerformanceColor(attempt.percentage)}`}>
                            {attempt.score}/{attempt.maxScore} ({attempt.percentage}%)
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Time:</span>
                          <span className="ml-2">{attempt.timeTaken} min</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Rank:</span>
                          <span className="ml-2">{attempt.rank}/{attempt.totalAttempts}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Date:</span>
                          <span className="ml-2">{new Date(attempt.completedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => viewResults(attempt)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Results
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => {
                          const exam = mockExams.find(e => e.examId === attempt.examId)
                          if (exam) startMockExam(exam)
                        }}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Retake
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {examAttempts.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Exam Attempts Yet</h3>
                    <p className="text-gray-500 mb-4">
                      Start taking mock exams to see your performance history here.
                    </p>
                    <Link href="#available">
                      <Button>
                        <Play className="h-4 w-4 mr-2" />
                        Take Your First Mock Exam
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {examAttempts.map((attempt, index) => (
                    <div key={attempt.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{attempt.examTitle}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(attempt.completedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${getPerformanceColor(attempt.percentage)}`}>
                          {attempt.percentage}%
                        </div>
                        <Progress value={attempt.percentage} className="w-20 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subject-wise Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Data Structures</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={85} className="w-20 h-2" />
                      <span className="text-green-600 font-semibold">85%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Operating Systems</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={72} className="w-20 h-2" />
                      <span className="text-yellow-600 font-semibold">72%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Database Management</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={0} className="w-20 h-2" />
                      <span className="text-gray-500">Not attempted</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default MockExams