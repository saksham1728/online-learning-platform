const { db } = require('../config/db.jsx');
const { notesTable } = require('../config/schema.js');

const sampleNotes = [
  {
    noteId: 'note_dsa_001',
    title: 'Data Structures and Algorithms - Complete Notes',
    subject: 'Computer Science',
    subjectCode: 'CS301',
    branch: 'CSE',
    pdfUrl: '/sample-notes/dsa-notes.pdf',
    uploadDate: '2024-01-15T10:00:00Z',
    downloadCount: 2450,
    pages: 120,
    fileSize: '2.5 MB',
    extractedQuestions: JSON.stringify([]),
    createdBy: 'admin@example.com',
    isPublic: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    noteId: 'note_os_001',
    title: 'Operating Systems Concepts',
    subject: 'Computer Science',
    subjectCode: 'CS501',
    branch: 'CSE',
    pdfUrl: '/sample-notes/os-notes.pdf',
    uploadDate: '2024-01-10T09:00:00Z',
    downloadCount: 1890,
    pages: 95,
    fileSize: '1.8 MB',
    extractedQuestions: JSON.stringify([]),
    createdBy: 'admin@example.com',
    isPublic: true,
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-10T09:00:00Z'
  },
  {
    noteId: 'note_dbms_001',
    title: 'Database Management Systems',
    subject: 'Computer Science',
    subjectCode: 'CS401',
    branch: 'CSE',
    pdfUrl: '/sample-notes/dbms-notes.pdf',
    uploadDate: '2024-01-08T11:00:00Z',
    downloadCount: 2100,
    pages: 110,
    fileSize: '2.2 MB',
    extractedQuestions: JSON.stringify([]),
    createdBy: 'admin@example.com',
    isPublic: true,
    createdAt: '2024-01-08T11:00:00Z',
    updatedAt: '2024-01-08T11:00:00Z'
  },
  {
    noteId: 'note_circuits_001',
    title: 'Circuit Analysis and Design',
    subject: 'Electronics',
    subjectCode: 'EC101',
    branch: 'ECE',
    pdfUrl: '/sample-notes/circuits-notes.pdf',
    uploadDate: '2024-01-12T14:00:00Z',
    downloadCount: 1650,
    pages: 85,
    fileSize: '1.9 MB',
    extractedQuestions: JSON.stringify([]),
    createdBy: 'admin@example.com',
    isPublic: true,
    createdAt: '2024-01-12T14:00:00Z',
    updatedAt: '2024-01-12T14:00:00Z'
  },
  {
    noteId: 'note_digital_001',
    title: 'Digital Electronics Fundamentals',
    subject: 'Electronics',
    subjectCode: 'EC301',
    branch: 'ECE',
    pdfUrl: '/sample-notes/digital-notes.pdf',
    uploadDate: '2024-01-05T13:00:00Z',
    downloadCount: 1420,
    pages: 75,
    fileSize: '1.6 MB',
    extractedQuestions: JSON.stringify([]),
    createdBy: 'admin@example.com',
    isPublic: true,
    createdAt: '2024-01-05T13:00:00Z',
    updatedAt: '2024-01-05T13:00:00Z'
  },
  {
    noteId: 'note_thermo_001',
    title: 'Thermodynamics and Heat Transfer',
    subject: 'Mechanical Engineering',
    subjectCode: 'ME201',
    branch: 'MECH',
    pdfUrl: '/sample-notes/thermo-notes.pdf',
    uploadDate: '2024-01-03T15:00:00Z',
    downloadCount: 1280,
    pages: 100,
    fileSize: '2.0 MB',
    extractedQuestions: JSON.stringify([]),
    createdBy: 'admin@example.com',
    isPublic: true,
    createdAt: '2024-01-03T15:00:00Z',
    updatedAt: '2024-01-03T15:00:00Z'
  }
];

async function seedNotes() {
  try {
    console.log('🌱 Seeding notes database...');
    
    // Insert sample notes
    for (const note of sampleNotes) {
      try {
        await db.insert(notesTable).values(note);
        console.log(`✅ Inserted note: ${note.title}`);
      } catch (error) {
        if (error.code === '23505') { // Unique constraint violation
          console.log(`⚠️  Note already exists: ${note.title}`);
        } else {
          console.error(`❌ Error inserting note ${note.title}:`, error);
        }
      }
    }
    
    console.log('🎉 Notes seeding completed!');
    console.log(`📊 Total notes: ${sampleNotes.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding notes:', error);
    process.exit(1);
  }
}

// Run the seed function
seedNotes();