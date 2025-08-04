import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import JobScraper from "../../../lib/jobScraper.js";
import { db } from "../../../config/db.jsx";
import { jobListingsTable } from "../../../config/schema.js";
import { eq, and, gte } from "drizzle-orm";

export async function POST(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { resumeData, branchCode, forceRefresh = false } = body;

    let jobs = [];

    // Check if we should use cached jobs or scrape fresh data
    if (!forceRefresh) {
      // Try to get recent jobs from database (within last 24 hours)
      const recentJobs = await getRecentJobsFromDB(branchCode);
      if (recentJobs.length > 0) {
        console.log(`Using ${recentJobs.length} cached jobs from database`);
        jobs = recentJobs;
      }
    }

    // If no cached jobs or force refresh, scrape new data
    if (jobs.length === 0 || forceRefresh) {
      console.log('Starting real job scraping...');
      const scraper = new JobScraper();
      
      try {
        // Scrape jobs from all portals
        jobs = await scraper.scrapeAllPortals(resumeData, branchCode);
        
        // Save scraped jobs to database
        if (jobs.length > 0) {
          await saveJobsToDB(jobs);
          console.log(`Saved ${jobs.length} jobs to database`);
        }
        
      } catch (scrapingError) {
        console.error('Scraping failed:', scrapingError);
        // Fallback to database jobs if scraping fails
        jobs = await getRecentJobsFromDB(branchCode, 7); // Get jobs from last 7 days
      } finally {
        await scraper.closeBrowser();
      }
    }

    // Calculate match scores based on resume data
    const rankedJobs = calculateJobMatches(jobs, resumeData);

    return NextResponse.json({
      success: true,
      jobs: rankedJobs.slice(0, 20), // Return top 20 matches
      totalJobs: rankedJobs.length,
      scrapedAt: new Date().toISOString(),
      source: forceRefresh ? 'fresh_scrape' : 'cached_with_scrape'
    });

  } catch (error) {
    console.error('Job recommendations error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Helper function to parse skills field (handles both JSON and comma-separated strings)
function parseSkillsField(skillsData) {
  if (!skillsData) return [];
  
  try {
    // Try to parse as JSON first
    return JSON.parse(skillsData);
  } catch (error) {
    // If JSON parsing fails, treat as comma-separated string
    if (typeof skillsData === 'string') {
      return skillsData.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
    }
    return [];
  }
}

// Get recent jobs from database
async function getRecentJobsFromDB(branchCode, daysBack = 1) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    
    const jobs = await db.select()
      .from(jobListingsTable)
      .where(
        and(
          eq(jobListingsTable.isActive, true),
          gte(jobListingsTable.scrapedAt, cutoffDate.toISOString())
        )
      )
      .limit(50);

    return jobs.map(job => ({
      id: job.jobId,
      title: job.title,
      company: job.company,
      location: job.location,
      jobType: job.jobType,
      experience: job.experienceRequired,
      salary: job.salaryRange,
      skills: parseSkillsField(job.skillsRequired),
      description: job.jobDescription,
      requirements: parseSkillsField(job.requirements),
      source: job.sourcePortal,
      url: job.sourceUrl,
      postedDate: job.postedDate,
      scrapedAt: job.scrapedAt
    }));

  } catch (error) {
    console.error('Error getting jobs from DB:', error);
    return [];
  }
}

// Save scraped jobs to database
async function saveJobsToDB(jobs) {
  try {
    const jobsToInsert = jobs.map(job => ({
      jobId: job.id,
      title: job.title,
      company: job.company,
      location: job.location || 'Not specified',
      jobType: job.jobType || 'Full-time',
      experienceRequired: job.experience || 'Not specified',
      salaryRange: job.salary || 'Not disclosed',
      skillsRequired: JSON.stringify(job.skills || []),
      jobDescription: job.description || '',
      requirements: JSON.stringify(job.requirements || []),
      sourcePortal: job.source,
      sourceUrl: job.url || '',
      postedDate: job.postedDate || new Date().toISOString(),
      applicationDeadline: null,
      isActive: true,
      scrapedAt: new Date().toISOString()
    }));

    // Insert jobs in batches to avoid overwhelming the database
    const batchSize = 10;
    for (let i = 0; i < jobsToInsert.length; i += batchSize) {
      const batch = jobsToInsert.slice(i, i + batchSize);
      await db.insert(jobListingsTable).values(batch).onConflictDoNothing();
    }

  } catch (error) {
    console.error('Error saving jobs to DB:', error);
  }
}



