import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from '../../../config/db.jsx';
import { userResumesTable } from '../../../config/schema.js';
import { eq } from 'drizzle-orm';

export async function GET(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.primaryEmailAddress?.emailAddress;
    
    // Get user's resume from database
    const resume = await db.select()
      .from(userResumesTable)
      .where(eq(userResumesTable.userEmail, userEmail))
      .limit(1);

    if (resume.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'No resume found. Please upload your resume first.' 
      });
    }

    const resumeData = resume[0];
    
    // Parse the stored JSON data
    const parsedData = JSON.parse(resumeData.parsedData || '{}');
    const skills = JSON.parse(resumeData.skills || '{"technical": [], "soft": []}');
    const education = JSON.parse(resumeData.education || '{}');
    const projects = JSON.parse(resumeData.projects || '[]');
    const certifications = JSON.parse(resumeData.certifications || '[]');

    const analysis = {
      ...parsedData,
      personalInfo: parsedData.personalInfo || {
        name: 'Not found',
        email: userEmail,
        phone: 'Not found',
        location: 'Not found'
      },
      skills: skills,
      experience: parsedData.experience || {
        years: 0,
        internships: 0,
        projects: 0,
        companies: []
      },
      education: education,
      projects: projects,
      certifications: certifications,
      analysisScore: resumeData.analysisScore || 0,
      strengths: parsedData.strengths || [],
      improvements: parsedData.improvements || [],
      recommendations: parsedData.recommendations || []
    };

    return NextResponse.json({
      success: true,
      resume: analysis,
      lastAnalyzed: resumeData.lastAnalyzed,
      fileName: resumeData.fileName
    });

  } catch (error) {
    console.error('Resume analysis fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resume analysis', details: error.message },
      { status: 500 }
    );
  }
}