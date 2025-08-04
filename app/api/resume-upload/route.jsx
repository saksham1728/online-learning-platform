import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { writeFile } from 'fs/promises';
import { join } from 'path';
import GeminiResumeAnalyzer from '../../../lib/geminiResumeAnalyzer.js';

export async function POST(req) {
  try {
    console.log('Resume upload API called');
    
    const user = await currentUser();
    if (!user) {
      console.log('User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('User authenticated:', user.primaryEmailAddress?.emailAddress);

    const formData = await req.formData();
    const file = formData.get('resume');

    if (!file) {
      console.log('No file in form data');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    console.log('File received:', file.name, file.type, file.size);

    // Validate file type
    if (file.type !== 'application/pdf') {
      console.log('Invalid file type:', file.type);
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      console.log('File too large:', file.size);
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log('File converted to buffer, size:', buffer.length);

    // Create unique filename
    const userEmail = user.primaryEmailAddress?.emailAddress;
    const timestamp = Date.now();
    const filename = `resume_${userEmail}_${timestamp}.pdf`;
    const filepath = join(process.cwd(), 'uploads', filename);

    console.log('Saving file to:', filepath);

    // Save file (in production, use cloud storage like AWS S3)
    await writeFile(filepath, buffer);
    console.log('File saved successfully');

    // Use Gemini AI resume analysis
    console.log('Starting Gemini AI resume analysis...');
    const analyzer = new GeminiResumeAnalyzer();
    const analysis = await analyzer.analyzeResume(buffer, userEmail);
    console.log('Gemini AI resume analysis completed, score:', analysis.analysisScore);

    // Save analysis to database
    console.log('Saving analysis to database...');
    await saveResumeAnalysis(userEmail, analysis, filename);
    console.log('Analysis saved to database');

    return NextResponse.json({
      success: true,
      filename: filename,
      analysis: analysis
    });

  } catch (error) {
    console.error('Resume upload error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Failed to analyze resume', details: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}

// Save resume analysis to database
async function saveResumeAnalysis(userEmail, analysis, filename) {
  try {
    // Import database here to avoid circular dependencies
    const { db } = await import('../../../config/db.jsx');
    const { userResumesTable } = await import('../../../config/schema.js');
    const { eq } = await import('drizzle-orm');

    // Check if user already has a resume
    const existingResume = await db.select()
      .from(userResumesTable)
      .where(eq(userResumesTable.userEmail, userEmail))
      .limit(1);

    const resumeData = {
      fileName: filename,
      fileUrl: `/uploads/${filename}`,
      extractedText: analysis.extractedText,
      parsedData: JSON.stringify(analysis),
      skills: JSON.stringify(analysis.skills),
      experienceYears: analysis.experience.years.toString(),
      education: JSON.stringify(analysis.education),
      projects: JSON.stringify(analysis.projects),
      certifications: JSON.stringify(analysis.certifications),
      analysisScore: analysis.analysisScore,
      lastAnalyzed: new Date().toISOString()
    };

    if (existingResume.length > 0) {
      // Update existing resume
      await db.update(userResumesTable)
        .set(resumeData)
        .where(eq(userResumesTable.userEmail, userEmail));
    } else {
      // Insert new resume
      await db.insert(userResumesTable).values({
        resumeId: `resume_${userEmail}_${Date.now()}`,
        userEmail: userEmail,
        uploadedAt: new Date().toISOString(),
        ...resumeData
      });
    }

    console.log('Resume analysis saved to database');
  } catch (error) {
    console.error('Failed to save resume analysis:', error);
    // Don't throw error here, just log it
  }
}

