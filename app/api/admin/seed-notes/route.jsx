import { NextResponse } from "next/server";
import { db } from "../../../../config/db.jsx";
import { notesTable } from "../../../../config/schema.js";
import { currentUser } from "@clerk/nextjs/server";

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
    isPublic: true,
    createdAt: '2024-01-03T15:00:00Z',
    updatedAt: '2024-01-03T15:00:00Z'
  }
];

export async function POST() {
  try {
    console.log('🌱 Seeding notes database...');
    
    // Get current user or use null for createdBy
    const user = await currentUser();
    const userEmail = user?.emailAddresses[0]?.emailAddress || null;
    
    const results = [];
    
    // Insert sample notes
    for (const note of sampleNotes) {
      try {
        // Create note data with current user or null
        const noteData = {
          ...note,
          createdBy: userEmail // Use current user's email or null
        };
        
        await db.insert(notesTable).values(noteData);
        console.log(`✅ Inserted note: ${note.title}`);
        results.push({ success: true, title: note.title, message: 'Inserted successfully' });
      } catch (error) {
        if (error.code === '23505') { // Unique constraint violation
          console.log(`⚠️  Note already exists: ${note.title}`);
          results.push({ success: true, title: note.title, message: 'Already exists' });
        } else {
          console.error(`❌ Error inserting note ${note.title}:`, error);
          results.push({ success: false, title: note.title, message: error.message });
        }
      }
    }
    
    console.log('🎉 Notes seeding completed!');
    
    return NextResponse.json({
      success: true,
      message: 'Notes seeding completed successfully!',
      totalNotes: sampleNotes.length,
      results: results,
      userEmail: userEmail || 'No user logged in'
    });
    
  } catch (error) {
    console.error('❌ Error seeding notes:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to seed notes',
      message: error.message
    }, { status: 500 });
  }
}