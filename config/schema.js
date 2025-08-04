
import { integer, pgTable, varchar, boolean, json } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  subscriptionId:varchar(),
});

export const coursesTable= pgTable("courses",{
  id:integer().primaryKey().generatedAlwaysAsIdentity(),
  cid:varchar().notNull().unique(),
  name:varchar(),
  description:varchar(),
  noOfChapters:integer().notNull(),
  includeVideo:boolean().default(false),
  level:varchar().notNull(),
  category:varchar(),
  courseJson:json(),
  bannerImageUrl:varchar().default(''),
  courseContent:json().default({}),
  userEmail:varchar('userEmail').references(()=>usersTable.email)
})

export const enrollCourseTable= pgTable("enrollCourse",{
  id:integer().primaryKey().generatedAlwaysAsIdentity(),
  cid:varchar('cid'), // Remove foreign key reference temporarily
  userEmail:varchar('userEmail').references(()=>usersTable.email).notNull(),
  completedChapters:json()
})

// Quiz-related tables
export const quizzesTable = pgTable("quizzes", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  quizId: varchar('quiz_id').notNull().unique(),
  title: varchar().notNull(),
  description: varchar(),
  topic: varchar().notNull(),
  courseId: varchar('course_id'), // Remove foreign key reference for now
  creatorEmail: varchar('creator_email').references(() => usersTable.email).notNull(),
  settings: json().notNull(),
  questions: json().notNull(),
  isPublished: boolean().default(true),
  createdAt: varchar('created_at').default('NOW()'),
  updatedAt: varchar('updated_at').default('NOW()')
});

export const quizAttemptsTable = pgTable("quiz_attempts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  attemptId: varchar('attempt_id').notNull().unique(),
  quizId: varchar('quiz_id').references(() => quizzesTable.quizId),
  userEmail: varchar('user_email').references(() => usersTable.email).notNull(),
  answers: json().notNull(),
  score: integer().notNull(),
  maxScore: integer().notNull(),
  startTime: varchar('start_time').notNull(),
  endTime: varchar('end_time'),
  isCompleted: boolean().default(false),
  timeTaken: integer(), // in seconds
  createdAt: varchar('created_at').default('NOW()')
});

export const practiceSessionsTable = pgTable("practice_sessions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  sessionId: varchar('session_id').notNull().unique(),
  userEmail: varchar('user_email').references(() => usersTable.email).notNull(),
  topic: varchar().notNull(),
  questionsAnswered: integer().default(0),
  correctAnswers: integer().default(0),
  sessionData: json(),
  createdAt: varchar('created_at').default('NOW()'),
  updatedAt: varchar('updated_at').default('NOW()')
});

export const questionBanksTable = pgTable("question_banks", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  bankId: varchar('bank_id').notNull().unique(),
  name: varchar().notNull(),
  description: varchar(),
  creatorEmail: varchar('creator_email').references(() => usersTable.email).notNull(),
  questions: json().notNull(),
  tags: json(), // array of strings
  isPublic: boolean().default(false),
  createdAt: varchar('created_at').default('NOW()')
});

// Question Papers System
export const questionPapersTable = pgTable("question_papers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  paperId: varchar('paper_id').notNull().unique(),
  branchCode: varchar('branch_code').references(() => engineeringBranchesTable.branchCode).notNull(),
  subjectCode: varchar('subject_code').notNull(),
  subjectName: varchar('subject_name').notNull(),
  university: varchar({ length: 200 }),
  examYear: integer('exam_year').notNull(),
  examType: varchar('exam_type'), // semester, annual, supplementary
  pdfUrl: varchar('pdf_url').notNull(),
  extractedQuestions: json('extracted_questions'),
  difficultyLevel: varchar('difficulty_level'),
  totalMarks: integer('total_marks'),
  durationMinutes: integer('duration_minutes'),
  uploadedBy: varchar('uploaded_by').references(() => usersTable.email),
  uploadDate: varchar('upload_date').default('NOW()'),
  downloadCount: integer('download_count').default(0)
});

// Mock Exams
export const mockExamsTable = pgTable("mock_exams", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  examId: varchar('exam_id').notNull().unique(),
  title: varchar({ length: 200 }).notNull(),
  branchCode: varchar('branch_code').references(() => engineeringBranchesTable.branchCode).notNull(),
  subjectCode: varchar('subject_code').notNull(),
  basedOnYears: json('based_on_years'), // Array of years used for pattern
  questions: json().notNull(),
  totalMarks: integer('total_marks'),
  durationMinutes: integer('duration_minutes'),
  createdBy: varchar('created_by').references(() => usersTable.email).notNull(),
  createdAt: varchar('created_at').default('NOW()'),
  isPublic: boolean().default(true)
});

