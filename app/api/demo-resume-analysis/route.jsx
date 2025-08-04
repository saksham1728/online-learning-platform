import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import GeminiResumeAnalyzer from '../../../lib/geminiResumeAnalyzer.js';

export async function POST(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { resumeText, userEmail } = body;

    if (!resumeText) {
      return NextResponse.json({ error: 'No resume text provided' }, { status: 400 });
    }

    console.log('Starting demo resume analysis with Gemini AI...');
    
    // Create a mock PDF buffer from text for demo purposes
    const mockBuffer = Buffer.from(resumeText, 'utf-8');
    
    // Use Gemini AI analyzer
    const analyzer = new GeminiResumeAnalyzer();
    const analysis = await analyzer.analyzeResume(mockBuffer, userEmail);
    
    console.log('Demo Gemini analysis completed:', {
      technicalSkills: analysis.skills?.technical?.length || 0,
      softSkills: analysis.skills?.soft?.length || 0,
      experience: analysis.experience?.years || 0,
      projects: analysis.projects?.length || 0,
      score: analysis.analysisScore
    });

    return NextResponse.json({
      success: true,
      analysis: analysis,
      message: 'Demo resume analyzed with Gemini AI'
    });

  } catch (error) {
    console.error('Demo resume analysis error:', error);
    
    // Fallback analysis if Gemini fails
    const fallbackAnalysis = {
      personalInfo: {
        name: user?.firstName + ' ' + user?.lastName,
        email: userEmail,
        phone: '+91 9876543210',
        location: 'Bangalore, India'
      },
      skills: {
        technical: ['JavaScript', 'Python', 'React', 'Node.js', 'HTML', 'CSS'],
        soft: ['Communication', 'Problem Solving', 'Team Work', 'Leadership']
      },
      experience: {
        years: 1,
        internships: 1,
        projects: 3,
        companies: ['TechCorp']
      },
      education: {
        degree: 'Computer Science Engineering',
        university: 'VTU',
        cgpa: 8.2,
        year: 2024
      },
      projects: [
        {
          name: 'Web Application',
          description: 'Full-stack web application',
          technologies: ['React', 'Node.js', 'MongoDB']
        }
      ],
      certifications: ['Programming Certification'],
      analysisScore: 78,
      strengths: ['Good technical foundation', 'Academic performance'],
      improvements: ['Add more experience', 'Include certifications'],
      recommendations: ['Build more projects', 'Get industry certifications'],
      extractedText: resumeText
    };

    return NextResponse.json({
      success: true,
      analysis: fallbackAnalysis,
      message: 'Demo resume analyzed with fallback data'
    });
  }
}