const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const { pgTable, varchar, json, integer, boolean } = require('drizzle-orm/pg-core');
require('dotenv').config();

const pg = neon(process.env.DATABASE_URL);
const db = drizzle({ client: pg });

// Define table schemas
const questionPapersTable = pgTable("question_papers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  paperId: varchar('paper_id').notNull().unique(),
  branchCode: varchar('branch_code').notNull(),
  subjectCode: varchar('subject_code').notNull(),
  subjectName: varchar('subject_name').notNull(),
  university: varchar({ length: 200 }),
  examYear: integer('exam_year').notNull(),
  examType: varchar('exam_type'),
  pdfUrl: varchar('pdf_url').notNull(),
  extractedQuestions: json('extracted_questions'),
  difficultyLevel: varchar('difficulty_level'),
  totalMarks: integer('total_marks'),
  durationMinutes: integer('duration_minutes'),
  uploadedBy: varchar('uploaded_by'),
  uploadDate: varchar('upload_date').default('NOW()'),
  downloadCount: integer('download_count').default(0)
});

const mockExamsTable = pgTable("mock_exams", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  examId: varchar('exam_id').notNull().unique(),
  title: varchar({ length: 200 }).notNull(),
  branchCode: varchar('branch_code').notNull(),
  subjectCode: varchar('subject_code').notNull(),
  basedOnYears: json('based_on_years'),
  questions: json().notNull(),
  totalMarks: integer('total_marks'),
  durationMinutes: integer('duration_minutes'),
  createdBy: varchar('created_by').notNull(),
  createdAt: varchar('created_at').default('NOW()'),
  isPublic: boolean().default(true)
});

// Sample question papers
const sampleQuestionPapers = [
  {
    paperId: 'CSE301-2023-VTU',
    branchCode: 'CSE',
    subjectCode: 'CS301',
    subjectName: 'Data Structures and Algorithms',
    university: 'VTU',
    examYear: 2023,
    examType: 'Regular',
    pdfUrl: '/sample-papers/dsa-2023.pdf',
    extractedQuestions: JSON.stringify([]),
    difficultyLevel: 'Medium',
    totalMarks: 100,
    durationMinutes: 180,
    uploadedBy: 'system@example.com',
    downloadCount: 1250
  },
  {
    paperId: 'CSE501-2023-VTU',
    branchCode: 'CSE',
    subjectCode: 'CS501',
    subjectName: 'Operating Systems',
    university: 'VTU',
    examYear: 2023,
    examType: 'Regular',
    pdfUrl: '/sample-papers/os-2023.pdf',
    extractedQuestions: JSON.stringify([]),
    difficultyLevel: 'Hard',
    totalMarks: 100,
    durationMinutes: 180,
    uploadedBy: 'system@example.com',
    downloadCount: 980
  },
  {
    paperId: 'CSE401-2022-VTU',
    branchCode: 'CSE',
    subjectCode: 'CS401',
    subjectName: 'Database Management Systems',
    university: 'VTU',
    examYear: 2022,
    examType: 'Regular',
    pdfUrl: '/sample-papers/dbms-2022.pdf',
    extractedQuestions: JSON.stringify([]),
    difficultyLevel: 'Medium',
    totalMarks: 100,
    durationMinutes: 180,
    uploadedBy: 'system@example.com',
    downloadCount: 1100
  },
  {
    paperId: 'ECE101-2023-VTU',
    branchCode: 'ECE',
    subjectCode: 'EC101',
    subjectName: 'Circuit Analysis',
    university: 'VTU',
    examYear: 2023,
    examType: 'Regular',
    pdfUrl: '/sample-papers/circuits-2023.pdf',
    extractedQuestions: JSON.stringify([]),
    difficultyLevel: 'Easy',
    totalMarks: 100,
    durationMinutes: 180,
    uploadedBy: 'system@example.com',
    downloadCount: 850
  },
  {
    paperId: 'ECE301-2023-VTU',
    branchCode: 'ECE',
    subjectCode: 'EC301',
    subjectName: 'Digital Electronics',
    university: 'VTU',
    examYear: 2023,
    examType: 'Regular',
    pdfUrl: '/sample-papers/digital-2023.pdf',
    extractedQuestions: JSON.stringify([]),
    difficultyLevel: 'Medium',
    totalMarks: 100,
    durationMinutes: 180,
    uploadedBy: 'system@example.com',
    downloadCount: 720
  }
];