// Mock Exam Attempts
export const mockExamAttemptsTable = pgTable("mock_exam_attempts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  attemptId: varchar('attempt_id').notNull().unique(),
  examId: varchar('exam_id').references(() => mockExamsTable.examId).notNull(),
  userEmail: varchar('user_email').references(() => usersTable.email).notNull(),
  answers: json().notNull(),
  score: integer(),
  percentage: varchar(), // Store as string to avoid decimal issues
  timeTaken: integer(), // in seconds
  startedAt: varchar('started_at'),
  completedAt: varchar('completed_at'),
  analysis: json() // Detailed performance analysis
});

// Resume and Career Services
export const userResumesTable = pgTable("user_resumes", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  resumeId: varchar('resume_id').notNull().unique(),
  userEmail: varchar('user_email').references(() => usersTable.email).notNull(),
  fileName: varchar('file_name').notNull(),
  fileUrl: varchar('file_url').notNull(),
  extractedText: varchar('extracted_text'),
  parsedData: json('parsed_data'), // Structured resume data
  skills: json(), // Array of extracted skills
  experienceYears: varchar('experience_years'),
  education: json(),
  projects: json(),
  certifications: json(),
  analysisScore: integer('analysis_score'), // Overall resume score
  uploadedAt: varchar('uploaded_at').default('NOW()'),
  lastAnalyzed: varchar('last_analyzed').default('NOW()')
});

// Job Listings (scraped from various portals)
export const jobListingsTable = pgTable("job_listings", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  jobId: varchar('job_id').notNull().unique(),
  title: varchar({ length: 300 }).notNull(),
  company: varchar({ length: 200 }).notNull(),
  location: varchar({ length: 200 }),
  jobType: varchar('job_type'), // full-time, internship, contract
  experienceRequired: varchar('experience_required'),
  salaryRange: varchar('salary_range'),
  skillsRequired: json('skills_required'),
  jobDescription: varchar('job_description'),
  requirements: varchar('requirements'),
  sourcePortal: varchar('source_portal'), // linkedin, naukri, indeed
  sourceUrl: varchar('source_url'),
  postedDate: varchar('posted_date'),
  applicationDeadline: varchar('application_deadline'),
  isActive: boolean().default(true),
  scrapedAt: varchar('scraped_at').default('NOW()')
});

// Job Recommendations and Matches
export const jobMatchesTable = pgTable("job_matches", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  matchId: varchar('match_id').notNull().unique(),
  userEmail: varchar('user_email').references(() => usersTable.email).notNull(),
  jobId: varchar('job_id').references(() => jobListingsTable.jobId).notNull(),
  compatibilityScore: varchar('compatibility_score'), // 0-100 match percentage
  skillMatchScore: varchar('skill_match_score'),
  experienceMatchScore: varchar('experience_match_score'),
  locationPreferenceScore: varchar('location_preference_score'),
  salaryMatchScore: varchar('salary_match_score'),
  missingSkills: json('missing_skills'), // Skills user needs to develop
  matchReasons: json('match_reasons'), // Why this job was recommended
  isApplied: boolean().default(false),
  isBookmarked: boolean().default(false),
  userFeedback: varchar('user_feedback'), // interested, not_interested, applied
  createdAt: varchar('created_at').default('NOW()')
});

// Engineering Portal Tables
export const engineeringBranchesTable = pgTable("engineering_branches", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  branchCode: varchar('branch_code', { length: 10 }).notNull().unique(),
  branchName: varchar('branch_name', { length: 100 }).notNull(),
  description: varchar(),
  subjects: json(), // Array of subjects for this branch
  toolsAvailable: json(), // Available tools for this branch
  createdAt: varchar('created_at').default('NOW()')
});

export const userBranchesTable = pgTable("user_branches", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userEmail: varchar('user_email').references(() => usersTable.email).notNull(),
  branchCode: varchar('branch_code').references(() => engineeringBranchesTable.branchCode).notNull(),
  enrollmentDate: varchar('enrollment_date').default('NOW()'),
  isPrimary: boolean().default(false),
  semester: integer().default(1),
  academicYear: varchar('academic_year') // e.g., "2023-2024"
});