// Enhanced job match calculation with better skill-based filtering
function calculateJobMatches(jobs, resumeData) {
  console.log('Calculating matches for resume data:', resumeData);
  
  return jobs.map(job => {
    let matchScore = 0;
    let factors = [];

    // Enhanced skill matching (50% weight - increased importance)
    const userSkills = (resumeData.skills?.technical || []).map(skill => skill.toLowerCase());
    const jobSkills = job.skills.map(skill => skill.toLowerCase());
    
    // Calculate different types of skill matches
    const exactMatches = jobSkills.filter(jobSkill => 
      userSkills.some(userSkill => userSkill === jobSkill)
    );
    
    const partialMatches = jobSkills.filter(jobSkill => 
      userSkills.some(userSkill => 
        userSkill.includes(jobSkill) || jobSkill.includes(userSkill)
      ) && !exactMatches.includes(jobSkill)
    );

    const relatedMatches = getRelatedSkillMatches(userSkills, jobSkills);
    
    // Calculate skill score with weighted matching
    let skillScore = 0;
    if (jobSkills.length > 0) {
      const exactWeight = 1.0;
      const partialWeight = 0.7;
      const relatedWeight = 0.4;
      
      const totalWeight = (exactMatches.length * exactWeight) + 
                         (partialMatches.length * partialWeight) + 
                         (relatedMatches.length * relatedWeight);
      
      skillScore = Math.min((totalWeight / jobSkills.length) * 100, 100);
    }
    
    matchScore += skillScore * 0.5;
    factors.push(`Skills: ${exactMatches.length} exact, ${partialMatches.length} partial matches`);

    // Job title relevance (20% weight)
    const titleRelevance = calculateTitleRelevance(job.title, userSkills, resumeData.experience?.years || 0);
    matchScore += titleRelevance * 0.2;
    factors.push(`Title relevance: ${Math.round(titleRelevance)}%`);

    // Experience matching (15% weight)
    const userExperience = resumeData.experience?.years || 0;
    const jobExperienceRange = parseExperienceRange(job.experience);
    
    let experienceScore = 0;
    if (userExperience >= jobExperienceRange.min && userExperience <= jobExperienceRange.max) {
      experienceScore = 100;
    } else if (userExperience < jobExperienceRange.min) {
      const gap = jobExperienceRange.min - userExperience;
      experienceScore = Math.max(0, 100 - (gap * 15)); // Less penalty for experience gap
    } else {
      experienceScore = 95; // Overqualified but still very good
    }
    
    matchScore += experienceScore * 0.15;
    factors.push(`Experience: ${userExperience} years vs required ${job.experience}`);

    // Location preference (10% weight)
    let locationScore = 70; // Default score
    const userLocation = resumeData.personalInfo?.location?.toLowerCase() || '';
    const jobLocation = job.location?.toLowerCase() || '';
    
    if (job.remote || jobLocation.includes('remote') || jobLocation.includes('work from home')) {
      locationScore = 100;
    } else if (userLocation && jobLocation.includes(userLocation.split(',')[0])) {
      locationScore = 95; // Same city
    } else if (userLocation && jobLocation.includes('india')) {
      locationScore = 80; // Same country
    }
    
    matchScore += locationScore * 0.1;
    factors.push(`Location: ${locationScore}% preference`);

    // Job type preference (5% weight)
    let jobTypeScore = 75;
    if (job.jobType === 'Internship' && userExperience < 1) {
      jobTypeScore = 100;
    } else if (job.jobType === 'Full-time' && userExperience >= 1) {
      jobTypeScore = 95;
    } else if (job.jobType === 'Full-time' && userExperience < 1) {
      jobTypeScore = 85; // Entry level full-time is still good for freshers
    }
    
    matchScore += jobTypeScore * 0.05;

    const finalScore = Math.round(Math.min(matchScore, 100));
    
    return {
      ...job,
      matchScore: finalScore,
      matchFactors: factors,
      skillMatches: {
        exact: exactMatches,
        partial: partialMatches,
        related: relatedMatches
      },
      recommendationReason: generateEnhancedRecommendationReason(job, exactMatches, partialMatches, userExperience)
    };
  })
  .filter(job => job.matchScore >= 40) // Only show jobs with at least 40% match
  .sort((a, b) => b.matchScore - a.matchScore);
}

