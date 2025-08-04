import { NextResponse } from "next/server";
import { db } from "../../../config/db";
import { userResumesTable, jobListingsTable, jobMatchesTable } from "../../../config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, desc } from "drizzle-orm";
import { GoogleGenAI } from '@google/genai';

const RESUME_ANALYSIS_PROMPT = `
Analyze the following resume text and extract structured information. Provide a comprehensive analysis including skills, experience, education, and recommendations.

Resume Text: {resumeText}

Please return a JSON response with the following structure:
{
  "personalInfo": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "location": "string"
  },
  "skills": {
    "technical": ["array of technical skills"],
    "soft": ["array of soft skills"],
    "tools": ["array of tools/software"],
    "languages": ["programming languages"]
  },
  "experience": {
    "totalYears": "number",
    "positions": [
      {
        "title": "string",
        "company": "string",
        "duration": "string",
        "responsibilities": ["array of responsibilities"]
      }
    ]
  },
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "year": "string",
      "grade": "string"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["array of technologies used"]
    }
  ],
  "certifications": ["array of certifications"],
  "analysisScore": "number (0-100)",
  "recommendations": [
    "array of improvement suggestions"
  ],
  "missingSkills": ["skills that would improve job prospects"],
  "careerLevel": "entry|mid|senior"
}
`;

const JOB_MATCHING_PROMPT = `
Based on the user's resume profile, recommend suitable jobs and calculate compatibility scores.

User Profile: {userProfile}
Available Jobs: {jobListings}

For each job, calculate:
1. Skill match score (0-100)
2. Experience match score (0-100)
3. Overall compatibility score (0-100)
4. Missing skills needed
5. Reasons for recommendation

Return JSON format:
{
  "matches": [
    {
      "jobId": "string",
      "compatibilityScore": number,
      "skillMatchScore": number,
      "experienceMatchScore": number,
      "missingSkills": ["array"],
      "matchReasons": ["array of reasons"],
      "recommendation": "string"
    }
  ]
}
`;

