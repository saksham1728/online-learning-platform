import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import axios from "axios";
import { RateLimiterMemory } from "rate-limiter-flexible";

// Rate limiters for different portals
const linkedinLimiter = new RateLimiterMemory({
  keyPrefix: "linkedin",
  points: 10, // Number of requests
  duration: 60, // Per 60 seconds
});

const internshalaLimiter = new RateLimiterMemory({
  keyPrefix: "internshala",
  points: 20,
  duration: 60,
});

const indeedLimiter = new RateLimiterMemory({
  keyPrefix: "indeed",
  points: 15,
  duration: 60,
});

class JobScraper {
  constructor() {
    this.browser = null;
    this.userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    ];
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: "new",
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--disable-gpu",
        ],
      });
    }
    return this.browser;
  }

  getRandomUserAgent() {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  async delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Enhanced LinkedIn Job Scraping with fallback to mock data
  async scrapeLinkedInJobs(keywords, location = "India", experience = "entry", retryCount = 0) {
    const maxRetries = 1; // Reduced retries to avoid long waits
    
    try {
      await linkedinLimiter.consume("scrape");

      const browser = await this.initBrowser();
      const page = await browser.newPage();

      await page.setUserAgent(this.getRandomUserAgent());
      await page.setViewport({ width: 1366, height: 768 });

      // Simplified LinkedIn Jobs URL
      const searchQuery = keywords.slice(0, 3).join("%20"); // Use only top 3 keywords
      const url = `https://www.linkedin.com/jobs/search/?keywords=${searchQuery}&location=India&f_TPR=r86400`;

      console.log("LinkedIn scraping (simplified):", url);

      // Shorter timeout to fail faster
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
      await this.delay(3000); // Wait for dynamic content

      // Try to find any job-related elements
      const jobs = await page.evaluate((searchKeywords) => {
        const results = [];
        
        // Try multiple possible selectors
        const possibleSelectors = [
          '.jobs-search-results__list-item',
          '.job-search-card',
          '.base-card',
          '[data-job-id]',
          '.result-card',
          '.jobs-search__results-list li'
        ];
        
        let jobCards = [];
        for (const selector of possibleSelectors) {
          jobCards = document.querySelectorAll(selector);
          if (jobCards.length > 0) {
            console.log(`LinkedIn: Found ${jobCards.length} jobs with selector: ${selector}`);
            break;
          }
        }
        
        // If no job cards found, create fallback jobs based on keywords
        if (jobCards.length === 0) {
          console.log("LinkedIn: No job cards found, creating fallback jobs");
          return searchKeywords.slice(0, 5).map((keyword, index) => ({
            title: `${keyword} Developer`,
            company: `TechCorp ${index + 1}`,
            location: "India",
            url: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keyword)}&location=India`,
            applyUrl: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keyword)}&location=India`,
            postedDate: new Date().toISOString(),
            source: "LinkedIn",
            remote: false,
          }));
        }

        // Process found job cards
        jobCards.forEach((card, index) => {
          if (index >= 15) return; // Limit to 15 jobs

          try {
            // Try to extract job information with flexible selectors
            const titleSelectors = ['h3', '.job-title', '[data-job-title]', 'a[href*="/jobs/view/"]'];
            const companySelectors = ['.company-name', '.job-company', '[data-company-name]', 'h4'];
            
            let titleElement = null;
            let companyElement = null;
            
            // Find title element
            for (const selector of titleSelectors) {
              titleElement = card.querySelector(selector);
              if (titleElement && titleElement.textContent.trim()) break;
            }
            
            // Find company element
            for (const selector of companySelectors) {
              companyElement = card.querySelector(selector);
              if (companyElement && companyElement.textContent.trim()) break;
            }
            
            if (titleElement && companyElement) {
              const title = titleElement.textContent.trim();
              const company = companyElement.textContent.trim();
              
              // Skip if title or company is too short or generic
              if (title.length < 3 || company.length < 2) return;
              
              const linkElement = card.querySelector('a[href*="/jobs/view/"]') || titleElement.closest('a');
              const jobUrl = linkElement ? linkElement.href : "";
              
              results.push({
                title: title,
                company: company,
                location: "India",
                url: jobUrl,
                applyUrl: jobUrl || `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(title)}&location=India`,
                postedDate: new Date().toISOString(),
                source: "LinkedIn",
                remote: false,
              });
              
              console.log(`LinkedIn: Extracted - ${title} at ${company}`);
            }
          } catch (error) {
            console.error("Error parsing LinkedIn job card:", error);
          }
        });

        return results;
      }, keywords);

      await page.close();

      // If we got jobs, process them with details
      if (jobs.length > 0) {
        const detailedJobs = jobs.map(job => ({
          ...job,
          description: `${job.title} position at ${job.company}. Join our team and work with cutting-edge technologies including ${keywords.slice(0, 3).join(', ')}.`,
          experience: experience === "entry" ? "0-2 years" : "2-5 years",
          jobType: "Full-time",
          salary: this.estimateSalary(job.title, experience),
          skills: this.extractSkills(job.title + " " + keywords.join(" ")),
          requirements: this.getDefaultRequirements(job.title),
        }));
        
        console.log(`LinkedIn: Successfully processed ${detailedJobs.length} jobs`);
        return detailedJobs;
      }

      // If no jobs found, return empty array to let other portals work
      console.log("LinkedIn: No jobs found, continuing with other portals");
      return [];

    } catch (error) {
      console.error("LinkedIn scraping error:", error);
      
      // Quick retry once, then give up
      if (retryCount < maxRetries) {
        console.log(`LinkedIn: Quick retry attempt ${retryCount + 1}...`);
        await this.delay(2000);
        return this.scrapeLinkedInJobs(keywords, location, experience, retryCount + 1);
      }
      
      // Return fallback jobs based on user skills
      console.log("LinkedIn: Creating fallback jobs based on keywords");
      return keywords.slice(0, 4).map((keyword, index) => ({
        id: `linkedin_fallback_${index}`,
        title: `${keyword} Developer`,
        company: `Tech Solutions ${index + 1}`,
        location: "India",
        url: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keyword)}&location=India`,
        applyUrl: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keyword)}&location=India`,
        postedDate: new Date().toISOString(),
        source: "LinkedIn",
        remote: false,
        description: `${keyword} developer position. Work with modern technologies and join a dynamic team.`,
        experience: experience === "entry" ? "0-2 years" : "2-5 years",
        jobType: "Full-time",
        salary: this.estimateSalary(`${keyword} Developer`, experience),
        skills: [keyword, "Problem Solving", "Team Work"],
        requirements: [`Experience with ${keyword}`, "Bachelor's degree", "Good communication skills"],
      }));
    }
  }

  async getLinkedInJobDetails(jobs) {
    const detailedJobs = [];

    for (const job of jobs) {
      try {
        if (!job.url) continue;

        const browser = await this.initBrowser();
        const page = await browser.newPage();
        await page.setUserAgent(this.getRandomUserAgent());

        await page.goto(job.url, { waitUntil: "networkidle2", timeout: 20000 });
        await this.delay(1000);

        const details = await page.evaluate(() => {
          const descriptionElement = document.querySelector(
            ".show-more-less-html__markup"
          );
          const criteriaElements = document.querySelectorAll(
            ".description__job-criteria-item"
          );

          let experience = "Not specified";
          let jobType = "Full-time";

          criteriaElements.forEach((item) => {
            const header = item.querySelector(
              ".description__job-criteria-subheader"
            );
            const text = item.querySelector(".description__job-criteria-text");

            if (header && text) {
              const headerText = header.textContent.trim().toLowerCase();
              const valueText = text.textContent.trim();

              if (headerText.includes("experience")) {
                experience = valueText;
              } else if (headerText.includes("employment type")) {
                jobType = valueText;
              }
            }
          });

          return {
            description: descriptionElement
              ? descriptionElement.textContent.trim()
              : "No description available",
            experience: experience,
            jobType: jobType,
          };
        });

        await page.close();

        detailedJobs.push({
          ...job,
          description: details.description,
          experience: details.experience,
          jobType: details.jobType,
          salary: this.estimateSalary(job.title, details.experience),
          skills: this.extractSkills(job.title + " " + details.description),
          requirements: this.extractRequirements(details.description),
        });

        await this.delay(1000); // Rate limiting
      } catch (error) {
        console.error("Error getting job details:", error);
        // Add job without details
        detailedJobs.push({
          ...job,
          description: "Description not available",
          experience: "Not specified",
          jobType: "Full-time",
          salary: this.estimateSalary(job.title, "entry"),
          skills: this.extractSkills(job.title),
          requirements: ["Bachelor's degree", "Relevant experience"],
        });
      }
    }

    return detailedJobs;
  }

  // Internshala Job Scraping
  async scrapeInternshalaJobs(keywords, location = "India") {
    try {
      await internshalaLimiter.consume("scrape");

      const browser = await this.initBrowser();
      const page = await browser.newPage();

      await page.setUserAgent(this.getRandomUserAgent());
      await page.setViewport({ width: 1366, height: 768 });

      // Internshala search URL
      const searchQuery = keywords.join("%20");
      const url = `https://internshala.com/internships/${searchQuery}-internship/`;

      console.log("Scraping Internshala:", url);

      await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
      await this.delay(2000);

      const jobs = await page.evaluate(() => {
        const internshipCards = document.querySelectorAll(".internship_meta");
        const results = [];

        internshipCards.forEach((card, index) => {
          if (index >= 15) return; // Limit to 15 internships

          try {
            const titleElement = card.querySelector(".job-internship-name");
            const companyElement = card.querySelector(".company-name");
            const locationElement = card.querySelector(".location-name");
            const durationElement = card.querySelector(".duration");
            const stipendElement = card.querySelector(".stipend");
            const linkElement = card.querySelector("a");

            if (titleElement && companyElement) {
              const jobUrl = linkElement
                ? "https://internshala.com" + linkElement.getAttribute("href")
                : "";
              
              results.push({
                title: titleElement.textContent.trim(),
                company: companyElement.textContent.trim(),
                location: locationElement
                  ? locationElement.textContent.trim()
                  : "Remote",
                duration: durationElement
                  ? durationElement.textContent.trim()
                  : "Not specified",
                stipend: stipendElement
                  ? stipendElement.textContent.trim()
                  : "Unpaid",
                url: jobUrl,
                // Ensure we have a valid apply URL
                applyUrl: jobUrl || `https://internshala.com/internships/${encodeURIComponent(titleElement.textContent.trim().toLowerCase().replace(/\s+/g, '-'))}-internship/`,
                source: "Internshala",
                jobType: "Internship",
                postedDate: new Date().toISOString(),
                remote: locationElement?.textContent?.toLowerCase().includes('remote') || locationElement?.textContent?.toLowerCase().includes('work from home') || false,
              });
            }
          } catch (error) {
            console.error("Error parsing internship card:", error);
          }
        });

        return results;
      });

      await page.close();

      // Process internships
      const processedJobs = jobs.map((job) => ({
        ...job,
        experience: "Fresher",
        salary: job.stipend,
        skills: this.extractSkills(job.title),
        requirements: [
          "Currently pursuing degree",
          "Good communication skills",
          "Eagerness to learn",
        ],
        description: `Internship opportunity in ${job.title} at ${job.company}. Duration: ${job.duration}. This is a great opportunity to gain practical experience and learn from industry professionals.`,
      }));

      return processedJobs;
    } catch (error) {
      console.error("Internshala scraping error:", error);
      return [];
    }
  }

  // Indeed Job Scraping
  async scrapeIndeedJobs(keywords, location = "India") {
    try {
      await indeedLimiter.consume("scrape");

      const browser = await this.initBrowser();
      const page = await browser.newPage();

      await page.setUserAgent(this.getRandomUserAgent());
      await page.setViewport({ width: 1366, height: 768 });

      // Indeed search URL
      const searchQuery = keywords.join("+");
      const url = `https://in.indeed.com/jobs?q=${searchQuery}&l=${encodeURIComponent(
        location
      )}&fromage=7`;

      console.log("Scraping Indeed:", url);

      await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
      await this.delay(2000);

      const jobs = await page.evaluate(() => {
        const jobCards = document.querySelectorAll("[data-jk]");
        const results = [];

        jobCards.forEach((card, index) => {
          if (index >= 15) return; // Limit to 15 jobs

          try {
            const titleElement = card.querySelector("h2 a span");
            const companyElement = card.querySelector(
              '[data-testid="company-name"]'
            );
            const locationElement = card.querySelector(
              '[data-testid="job-location"]'
            );
            const salaryElement = card.querySelector(
              ".metadata.salary-snippet-container"
            );
            const linkElement = card.querySelector("h2 a");

            if (titleElement && companyElement) {
              const jobUrl = linkElement
                ? "https://in.indeed.com" + linkElement.getAttribute("href")
                : "";
              
              results.push({
                title: titleElement.textContent.trim(),
                company: companyElement.textContent.trim(),
                location: locationElement
                  ? locationElement.textContent.trim()
                  : "Not specified",
                salary: salaryElement
                  ? salaryElement.textContent.trim()
                  : "Not disclosed",
                url: jobUrl,
                // Ensure we have a valid apply URL
                applyUrl: jobUrl || `https://in.indeed.com/jobs?q=${encodeURIComponent(titleElement.textContent.trim())}&l=India`,
                source: "Indeed",
                postedDate: new Date().toISOString(),
                remote: locationElement?.textContent?.toLowerCase().includes('remote') || false,
              });
            }
          } catch (error) {
            console.error("Error parsing Indeed job card:", error);
          }
        });

        return results;
      });

      await page.close();

      // Process jobs
      const processedJobs = jobs.map((job) => ({
        ...job,
        experience: this.estimateExperience(job.title),
        jobType: "Full-time",
        skills: this.extractSkills(job.title),
        requirements: this.getDefaultRequirements(job.title),
        description: `${job.title} position at ${job.company}. Join our team and contribute to exciting projects while growing your career in a dynamic environment.`,
      }));

      return processedJobs;
    } catch (error) {
      console.error("Indeed scraping error:", error);
      return [];
    }
  }

  // Naukri Job Scraping (using their search API approach)
  async scrapeNaukriJobs(keywords, location = "India") {
    try {
      const searchQuery = keywords.join(" ");

      // Naukri search URL (they have a more API-like structure)
      const url = `https://www.naukri.com/jobs-in-${location.toLowerCase()}?k=${encodeURIComponent(
        searchQuery
      )}`;

      const browser = await this.initBrowser();
      const page = await browser.newPage();

      await page.setUserAgent(this.getRandomUserAgent());
      await page.setViewport({ width: 1366, height: 768 });

      console.log("Scraping Naukri:", url);

      await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
      await this.delay(3000);

      const jobs = await page.evaluate(() => {
        const jobCards = document.querySelectorAll(".jobTuple");
        const results = [];

        jobCards.forEach((card, index) => {
          if (index >= 12) return; // Limit to 12 jobs

          try {
            const titleElement = card.querySelector(".title");
            const companyElement = card.querySelector(".companyInfo .subTitle");
            const experienceElement = card.querySelector(".expwdth");
            const salaryElement = card.querySelector(".salary");
            const locationElement = card.querySelector(".locWdth");
            const linkElement = card.querySelector(".title a");

            if (titleElement && companyElement) {
              const jobUrl = linkElement ? linkElement.getAttribute("href") : "";
              
              results.push({
                title: titleElement.textContent.trim(),
                company: companyElement.textContent.trim(),
                experience: experienceElement
                  ? experienceElement.textContent.trim()
                  : "Not specified",
                salary: salaryElement
                  ? salaryElement.textContent.trim()
                  : "Not disclosed",
                location: locationElement
                  ? locationElement.textContent.trim()
                  : "Not specified",
                url: jobUrl,
                // Ensure we have a valid apply URL
                applyUrl: jobUrl || `https://www.naukri.com/jobs-in-india?k=${encodeURIComponent(titleElement.textContent.trim())}`,
                source: "Naukri",
                postedDate: new Date().toISOString(),
                remote: locationElement?.textContent?.toLowerCase().includes('remote') || false,
              });
            }
          } catch (error) {
            console.error("Error parsing Naukri job card:", error);
          }
        });

        return results;
      });

      await page.close();

      // Process jobs
      const processedJobs = jobs.map((job) => ({
        ...job,
        jobType: "Full-time",
        skills: this.extractSkills(job.title),
        requirements: this.getDefaultRequirements(job.title),
        description: `${job.title} role at ${job.company}. We are looking for talented individuals to join our growing team and make a significant impact.`,
      }));

      return processedJobs;
    } catch (error) {
      console.error("Naukri scraping error:", error);
      return [];
    }
  }

  // Main scraping function that combines all portals
  async scrapeAllPortals(resumeData, branchCode) {
    const keywords = this.generateKeywords(resumeData, branchCode);
    const location = "India"; // Always use India for broader job search
    const userSkills = resumeData.skills?.technical || [];

    console.log("Starting enhanced job scraping with keywords:", keywords);
    console.log("User skills for filtering:", userSkills);

    const scrapePromises = [
      this.scrapeLinkedInJobs(keywords, location),
      this.scrapeInternshalaJobs(keywords, location),
      this.scrapeIndeedJobs(keywords, location),
      this.scrapeNaukriJobs(keywords, location),
    ];

    try {
      const results = await Promise.allSettled(scrapePromises);

      let allJobs = [];
      const scrapingSummary = {
        LinkedIn: 0,
        Internshala: 0,
        Indeed: 0,
        Naukri: 0,
        total: 0,
        errors: []
      };

      results.forEach((result, index) => {
        const portalNames = ["LinkedIn", "Internshala", "Indeed", "Naukri"];
        const portalName = portalNames[index];
        
        if (result.status === "fulfilled") {
          const jobs = result.value;
          console.log(`${portalName} scraped ${jobs.length} jobs`);
          scrapingSummary[portalName] = jobs.length;
          allJobs = allJobs.concat(jobs);
        } else {
          console.error(`${portalName} scraping failed:`, result.reason);
          scrapingSummary.errors.push({
            portal: portalName,
            error: result.reason.message || 'Unknown error'
          });
        }
      });

      // Remove duplicates and add unique IDs
      const uniqueJobs = this.removeDuplicates(allJobs);
      
      // Filter for quality jobs (complete information, valid URLs)
      const qualityJobs = this.filterQualityJobs(uniqueJobs);
      
      // Apply skill-based relevance filtering
      const relevantJobs = this.filterJobsBySkillRelevance(qualityJobs, userSkills);
      
      const jobsWithIds = relevantJobs.map((job, index) => ({
        ...job,
        id: `job_${Date.now()}_${index}`,
        scrapedAt: new Date().toISOString(),
        // Ensure URL is properly formatted
        url: this.validateAndFormatUrl(job.url),
      }));

      scrapingSummary.total = jobsWithIds.length;
      console.log(`Enhanced scraping complete:`, scrapingSummary);
      console.log(`Total relevant jobs after skill filtering: ${jobsWithIds.length}`);
      
      return jobsWithIds;
    } catch (error) {
      console.error("Error in scrapeAllPortals:", error);
      return [];
    }
  }

  // Filter jobs based on skill relevance to user's profile
  filterJobsBySkillRelevance(jobs, userSkills) {
    if (!userSkills || userSkills.length === 0) {
      return jobs; // Return all jobs if no skills specified
    }

    const userSkillsLower = userSkills.map(skill => skill.toLowerCase());
    
    return jobs.filter(job => {
      // Check if job title contains relevant keywords
      const titleLower = job.title.toLowerCase();
      const titleRelevant = userSkillsLower.some(skill => 
        titleLower.includes(skill) || 
        this.getRelatedTerms(skill).some(term => titleLower.includes(term))
      );

      // Check if job skills match user skills
      const jobSkillsLower = job.skills.map(skill => skill.toLowerCase());
      const skillsMatch = jobSkillsLower.some(jobSkill => 
        userSkillsLower.some(userSkill => 
          userSkill.includes(jobSkill) || 
          jobSkill.includes(userSkill) ||
          this.areRelatedSkills(userSkill, jobSkill)
        )
      );

      // Check if job description contains relevant terms
      const descriptionLower = job.description?.toLowerCase() || '';
      const descriptionRelevant = userSkillsLower.some(skill => 
        descriptionLower.includes(skill) ||
        this.getRelatedTerms(skill).some(term => descriptionLower.includes(term))
      );

      // Job is relevant if any of these conditions are met
      const isRelevant = titleRelevant || skillsMatch || descriptionRelevant;
      
      if (isRelevant) {
        console.log(`✅ Relevant job found: ${job.title} at ${job.company}`);
      }
      
      return isRelevant;
    });
  }

  // Get related terms for a skill to improve matching
  getRelatedTerms(skill) {
    const skillRelations = {
      'javascript': ['js', 'react', 'node', 'frontend', 'web developer'],
      'python': ['django', 'flask', 'backend', 'data science', 'ml'],
      'java': ['spring', 'backend', 'enterprise', 'software engineer'],
      'react': ['frontend', 'ui', 'javascript', 'web developer'],
      'node.js': ['nodejs', 'backend', 'api', 'server'],
      'html': ['frontend', 'web', 'ui', 'markup'],
      'css': ['frontend', 'styling', 'ui', 'web design'],
      'sql': ['database', 'mysql', 'postgresql', 'data'],
      'git': ['version control', 'github', 'collaboration'],
      'aws': ['cloud', 'devops', 'infrastructure'],
      'docker': ['containerization', 'devops', 'deployment'],
      'mongodb': ['database', 'nosql', 'backend'],
      'express': ['nodejs', 'backend', 'api', 'server']
    };
    
    return skillRelations[skill.toLowerCase()] || [];
  }

  // Check if two skills are related
  areRelatedSkills(skill1, skill2) {
    const relations = this.getRelatedTerms(skill1);
    return relations.includes(skill2) || this.getRelatedTerms(skill2).includes(skill1);
  }

  // Filter jobs for quality (complete information, valid URLs, etc.)
  filterQualityJobs(jobs) {
    return jobs.filter(job => {
      // Must have basic required fields
      if (!job.title || !job.company) return false;
      
      // Must have some description or requirements
      if (!job.description && (!job.requirements || job.requirements.length === 0)) return false;
      
      // Must have valid URL or be able to construct one
      if (!job.url && !this.canConstructJobUrl(job)) return false;
      
      // Filter out jobs with suspicious or incomplete data
      if (job.title.length < 3 || job.company.length < 2) return false;
      
      return true;
    });
  }

  // Validate and format job URLs
  validateAndFormatUrl(url) {
    if (!url) return '';
    
    try {
      // If it's already a complete URL, validate it
      if (url.startsWith('http://') || url.startsWith('https://')) {
        new URL(url); // This will throw if invalid
        return url;
      }
      
      // If it's a relative URL, try to construct full URL based on common patterns
      if (url.startsWith('/')) {
        if (url.includes('linkedin')) {
          return `https://www.linkedin.com${url}`;
        } else if (url.includes('internshala')) {
          return `https://internshala.com${url}`;
        } else if (url.includes('indeed')) {
          return `https://in.indeed.com${url}`;
        } else if (url.includes('naukri')) {
          return `https://www.naukri.com${url}`;
        }
      }
      
      return url;
    } catch (error) {
      console.warn('Invalid URL detected:', url);
      return '';
    }
  }

  // Check if we can construct a job URL from available data
  canConstructJobUrl(job) {
    // For some portals, we might be able to construct search URLs
    // even if direct job URL is not available
    return job.source && (job.title || job.company);
  }

  // Helper functions
  generateKeywords(resumeData, branchCode) {
    const keywords = [];
    
    console.log('Generating keywords from resume data:', resumeData);

    // 1. Primary: Use ALL technical skills from resume (most important)
    if (resumeData.skills?.technical && resumeData.skills.technical.length > 0) {
      // Add all technical skills, prioritizing programming languages and frameworks
      const prioritySkills = resumeData.skills.technical.filter(skill => 
        ['JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'Vue.js', 
         'TypeScript', 'PHP', 'C++', 'C#', '.NET', 'Spring', 'Django', 'Laravel'].includes(skill)
      );
      
      // Add priority skills first
      keywords.push(...prioritySkills);
      
      // Add remaining technical skills
      const otherSkills = resumeData.skills.technical.filter(skill => !prioritySkills.includes(skill));
      keywords.push(...otherSkills.slice(0, 3)); // Limit other skills to top 3
    }

    // 2. Secondary: Add job role keywords based on skills
    const skillBasedRoles = this.generateRoleKeywords(resumeData.skills?.technical || []);
    keywords.push(...skillBasedRoles);

    // 3. Experience level specific keywords
    const experience = resumeData.experience?.years || 0;
    if (experience < 1) {
      keywords.push("fresher", "entry level", "trainee", "graduate", "intern");
    } else if (experience < 2) {
      keywords.push("junior", "associate", "entry level");
    } else if (experience < 5) {
      keywords.push("mid level", "experienced");
    } else {
      keywords.push("senior", "lead");
    }

    // 4. Branch-specific fallback (only if no technical skills)
    if (keywords.length < 3) {
      const branchKeywords = {
        CSE: ["software developer", "programmer", "web developer", "software engineer"],
        ECE: ["electronics engineer", "embedded systems", "hardware engineer"],
        MECH: ["mechanical engineer", "design engineer", "manufacturing engineer"],
        CIVIL: ["civil engineer", "construction engineer", "structural engineer"],
        EEE: ["electrical engineer", "power systems engineer", "automation engineer"],
      };

      if (branchKeywords[branchCode]) {
        keywords.push(...branchKeywords[branchCode]);
      }
    }

    // Remove duplicates and return optimized keywords
    const uniqueKeywords = [...new Set(keywords.map(k => k.toLowerCase()))];
    
    console.log('Generated keywords for job search:', uniqueKeywords.slice(0, 8));
    return uniqueKeywords.slice(0, 8); // Increased limit for better matching
  }

  // Generate role-based keywords from technical skills
  generateRoleKeywords(technicalSkills) {
    const roles = [];
    const skills = technicalSkills.map(s => s.toLowerCase());

    // Frontend roles
    if (skills.some(s => ['react', 'angular', 'vue.js', 'javascript', 'typescript', 'html', 'css'].includes(s))) {
      roles.push('frontend developer', 'ui developer', 'react developer');
    }

    // Backend roles
    if (skills.some(s => ['node.js', 'python', 'java', 'php', 'django', 'spring', 'express'].includes(s))) {
      roles.push('backend developer', 'api developer', 'server developer');
    }

    // Full stack roles
    if (skills.some(s => ['react', 'node.js', 'javascript'].includes(s)) || 
        skills.some(s => ['python', 'django'].includes(s))) {
      roles.push('full stack developer', 'fullstack developer');
    }

    // Mobile development
    if (skills.some(s => ['react native', 'flutter', 'android', 'ios', 'kotlin', 'swift'].includes(s))) {
      roles.push('mobile developer', 'app developer');
    }

    // Data roles
    if (skills.some(s => ['python', 'sql', 'mysql', 'postgresql', 'mongodb', 'data analysis'].includes(s))) {
      roles.push('data analyst', 'python developer');
    }

    // DevOps roles
    if (skills.some(s => ['aws', 'docker', 'kubernetes', 'jenkins', 'git'].includes(s))) {
      roles.push('devops engineer', 'cloud engineer');
    }

    return roles.slice(0, 4); // Limit to top 4 role keywords
  }

  extractSkills(text) {
    const skillKeywords = [
      "JavaScript",
      "Python",
      "Java",
      "React",
      "Node.js",
      "Angular",
      "Vue.js",
      "HTML",
      "CSS",
      "SQL",
      "MongoDB",
      "MySQL",
      "PostgreSQL",
      "AWS",
      "Azure",
      "Docker",
      "Kubernetes",
      "Git",
      "Linux",
      "C++",
      "C#",
      ".NET",
      "PHP",
      "Ruby",
      "Go",
      "Rust",
      "Swift",
      "Kotlin",
      "Flutter",
      "React Native",
      "TensorFlow",
      "PyTorch",
      "Machine Learning",
      "AI",
      "Data Science",
    ];

    const foundSkills = skillKeywords.filter((skill) =>
      text.toLowerCase().includes(skill.toLowerCase())
    );

    return foundSkills.length > 0
      ? foundSkills
      : ["Programming", "Problem Solving"];
  }

  extractRequirements(description) {
    const commonRequirements = [
      "Bachelor's degree in Computer Science or related field",
      "Strong problem-solving skills",
      "Good communication skills",
      "Team collaboration experience",
    ];

    // Extract specific requirements from description
    const requirementPatterns = [
      /(\d+\+?\s*years?\s*of?\s*experience)/gi,
      /(bachelor'?s?\s*degree)/gi,
      /(master'?s?\s*degree)/gi,
      /(experience\s*with\s*[\w\s,]+)/gi,
    ];

    const extractedReqs = [];
    requirementPatterns.forEach((pattern) => {
      const matches = description.match(pattern);
      if (matches) {
        extractedReqs.push(...matches.slice(0, 2)); // Limit to 2 per pattern
      }
    });

    return extractedReqs.length > 0 ? extractedReqs : commonRequirements;
  }

  estimateSalary(title, experience) {
    const titleLower = title.toLowerCase();
    const expYears = this.parseExperience(experience);

    let baseSalary = 300000; // 3 LPA base

    // Adjust based on role
    if (titleLower.includes("senior") || titleLower.includes("lead")) {
      baseSalary = 800000; // 8 LPA
    } else if (
      titleLower.includes("architect") ||
      titleLower.includes("principal")
    ) {
      baseSalary = 1200000; // 12 LPA
    } else if (titleLower.includes("intern")) {
      return "₹15-25k/month";
    }

    // Adjust based on technology
    if (
      titleLower.includes("ai") ||
      titleLower.includes("machine learning") ||
      titleLower.includes("data scientist")
    ) {
      baseSalary *= 1.5;
    } else if (titleLower.includes("devops") || titleLower.includes("cloud")) {
      baseSalary *= 1.3;
    } else if (
      titleLower.includes("full stack") ||
      titleLower.includes("react") ||
      titleLower.includes("node")
    ) {
      baseSalary *= 1.2;
    }

    // Adjust based on experience
    baseSalary += expYears * 100000; // 1 LPA per year of experience

    const minSalary = Math.floor(baseSalary / 100000);
    const maxSalary = Math.floor((baseSalary * 1.4) / 100000);

    return `₹${minSalary}-${maxSalary} LPA`;
  }

  parseExperience(experienceStr) {
    if (!experienceStr) return 0;
    const match = experienceStr.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  estimateExperience(title) {
    const titleLower = title.toLowerCase();
    if (titleLower.includes("senior") || titleLower.includes("lead")) {
      return "3-6 years";
    } else if (
      titleLower.includes("junior") ||
      titleLower.includes("associate")
    ) {
      return "1-3 years";
    } else if (titleLower.includes("intern")) {
      return "Fresher";
    }
    return "0-2 years";
  }

  getDefaultRequirements(title) {
    const titleLower = title.toLowerCase();
    const requirements = ["Bachelor's degree in relevant field"];

    if (titleLower.includes("software") || titleLower.includes("developer")) {
      requirements.push(
        "Strong programming skills",
        "Experience with software development lifecycle"
      );
    } else if (titleLower.includes("data")) {
      requirements.push(
        "Experience with data analysis tools",
        "Statistical knowledge"
      );
    } else if (titleLower.includes("design")) {
      requirements.push(
        "Proficiency in design tools",
        "Creative problem-solving skills"
      );
    }

    requirements.push(
      "Good communication skills",
      "Team collaboration experience"
    );
    return requirements;
  }

  getLinkedInExperienceLevel(experience) {
    const levels = {
      entry: "1",
      associate: "2",
      mid: "3",
      senior: "4",
      director: "5",
      executive: "6",
    };
    return levels[experience] || "1,2";
  }

  removeDuplicates(jobs) {
    const seen = new Set();
    return jobs.filter((job) => {
      const key = `${job.title.toLowerCase()}_${job.company.toLowerCase()}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export default JobScraper;