// Calculate title relevance based on user skills and experience
function calculateTitleRelevance(jobTitle, userSkills, userExperience) {
  const title = jobTitle.toLowerCase();
  let relevance = 0;
  
  // Check if title contains user's skills
  const skillsInTitle = userSkills.filter(skill => title.includes(skill));
  relevance += (skillsInTitle.length / Math.max(userSkills.length, 1)) * 60;
  
  // Check experience level alignment
  if (userExperience < 1) {
    if (title.includes('intern') || title.includes('trainee') || title.includes('graduate') || title.includes('entry')) {
      relevance += 30;
    } else if (title.includes('senior') || title.includes('lead') || title.includes('manager')) {
      relevance -= 20;
    } else {
      relevance += 10; // Regular positions are okay for freshers
    }
  } else if (userExperience < 3) {
    if (title.includes('junior') || title.includes('associate') || (!title.includes('senior') && !title.includes('lead'))) {
      relevance += 30;
    } else if (title.includes('senior')) {
      relevance += 10;
    }
  } else {
    if (title.includes('senior') || title.includes('lead')) {
      relevance += 30;
    } else {
      relevance += 20;
    }
  }
  
  // Role-specific bonuses
  const roleKeywords = ['developer', 'engineer', 'programmer', 'analyst', 'designer'];
  if (roleKeywords.some(role => title.includes(role))) {
    relevance += 10;
  }
  
  return Math.min(relevance, 100);
}

// Get related skill matches (e.g., React relates to JavaScript)
function getRelatedSkillMatches(userSkills, jobSkills) {
  const skillRelations = {
    'javascript': ['react', 'node.js', 'vue.js', 'angular', 'typescript'],
    'react': ['javascript', 'jsx', 'redux', 'next.js'],
    'python': ['django', 'flask', 'pandas', 'numpy', 'tensorflow'],
    'java': ['spring', 'hibernate', 'maven', 'gradle'],
    'node.js': ['javascript', 'express', 'npm'],
    'html': ['css', 'javascript', 'bootstrap'],
    'css': ['html', 'sass', 'less', 'bootstrap'],
    'sql': ['mysql', 'postgresql', 'mongodb', 'database'],
    'aws': ['cloud', 'docker', 'kubernetes', 'devops'],
    'git': ['github', 'version control', 'gitlab']
  };
  
  const relatedMatches = [];
  
  userSkills.forEach(userSkill => {
    const relations = skillRelations[userSkill] || [];
    jobSkills.forEach(jobSkill => {
      if (relations.includes(jobSkill) && !relatedMatches.includes(jobSkill)) {
        relatedMatches.push(jobSkill);
      }
    });
  });
  
  return relatedMatches;
}

// Enhanced recommendation reason generation
function generateEnhancedRecommendationReason(job, exactMatches, partialMatches, userExperience) {
  const reasons = [];
  
  if (exactMatches.length > 0) {
    reasons.push(`Perfect match for your ${exactMatches.slice(0, 2).join(', ')} skills`);
  } else if (partialMatches.length > 0) {
    reasons.push(`Good match for your ${partialMatches.slice(0, 2).join(', ')} experience`);
  }
  
  if (job.jobType === 'Internship' && userExperience < 1) {
    reasons.push('Ideal for gaining industry experience');
  } else if (job.jobType === 'Full-time' && userExperience >= 1) {
    reasons.push('Matches your experience level');
  } else if (job.jobType === 'Full-time' && userExperience < 1) {
    reasons.push('Great entry-level opportunity');
  }
  
  if (job.remote) {
    reasons.push('Offers remote work flexibility');
  }
  
  if (job.company && job.company.length > 0) {
    reasons.push(`Join ${job.company}'s growing team`);
  }
  
  return reasons.length > 0 ? reasons.join('. ') + '.' : 'Good career opportunity based on your profile.';
}

// Helper functions
function parseExperienceRange(experienceStr) {
  const str = experienceStr.toLowerCase();
  if (str.includes('fresher')) {
    return { min: 0, max: 0.5 };
  }
  
  const matches = str.match(/(\d+)(?:-(\d+))?/);
  if (matches) {
    const min = parseInt(matches[1]);
    const max = matches[2] ? parseInt(matches[2]) : min + 1;
    return { min, max };
  }
  
  return { min: 0, max: 2 };
}



function generateRecommendationReason(job, skillMatches, userExperience) {
  const reasons = [];
  
  if (skillMatches.length > 0) {
    reasons.push(`Strong skill match in ${skillMatches.slice(0, 2).join(', ')}`);
  }
  
  if (job.type === 'Internship' && userExperience < 1) {
    reasons.push('Perfect for gaining industry experience');
  } else if (job.type === 'Full-time' && userExperience >= 1) {
    reasons.push('Good fit for your experience level');
  }
  
  if (job.remote) {
    reasons.push('Offers remote work flexibility');
  }
  
  return reasons.join('. ') + '.';
}