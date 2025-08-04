import cron from 'node-cron';
import JobScraper from './jobScraper.js';
import { db } from '../config/db.jsx';
import { jobListingsTable, engineeringBranchesTable } from '../config/schema.js';
import { eq } from 'drizzle-orm';

class BackgroundJobScraper {
  constructor() {
    this.isRunning = false;
    this.scraper = new JobScraper();
  }

  // Start the background scraping service
  start() {
    console.log('Starting background job scraping service...');

    // Run every 6 hours
    cron.schedule('0 */6 * * *', async () => {
      if (this.isRunning) {
        console.log('Scraping already in progress, skipping...');
        return;
      }

      console.log('Starting scheduled job scraping...');
      await this.scrapeJobsForAllBranches();
    });

    // Run immediately on startup (optional)
    // setTimeout(() => this.scrapeJobsForAllBranches(), 5000);
  }

  async scrapeJobsForAllBranches() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    try {
      // Get all engineering branches
      const branches = await db.select().from(engineeringBranchesTable);
      
      for (const branch of branches) {
        console.log(`Scraping jobs for ${branch.branchName}...`);
        
        // Create a sample resume data for each branch
        const sampleResumeData = this.createSampleResumeForBranch(branch);
        
        try {
          // Scrape jobs for this branch
          const jobs = await this.scraper.scrapeAllPortals(sampleResumeData, branch.branchCode);
          
          if (jobs.length > 0) {
            await this.saveJobsToDB(jobs, branch.branchCode);
            console.log(`Saved ${jobs.length} jobs for ${branch.branchName}`);
          }
          
          // Wait between branches to avoid overwhelming the servers
          await this.delay(30000); // 30 seconds
          
        } catch (error) {
          console.error(`Error scraping jobs for ${branch.branchName}:`, error);
        }
      }
      
    } catch (error) {
      console.error('Error in background job scraping:', error);
    } finally {
      this.isRunning = false;
      await this.scraper.closeBrowser();
    }
  }

  createSampleResumeForBranch(branch) {
    const branchSkills = {
      'CSE': ['JavaScript', 'Python', 'Java', 'React', 'Node.js'],
      'ECE': ['C++', 'MATLAB', 'Embedded Systems', 'VLSI', 'Signal Processing'],
      'MECH': ['AutoCAD', 'SolidWorks', 'MATLAB', 'Thermodynamics', 'Manufacturing'],
      'CIVIL': ['AutoCAD', 'Structural Analysis', 'Construction Management', 'Surveying'],
      'EEE': ['MATLAB', 'Power Systems', 'Control Systems', 'Electrical Design']
    };

    return {
      personalInfo: {
        location: 'India'
      },
      skills: {
        technical: branchSkills[branch.branchCode] || ['Engineering', 'Problem Solving'],
        soft: ['Communication', 'Team Work', 'Leadership']
      },
      experience: {
        years: 0.5
      },
      education: {
        degree: branch.branchName,
        university: 'Engineering College'
      }
    };
  }

  async saveJobsToDB(jobs, branchCode) {
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

      // Insert jobs in batches
      const batchSize = 10;
      for (let i = 0; i < jobsToInsert.length; i += batchSize) {
        const batch = jobsToInsert.slice(i, i + batchSize);
        await db.insert(jobListingsTable).values(batch).onConflictDoNothing();
      }

    } catch (error) {
      console.error('Error saving jobs to DB:', error);
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  stop() {
    console.log('Stopping background job scraping service...');
    this.isRunning = false;
  }
}

// Export singleton instance
const backgroundScraper = new BackgroundJobScraper();
export default backgroundScraper;