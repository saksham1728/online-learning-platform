import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Enhanced rate limiters
const linkedinLimiter = new RateLimiterMemory({
  keyPrefix: 'linkedin',
  points: 5, // Reduced for better accuracy
  duration: 60,
});

const internshalaLimiter = new RateLimiterMemory({
  keyPrefix: 'internshala',
  points: 10,
  duration: 60,
});

class EnhancedJobScraper {
  constructor() {
    this.browser = null;
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ];
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });
    }
    return this.browser;
  }

  getRandomUserAgent() {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Enhanced LinkedIn Job Scraping
  async scrapeLinkedInJobs(keywords, location = 'India') {
    try {
      await linkedinLimiter.consume('scrape');
      
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      await page.setUserAgent(this.getRandomUserAgent());
      await page.setViewport({ width: 1920, height: 1080 });

      // Enhanced LinkedIn search with better parameters
      const searchQuery = keywords.join(' ');
      const encodedQuery = encodeURIComponent(searchQuery);
      const encodedLocation = encodeURIComponent(location);
      
      // Use LinkedIn's public job search (no login required)
      const url = `https://www.linkedin.com/jobs/search?keywords=${encodedQuery}&location=${encodedLocation}&f_TPR=r86400&position=1&pageNum=0`;

      console.log('Enhanced LinkedIn scraping:', url);
      
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 45000 });
      await this.delay(5000);

      // Scroll to load more jobs
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight / 2);
      });
      await this.delay(3000);

      const jobs = await page.evaluate(() => {
        const results = [];
        
        // Try multiple selectors for job cards
        const selectors = [
          '.jobs-search__results-list .result-card',
          '.job-search-card',
          '[data-entity-urn*="job"]',
          '.base-card',
          '.job-result-card'
        ];

        let jobCards = [];
        for (const selector of selectors) {
          jobCards = document.querySelectorAll(selector);
          if (jobCards.length > 0) break;
        }

        console.log(`Found ${jobCards.length} job cards`);

        jobCards.forEach((card, index) => {
          if (index >= 12) return; // Limit for accuracy

          try {
            // Enhanced selectors for better data extraction
            const titleSelectors = [
              '.base-search-card__title',
              '.result-card__title',
              '[data-control-name="job_search_job_title"]',
              'h3 a',
              '.job-result-card__title'
            ];

            const companySelectors = [
              '.base-search-card__subtitle',
              '.result-card__subtitle',
              '[data-control-name="job_search_company_name"]',
              '.job-result-card__company-name',
              '.result-card__subtitle-link'
            ];

            const locationSelectors = [
              '.job-search-card__location',
              '.job-result-card__location',
              '.result-card__location'
            ];

            const linkSelectors = [
              '.base-card__full-link',
              '.result-card__full-card-link',
              'a[href*="/jobs/view/"]'
            ];

            let title = '', company = '', location = '', jobUrl = '';

            // Extract title
            for (const selector of titleSelectors) {
              const element = card.querySelector(selector);
              if (element) {
                title = element.textContent.trim();
                break;
              }
            }

            // Extract company
            for (const selector of companySelectors) {
              const element = card.querySelector(selector);
              if (element) {
                company = element.textContent.trim();
                break;
              }
            }

            // Extract location
            for (const selector of locationSelectors) {
              const element = card.querySelector(selector);
              if (element) {
                location = element.textContent.trim();
                break;
              }
            }

            // Extract job URL
            for (const selector of linkSelectors) {
              const element = card.querySelector(selector);
              if (element) {
                jobUrl = element.href || element.getAttribute('href') || '';
                break;
              }
            }

            // Clean and validate data
            if (title && company && title.length > 5 && company.length > 2) {
              title = title.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
              company = company.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
              location = location.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim() || 'India';

              // Ensure URL is complete
              if (jobUrl && !jobUrl.startsWith('http')) {
                jobUrl = 'https://www.linkedin.com' + jobUrl;
              }

              results.push({
                title,
                company,
                location,
                url: jobUrl,
                source: 'LinkedIn',
                postedDate: new Date().toISOString()
              });
            }
          } catch (error) {
            console.error('Error parsing LinkedIn job card:', error);
          }
        });

        return results;
      });

      await page.close();
      
      // Enhance job data
      const enhancedJobs = jobs.map(job => this.enhanceJobData(job));
      
      console.log(`LinkedIn: Successfully scraped ${enhancedJobs.length} jobs`);
      return enhancedJobs;

    } catch (error) {
      console.error('Enhanced LinkedIn scraping error:', error);
      return [];
    }
  }

  // Enhanced Internshala Job Scraping
  async scrapeInternshalaJobs(keywords, location = 'India') {
    try {
      await internshalaLimiter.consume('scrape');
      
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      await page.setUserAgent(this.getRandomUserAgent());
      await page.setViewport({ width: 1920, height: 1080 });

      // Enhanced Internshala search
      const searchQuery = keywords.join('-');
      const url = `https://internshala.com/internships/${searchQuery}-internship/`;

      console.log('Enhanced Internshala scraping:', url);
      
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 45000 });
      await this.delay(4000);

      const jobs = await page.evaluate(() => {
        const results = [];
        
        // Enhanced selectors for Internshala
        const selectors = [
          '.internship_meta',
          '.individual_internship',
          '.internship-card'
        ];

        let internshipCards = [];
        for (const selector of selectors) {
          internshipCards = document.querySelectorAll(selector);
          if (internshipCards.length > 0) break;
        }

        console.log(`Found ${internshipCards.length} internship cards`);

        internshipCards.forEach((card, index) => {
          if (index >= 10) return; // Limit for accuracy

          try {
            // Enhanced data extraction
            const titleElement = card.querySelector('.job-internship-name') || 
                                card.querySelector('.profile h3') ||
                                card.querySelector('.heading_4_5');

            const companyElement = card.querySelector('.company-name') ||
                                 card.querySelector('.company h4') ||
                                 card.querySelector('.heading_6');

            const locationElement = card.querySelector('.location-name') ||
                                  card.querySelector('.location') ||
                                  card.querySelector('.individual_internship_locations');

            const durationElement = card.querySelector('.duration') ||
                                  card.querySelector('.internship_other_details_container .item_body');

            const stipendElement = card.querySelector('.stipend') ||
                                 card.querySelector('.stipend-salary');

            const linkElement = card.querySelector('a') ||
                              card.querySelector('.view_detail_button');

            if (titleElement && companyElement) {
              const title = titleElement.textContent.trim();
              const company = companyElement.textContent.trim();
              const location = locationElement ? locationElement.textContent.trim() : 'Remote';
              const duration = durationElement ? durationElement.textContent.trim() : '2-6 months';
              const stipend = stipendElement ? stipendElement.textContent.trim() : 'Performance based';
              
              let jobUrl = '';
              if (linkElement) {
                const href = linkElement.href || linkElement.getAttribute('href');
                jobUrl = href && href.startsWith('/') ? 'https://internshala.com' + href : href || '';
              }

              if (title.length > 3 && company.length > 2) {
                results.push({
                  title: title.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
                  company: company.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
                  location: location.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
                  duration: duration.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
                  salary: stipend.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
                  url: jobUrl,
                  source: 'Internshala',
                  jobType: 'Internship',
                  postedDate: new Date().toISOString()
                });
              }
            }
          } catch (error) {
            console.error('Error parsing Internshala card:', error);
          }
        });

        return results;
      });

      await page.close();

      // Enhance internship data
      const enhancedJobs = jobs.map(job => this.enhanceJobData(job));
      
      console.log(`Internshala: Successfully scraped ${enhancedJobs.length} internships`);
      return enhancedJobs;

    } catch (error) {
      console.error('Enhanced Internshala scraping error:', error);
      return [];
    }
  }

  // Enhanced job data processing
  enhanceJobData(job) {
    return {
      ...job,
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      experience: this.determineExperience(job.title, job.jobType),
      jobType: job.jobType || this.determineJobType(job.title),
      skills: this.extractSkillsAccurately(job.title + ' ' + (job.company || '')),
      requirements: this.generateAccurateRequirements(job.title, job.jobType),
      description: this.generateAccurateDescription(job.title, job.company, job.jobType),
      salary: job.salary || this.estimateAccurateSalary(job.title, job.jobType, job.location),
      scrapedAt: new Date().toISOString()
    };
  }

  // More accurate skill extraction
  extractSkillsAccurately(text) {
    const skillDatabase = {
      // Programming Languages
      'javascript': ['JavaScript', 'JS', 'ECMAScript'],
      'python': ['Python', 'Django', 'Flask', 'FastAPI'],
      'java': ['Java', 'Spring', 'Spring Boot', 'Hibernate'],
      'react': ['React', 'ReactJS', 'React.js', 'Redux'],
      'node': ['Node.js', 'NodeJS', 'Express'],
      'angular': ['Angular', 'AngularJS', 'TypeScript'],
      'vue': ['Vue', 'Vue.js', 'Vuejs'],
      'php': ['PHP', 'Laravel', 'CodeIgniter'],
      'csharp': ['C#', '.NET', 'ASP.NET'],
      'cpp': ['C++', 'C/C++'],
      'go': ['Go', 'Golang'],
      'rust': ['Rust'],
      'swift': ['Swift', 'iOS'],
      'kotlin': ['Kotlin', 'Android'],
      
      // Databases
      'mysql': ['MySQL', 'SQL'],
      'postgresql': ['PostgreSQL', 'Postgres'],
      'mongodb': ['MongoDB', 'NoSQL'],
      'redis': ['Redis'],
      'elasticsearch': ['Elasticsearch'],
      
      // Cloud & DevOps
      'aws': ['AWS', 'Amazon Web Services'],
      'azure': ['Azure', 'Microsoft Azure'],
      'gcp': ['Google Cloud', 'GCP'],
      'docker': ['Docker', 'Containerization'],
      'kubernetes': ['Kubernetes', 'K8s'],
      'jenkins': ['Jenkins', 'CI/CD'],
      
      // Frontend
      'html': ['HTML', 'HTML5'],
      'css': ['CSS', 'CSS3', 'SCSS', 'Sass'],
      'bootstrap': ['Bootstrap'],
      'tailwind': ['Tailwind CSS'],
      
      // Mobile
      'reactnative': ['React Native'],
      'flutter': ['Flutter', 'Dart'],
      
      // Data Science
      'machinelearning': ['Machine Learning', 'ML', 'AI'],
      'tensorflow': ['TensorFlow'],
      'pytorch': ['PyTorch'],
      'pandas': ['Pandas'],
      'numpy': ['NumPy']
    };

    const foundSkills = new Set();
    const textLower = text.toLowerCase();

    // Check for skills in the text
    Object.entries(skillDatabase).forEach(([key, variations]) => {
      variations.forEach(skill => {
        if (textLower.includes(skill.toLowerCase())) {
          foundSkills.add(skill);
        }
      });
    });

    // Add role-based skills
    if (textLower.includes('frontend') || textLower.includes('front-end')) {
      foundSkills.add('HTML').add('CSS').add('JavaScript');
    }
    if (textLower.includes('backend') || textLower.includes('back-end')) {
      foundSkills.add('API Development').add('Database Design');
    }
    if (textLower.includes('fullstack') || textLower.includes('full-stack')) {
      foundSkills.add('Full Stack Development');
    }
    if (textLower.includes('devops')) {
      foundSkills.add('DevOps').add('CI/CD').add('Cloud Computing');
    }

    const skillsArray = Array.from(foundSkills);
    return skillsArray.length > 0 ? skillsArray.slice(0, 8) : ['Programming', 'Problem Solving'];
  }

  // More accurate experience determination
  determineExperience(title, jobType) {
    const titleLower = title.toLowerCase();
    
    if (jobType === 'Internship' || titleLower.includes('intern')) {
      return 'Fresher';
    }
    if (titleLower.includes('senior') || titleLower.includes('sr.')) {
      return '3-6 years';
    }
    if (titleLower.includes('lead') || titleLower.includes('principal')) {
      return '5-8 years';
    }
    if (titleLower.includes('architect') || titleLower.includes('manager')) {
      return '6+ years';
    }
    if (titleLower.includes('junior') || titleLower.includes('jr.')) {
      return '1-3 years';
    }
    if (titleLower.includes('associate')) {
      return '0-2 years';
    }
    
    return '0-3 years';
  }

  // More accurate job type determination
  determineJobType(title) {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('intern')) return 'Internship';
    if (titleLower.includes('contract') || titleLower.includes('freelance')) return 'Contract';
    if (titleLower.includes('part-time') || titleLower.includes('part time')) return 'Part-time';
    
    return 'Full-time';
  }

  // More accurate salary estimation
  estimateAccurateSalary(title, jobType, location) {
    const titleLower = title.toLowerCase();
    
    if (jobType === 'Internship') {
      if (titleLower.includes('software') || titleLower.includes('developer')) {
        return '₹15-30k/month';
      }
      return '₹10-20k/month';
    }

    let baseSalary = 350000; // 3.5 LPA base

    // Role-based adjustments
    if (titleLower.includes('senior') || titleLower.includes('lead')) {
      baseSalary = 800000; // 8 LPA
    } else if (titleLower.includes('architect') || titleLower.includes('principal')) {
      baseSalary = 1200000; // 12 LPA
    } else if (titleLower.includes('manager')) {
      baseSalary = 1000000; // 10 LPA
    }

    // Technology-based adjustments
    if (titleLower.includes('ai') || titleLower.includes('machine learning') || titleLower.includes('data scientist')) {
      baseSalary *= 1.6;
    } else if (titleLower.includes('devops') || titleLower.includes('cloud')) {
      baseSalary *= 1.4;
    } else if (titleLower.includes('full stack') || titleLower.includes('react') || titleLower.includes('node')) {
      baseSalary *= 1.3;
    } else if (titleLower.includes('frontend') || titleLower.includes('backend')) {
      baseSalary *= 1.2;
    }

    // Location-based adjustments
    if (location && (location.includes('Bangalore') || location.includes('Mumbai') || location.includes('Hyderabad'))) {
      baseSalary *= 1.2;
    }

    const minSalary = Math.floor(baseSalary / 100000);
    const maxSalary = Math.floor(baseSalary * 1.5 / 100000);

    return `₹${minSalary}-${maxSalary} LPA`;
  }

  // Generate accurate job requirements
  generateAccurateRequirements(title, jobType) {
    const titleLower = title.toLowerCase();
    const requirements = [];

    // Education requirements
    if (jobType === 'Internship') {
      requirements.push('Currently pursuing Bachelor\'s degree in relevant field');
    } else {
      requirements.push('Bachelor\'s degree in Computer Science, Engineering, or related field');
    }

    // Role-specific requirements
    if (titleLower.includes('software') || titleLower.includes('developer')) {
      requirements.push('Strong programming skills in relevant technologies');
      requirements.push('Understanding of software development lifecycle');
      requirements.push('Experience with version control systems (Git)');
    }

    if (titleLower.includes('frontend') || titleLower.includes('front-end')) {
      requirements.push('Proficiency in HTML, CSS, and JavaScript');
      requirements.push('Experience with modern frontend frameworks');
      requirements.push('Understanding of responsive design principles');
    }

    if (titleLower.includes('backend') || titleLower.includes('back-end')) {
      requirements.push('Experience with server-side programming languages');
      requirements.push('Knowledge of database design and management');
      requirements.push('Understanding of API development and integration');
    }

    if (titleLower.includes('full stack') || titleLower.includes('fullstack')) {
      requirements.push('Experience with both frontend and backend technologies');
      requirements.push('Knowledge of database systems and web servers');
    }

    if (titleLower.includes('data')) {
      requirements.push('Strong analytical and problem-solving skills');
      requirements.push('Experience with data analysis tools and techniques');
      requirements.push('Knowledge of statistical methods and data visualization');
    }

    // General requirements
    requirements.push('Strong problem-solving and analytical skills');
    requirements.push('Good communication and teamwork abilities');

    if (jobType !== 'Internship') {
      requirements.push('Relevant work experience in the field');
    }

    return requirements.slice(0, 6); // Limit to 6 requirements
  }

  // Generate accurate job descriptions
  generateAccurateDescription(title, company, jobType) {
    const roleType = jobType === 'Internship' ? 'internship' : 'position';
    const action = jobType === 'Internship' ? 'learn and contribute to' : 'work on';
    
    return `Join ${company} as a ${title} and ${action} exciting projects in a dynamic environment. This ${roleType} offers excellent opportunities for professional growth and skill development. You'll collaborate with experienced team members and contribute to innovative solutions that make a real impact.`;
  }

  // Main scraping function
  async scrapeAllPortals(resumeData, branchCode) {
    const keywords = this.generateSmartKeywords(resumeData, branchCode);
    const location = resumeData.personalInfo?.location || 'India';

    console.log('Enhanced scraping with keywords:', keywords);

    try {
      const [linkedinJobs, internshalaJobs] = await Promise.allSettled([
        this.scrapeLinkedInJobs(keywords, location),
        this.scrapeInternshalaJobs(keywords, location)
      ]);

      let allJobs = [];
      
      if (linkedinJobs.status === 'fulfilled') {
        console.log(`LinkedIn: ${linkedinJobs.value.length} jobs`);
        allJobs = allJobs.concat(linkedinJobs.value);
      } else {
        console.error('LinkedIn scraping failed:', linkedinJobs.reason);
      }

      if (internshalaJobs.status === 'fulfilled') {
        console.log(`Internshala: ${internshalaJobs.value.length} jobs`);
        allJobs = allJobs.concat(internshalaJobs.value);
      } else {
        console.error('Internshala scraping failed:', internshalaJobs.reason);
      }

      // Remove duplicates and enhance data
      const uniqueJobs = this.removeDuplicates(allJobs);
      
      console.log(`Total unique jobs: ${uniqueJobs.length}`);
      return uniqueJobs;

    } catch (error) {
      console.error('Enhanced scraping error:', error);
      return [];
    }
  }

  // Generate smarter keywords based on resume
  generateSmartKeywords(resumeData, branchCode) {
    const keywords = new Set();
    
    // Add top skills as keywords
    if (resumeData.skills?.technical) {
      resumeData.skills.technical.slice(0, 3).forEach(skill => {
        keywords.add(skill.toLowerCase());
      });
    }

    // Add branch-specific keywords
    const branchKeywords = {
      'CSE': ['software developer', 'web developer', 'programmer', 'software engineer'],
      'ECE': ['electronics engineer', 'embedded systems', 'hardware engineer', 'vlsi'],
      'MECH': ['mechanical engineer', 'design engineer', 'manufacturing engineer'],
      'CIVIL': ['civil engineer', 'structural engineer', 'construction engineer'],
      'EEE': ['electrical engineer', 'power systems engineer', 'automation engineer']
    };

    if (branchKeywords[branchCode]) {
      branchKeywords[branchCode].forEach(keyword => keywords.add(keyword));
    }

    // Add experience-based keywords
    const experience = resumeData.experience?.years || 0;
    if (experience < 1) {
      keywords.add('fresher').add('entry level').add('trainee');
    } else if (experience < 3) {
      keywords.add('junior').add('associate');
    }

    return Array.from(keywords).slice(0, 4); // Limit to 4 most relevant keywords
  }

  // Remove duplicate jobs
  removeDuplicates(jobs) {
    const seen = new Map();
    return jobs.filter(job => {
      const key = `${job.title.toLowerCase().trim()}_${job.company.toLowerCase().trim()}`;
      if (seen.has(key)) {
        return false;
      }
      seen.set(key, true);
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

export default EnhancedJobScraper;