// Sample mock exams
const sampleMockExams = [
  {
    examId: 'MOCK-CSE-DS-2024-001',
    title: 'Data Structures Mock Exam',
    branchCode: 'CSE',
    subjectCode: 'CS301',
    basedOnYears: JSON.stringify([2021, 2022, 2023]),
    questions: JSON.stringify([
      {
        id: 1,
        question: "What is the time complexity of binary search?",
        options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
        correctAnswer: 1,
        marks: 2
      },
      {
        id: 2,
        question: "Which data structure uses LIFO principle?",
        options: ["Queue", "Stack", "Array", "Linked List"],
        correctAnswer: 1,
        marks: 2
      }
    ]),
    totalMarks: 100,
    durationMinutes: 180,
    createdBy: 'ai-generator@system.com'
  },
  {
    examId: 'MOCK-CSE-OS-2024-002',
    title: 'Operating Systems Mock Exam',
    branchCode: 'CSE',
    subjectCode: 'CS501',
    basedOnYears: JSON.stringify([2020, 2021, 2022, 2023]),
    questions: JSON.stringify([
      {
        id: 1,
        question: "What is a process in operating systems?",
        options: ["A program in execution", "A file", "A directory", "A command"],
        correctAnswer: 0,
        marks: 2
      },
      {
        id: 2,
        question: "Which scheduling algorithm is preemptive?",
        options: ["FCFS", "SJF", "Round Robin", "Priority"],
        correctAnswer: 2,
        marks: 2
      }
    ]),
    totalMarks: 100,
    durationMinutes: 180,
    createdBy: 'ai-generator@system.com'
  }
];

async function seedTestData() {
  try {
    console.log('🌱 Seeding test data...');
    
    // Seed question papers
    console.log('📄 Seeding question papers...');
    for (const paper of sampleQuestionPapers) {
      try {
        await db.insert(questionPapersTable).values({
          paperId: paper.paperId,
          branchCode: paper.branchCode,
          subjectCode: paper.subjectCode,
          subjectName: paper.subjectName,
          university: paper.university,
          examYear: paper.examYear,
          examType: paper.examType,
          pdfUrl: paper.pdfUrl,
          extractedQuestions: paper.extractedQuestions,
          difficultyLevel: paper.difficultyLevel,
          totalMarks: paper.totalMarks,
          durationMinutes: paper.durationMinutes,
          uploadedBy: null,
          uploadDate: new Date().toISOString(),
          downloadCount: paper.downloadCount
        }).onConflictDoNothing();
        
        console.log(`✅ Added question paper: ${paper.subjectName} (${paper.examYear})`);
      } catch (error) {
        console.log(`⚠️  Paper ${paper.paperId} might already exist:`, error.message);
      }
    }
    
    // Seed mock exams
    console.log('🎯 Seeding mock exams...');
    for (const exam of sampleMockExams) {
      try {
        await db.insert(mockExamsTable).values({
          examId: exam.examId,
          title: exam.title,
          branchCode: exam.branchCode,
          subjectCode: exam.subjectCode,
          basedOnYears: exam.basedOnYears,
          questions: exam.questions,
          totalMarks: exam.totalMarks,
          durationMinutes: exam.durationMinutes,
          createdBy: 'system',
          createdAt: new Date().toISOString(),
          isPublic: true
        }).onConflictDoNothing();
        
        console.log(`✅ Added mock exam: ${exam.title}`);
      } catch (error) {
        console.log(`⚠️  Mock exam ${exam.examId} might already exist:`, error.message);
      }
    }
    
    console.log('🎉 Test data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
  }
}

seedTestData().then(() => {
  console.log('✨ Test data seeding completed!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test data seeding failed:', error);
  process.exit(1);
});