export async function GET(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    if (action === 'resumes') {
      // Get user's resumes
      const resumes = await db.select().from(userResumesTable)
        .where(eq(userResumesTable.userEmail, user.primaryEmailAddress?.emailAddress))
        .orderBy(desc(userResumesTable.uploadedAt));

      return NextResponse.json({
        success: true,
        resumes: resumes || []
      });
    }

    if (action === 'job-matches') {
      // Get job matches for user
      const matches = await db.select({
        match: jobMatchesTable,
        job: jobListingsTable
      })
      .from(jobMatchesTable)
      .innerJoin(jobListingsTable, eq(jobMatchesTable.jobId, jobListingsTable.jobId))
      .where(eq(jobMatchesTable.userEmail, user.primaryEmailAddress?.emailAddress))
      .orderBy(desc(jobMatchesTable.compatibilityScore));

      return NextResponse.json({
        success: true,
        matches: matches || []
      });
    }

    if (action === 'jobs') {
      // Get available jobs
      const jobs = await db.select().from(jobListingsTable)
        .where(eq(jobListingsTable.isActive, true))
        .orderBy(desc(jobListingsTable.scrapedAt))
        .limit(50);

      return NextResponse.json({
        success: true,
        jobs: jobs || []
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Career services error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'analyze-resume') {
      const { resumeText, fileName, fileUrl } = body;

      if (!resumeText) {
        return NextResponse.json({ error: 'Resume text is required' }, { status: 400 });
      }

      // Analyze resume using AI
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
      });

      const prompt = RESUME_ANALYSIS_PROMPT.replace('{resumeText}', resumeText);

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        config: { responseMimeType: 'text/plain' },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      const rawResponse = response?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawResponse) {
        throw new Error('No response from AI service');
      }

      let analysisData;
      try {
        const cleanedResponse = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        analysisData = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error('Failed to parse AI response:', rawResponse);
        // Fallback analysis
        analysisData = generateFallbackAnalysis(resumeText);
      }

      // Save resume analysis to database
      const resumeId = `resume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const result = await db.insert(userResumesTable).values({
        resumeId,
        userEmail: user.primaryEmailAddress?.emailAddress,
        fileName: fileName || 'resume.pdf',
        fileUrl: fileUrl || '',
        extractedText: resumeText,
        parsedData: JSON.stringify(analysisData),
        skills: JSON.stringify(analysisData.skills || {}),
        experienceYears: analysisData.experience?.totalYears?.toString() || '0',
        education: JSON.stringify(analysisData.education || []),
        projects: JSON.stringify(analysisData.projects || []),
        certifications: JSON.stringify(analysisData.certifications || []),
        analysisScore: analysisData.analysisScore || 70,
        uploadedAt: new Date().toISOString(),
        lastAnalyzed: new Date().toISOString()
      }).returning();

      // Generate job matches
      await generateJobMatches(user.primaryEmailAddress?.emailAddress, analysisData);

      return NextResponse.json({
        success: true,
        resume: result[0],
        analysis: analysisData
      });
    }

    if (action === 'generate-jobs') {
      // Generate sample job listings for demo
      const sampleJobs = generateSampleJobs();
      
      for (const job of sampleJobs) {
        await db.insert(jobListingsTable).values(job);
      }

      return NextResponse.json({
        success: true,
        message: 'Sample jobs generated'
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Career services operation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateFallbackAnalysis(resumeText) {
  // Simple fallback analysis
  const words = resumeText.toLowerCase().split(/\s+/);
  
  const technicalSkills = [];
  const commonSkills = ['javascript', 'python', 'java', 'react', 'node.js', 'sql', 'html', 'css'];
  
  commonSkills.forEach(skill => {
    if (words.some(word => word.includes(skill.toLowerCase()))) {
      technicalSkills.push(skill);
    }
  });

  return {
    personalInfo: {
      name: "User",
      email: "",
      phone: "",
      location: ""
    },
    skills: {
      technical: technicalSkills,
      soft: ["Communication", "Problem Solving", "Teamwork"],
      tools: ["Git", "VS Code"],
      languages: technicalSkills.filter(skill => ['javascript', 'python', 'java'].includes(skill.toLowerCase()))
    },
    experience: {
      totalYears: 2,
      positions: []
    },
    education: [],
    projects: [],
    certifications: [],
    analysisScore: 75,
    recommendations: [
      "Add more technical projects to showcase skills",
      "Include quantifiable achievements",
      "Add relevant certifications"
    ],
    missingSkills: ["Cloud Computing", "DevOps", "System Design"],
    careerLevel: "entry"
  };
}

async function generateJobMatches(userEmail, userProfile) {
  // Generate sample job matches
  const sampleMatches = [
    {
      matchId: `match_${Date.now()}_1`,
      userEmail,
      jobId: 'job_001',
      compatibilityScore: '85',
      skillMatchScore: '80',
      experienceMatchScore: '90',
      locationPreferenceScore: '85',
      salaryMatchScore: '80',
      missingSkills: JSON.stringify(['Cloud Computing', 'DevOps']),
      matchReasons: JSON.stringify([
        'Strong technical skills match',
        'Experience level aligns well',
        'Good cultural fit'
      ]),
      isApplied: false,
      isBookmarked: false,
      createdAt: new Date().toISOString()
    }
  ];

  for (const match of sampleMatches) {
    try {
      await db.insert(jobMatchesTable).values(match);
    } catch (error) {
      console.error('Error inserting job match:', error);
    }
  }
}

function generateSampleJobs() {
  return [
    {
      jobId: 'job_001',
      title: 'Software Engineer - Frontend',
      company: 'Tech Solutions Inc',
      location: 'Bangalore, India',
      jobType: 'full-time',
      experienceRequired: '2-4 years',
      salaryRange: '8-15 LPA',
      skillsRequired: JSON.stringify(['React', 'JavaScript', 'HTML', 'CSS', 'Node.js']),
      jobDescription: 'We are looking for a skilled Frontend Developer to join our team...',
      requirements: 'Bachelor\'s degree in Computer Science or related field...',
      sourcePortal: 'linkedin',
      sourceUrl: 'https://linkedin.com/jobs/sample',
      postedDate: new Date().toISOString(),
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      scrapedAt: new Date().toISOString()
    },
    {
      jobId: 'job_002',
      title: 'Data Scientist Intern',
      company: 'Analytics Corp',
      location: 'Mumbai, India',
      jobType: 'internship',
      experienceRequired: '0-1 years',
      salaryRange: '25-40k/month',
      skillsRequired: JSON.stringify(['Python', 'Machine Learning', 'SQL', 'Statistics']),
      jobDescription: 'Exciting internship opportunity for aspiring data scientists...',
      requirements: 'Currently pursuing or recently completed degree in relevant field...',
      sourcePortal: 'naukri',
      sourceUrl: 'https://naukri.com/jobs/sample',
      postedDate: new Date().toISOString(),
      applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      scrapedAt: new Date().toISOString()
    }
  ];
}