export const branchSubjectsTable = pgTable("branch_subjects", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  branchCode: varchar('branch_code').references(() => engineeringBranchesTable.branchCode).notNull(),
  subjectCode: varchar('subject_code', { length: 20 }).notNull(),
  subjectName: varchar('subject_name', { length: 200 }).notNull(),
  semester: integer().notNull(),
  credits: integer().default(3),
  isCore: boolean().default(true),
  prerequisites: json(), // Array of prerequisite subject codes
  syllabus: json() // Detailed syllabus content
});

// Branch-specific progress tracking
export const branchProgressTable = pgTable("branch_progress", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userEmail: varchar('user_email').references(() => usersTable.email).notNull(),
  branchCode: varchar('branch_code').references(() => engineeringBranchesTable.branchCode).notNull(),
  subjectCode: varchar('subject_code').notNull(),
  activityType: varchar('activity_type').notNull(), // quiz, practice, reading, assignment
  progressData: json('progress_data'), // Detailed progress information
  completionPercentage: integer('completion_percentage').default(0),
  createdAt: varchar('created_at').default('NOW()'),
  lastUpdated: varchar('last_updated').default('NOW()')
});

// Code Sharing Portal Tables
export const sharedCodesTable = pgTable("shared_codes", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  shareId: varchar('share_id').notNull().unique(), // Public UUID for sharing
  userId: varchar('user_id').references(() => usersTable.email).notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  description: varchar('description', { length: 1000 }),
  code: varchar('code'), // The actual code content
  language: varchar('language', { length: 50 }).notNull(),
  category: varchar('category', { length: 100 }),
  tags: json('tags'), // Array of strings
  isPublic: boolean('is_public').default(true),
  isPasswordProtected: boolean('is_password_protected').default(false),
  passwordHash: varchar('password_hash'), // If password protected
  expiresAt: varchar('expires_at'), // ISO string or null for never
  allowComments: boolean('allow_comments').default(true),
  allowForking: boolean('allow_forking').default(true),
  viewCount: integer('view_count').default(0),
  createdAt: varchar('created_at').default('NOW()'),
  updatedAt: varchar('updated_at').default('NOW()'),
  lastViewedAt: varchar('last_viewed_at')
});

export const shareAnalyticsTable = pgTable("share_analytics", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  shareId: varchar('share_id').references(() => sharedCodesTable.shareId).notNull(),
  viewerIP: varchar('viewer_ip'), // Hashed for privacy
  userAgent: varchar('user_agent'),
  referrer: varchar('referrer'),
  country: varchar('country', { length: 100 }), // From IP geolocation
  viewedAt: varchar('viewed_at').default('NOW()'),
  sessionDuration: integer('session_duration') // In seconds
});

export const shareCommentsTable = pgTable("share_comments", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  shareId: varchar('share_id').references(() => sharedCodesTable.shareId).notNull(),
  commenterName: varchar('commenter_name', { length: 100 }).notNull(),
  commenterEmail: varchar('commenter_email', { length: 255 }),
  comment: varchar('comment'), // The comment text
  isApproved: boolean('is_approved').default(false),
  createdAt: varchar('created_at').default('NOW()'),
  approvedAt: varchar('approved_at')
});

// Notes Management System
export const notesTable = pgTable("notes", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  noteId: varchar('note_id').notNull().unique(),
  title: varchar('title', { length: 500 }).notNull(),
  subject: varchar('subject', { length: 100 }),
  subjectCode: varchar('subject_code', { length: 20 }),
  branch: varchar('branch', { length: 50 }),
  pdfUrl: varchar('pdf_url').notNull(),
  uploadDate: varchar('upload_date').default('NOW()'),
  downloadCount: integer('download_count').default(0),
  pages: integer().default(0),
  fileSize: varchar('file_size'),
  extractedQuestions: json('extracted_questions'),
  createdBy: varchar('created_by').references(() => usersTable.email),
  isPublic: boolean('is_public').default(true),
  createdAt: varchar('created_at').default('NOW()'),
  updatedAt: varchar('updated_at').default('NOW()')
});

export const extractedQuestionsTable = pgTable("extracted_questions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  questionId: varchar('question_id').notNull().unique(),
  noteId: varchar('note_id').references(() => notesTable.noteId).notNull(),
  question: varchar('question').notNull(),
  answer: varchar('answer'),
  difficulty: varchar('difficulty'), // Easy, Medium, Hard
  topic: varchar('topic', { length: 200 }),
  questionType: varchar('question_type'), // MCQ, Short Answer, Long Answer
  marks: integer().default(1),
  extractedAt: varchar('extracted_at').default('NOW()'),
  verifiedBy: varchar('verified_by').references(() => usersTable.email),
  isVerified: boolean('is_verified').default(false)
});
