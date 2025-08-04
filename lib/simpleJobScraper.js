// Simple job scraper with mock data for testing
class SimpleJobScraper {
  constructor() {
    this.mockJobs = [
      {
        id: 'job_1',
        title: 'Software Developer',
        company: 'TechCorp Solutions',
        location: 'Bangalore, India',
        jobType: 'Full-time',
        experience: '1-3 years',
        salary: '₹4-8 LPA',
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        description: 'We are looking for a passionate Software Developer to join our dynamic team. You will work on cutting-edge web applications and contribute to innovative projects.',
        requirements: [
          'Bachelor\'s degree in Computer Science or related field',
          'Experience with modern JavaScript frameworks',
          'Knowledge of database systems',
          'Strong problem-solving skills'
        ],
        source: 'LinkedIn',
        url: 'https://linkedin.com/jobs/view/123456',
        postedDate: new Date().toISOString(),
        scrapedAt: new Date().toISOString()
      },
      {
        id: 'job_2',
        title: 'Frontend Developer',
        company: 'Digital Innovations',
        location: 'Mumbai, India',
        jobType: 'Full-time',
        experience: '2-4 years',
        salary: '₹5-10 LPA',
        skills: ['React', 'TypeScript', 'CSS', 'HTML'],
        description: 'Join our frontend team to build amazing user interfaces and experiences. Work with the latest technologies and frameworks.',
        requirements: [
          'Strong experience with React and TypeScript',
          'Proficiency in HTML, CSS, and JavaScript',
          'Experience with responsive design',
          'Knowledge of modern build tools'
        ],
        source: 'Internshala',
        url: 'https://internshala.com/job/frontend-developer',
        postedDate: new Date().toISOString(),
        scrapedAt: new Date().toISOString()
      },
      {
        id: 'job_3',
        title: 'Python Developer Intern',
        company: 'StartupHub',
        location: 'Hyderabad, India',
        jobType: 'Internship',
        experience: 'Fresher',
        salary: '₹15-25k/month',
        skills: ['Python', 'Django', 'PostgreSQL', 'Git'],
        description: 'Great opportunity for freshers to learn and grow in Python development. Work on real projects and gain valuable experience.',
        requirements: [
          'Currently pursuing or recently completed degree',
          'Basic knowledge of Python programming',
          'Eagerness to learn and adapt',
          'Good communication skills'
        ],
        source: 'Internshala',
        url: 'https://internshala.com/internship/python-developer',
        postedDate: new Date().toISOString(),
        scrapedAt: new Date().toISOString()
      },
      {
        id: 'job_4',
        title: 'Full Stack Developer',
        company: 'WebTech Solutions',
        location: 'Chennai, India',
        jobType: 'Full-time',
        experience: '2-5 years',
        salary: '₹6-12 LPA',
        skills: ['JavaScript', 'React', 'Node.js', 'Express', 'MongoDB', 'AWS'],
        description: 'Looking for a skilled Full Stack Developer to work on end-to-end web applications. Great opportunity to work with modern tech stack.',
        requirements: [
          'Experience with both frontend and backend development',
          'Proficiency in JavaScript and modern frameworks',
          'Knowledge of cloud platforms',
          'Experience with database design'
        ],
        source: 'LinkedIn',
        url: 'https://linkedin.com/jobs/view/789012',
        postedDate: new Date().toISOString(),
        scrapedAt: new Date().toISOString()
      },
      {
        id: 'job_5',
        title: 'Java Developer',
        company: 'Enterprise Systems',
        location: 'Pune, India',
        jobType: 'Full-time',
        experience: '1-4 years',
        salary: '₹5-9 LPA',
        skills: ['Java', 'Spring Boot', 'MySQL', 'REST API'],
        description: 'Join our Java development team to build robust enterprise applications. Work with experienced developers and learn best practices.',
        requirements: [
          'Strong knowledge of Java and OOP concepts',
          'Experience with Spring framework',
          'Understanding of database systems',
          'Knowledge of web services and APIs'
        ],
        source: 'LinkedIn',
        url: 'https://linkedin.com/jobs/view/345678',
        postedDate: new Date().toISOString(),
        scrapedAt: new Date().toISOString()
      }
    ];
  }

  async scrapeAllPortals(resumeData, branchCode) {
    try {
      console.log('Using simple job scraper with mock data...');
      
      // Simulate some processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter jobs based on resume skills if available
      let filteredJobs = [...this.mockJobs];
      
      if (resumeData && resumeData.skills && resumeData.skills.technical) {
        const userSkills = resumeData.skills.technical.map(skill => skill.toLowerCase());
        
        // Add relevance scoring based on skill matches
        filteredJobs = this.mockJobs.map(job => {
          const jobSkills = job.skills.map(skill => skill.toLowerCase());
          const matchingSkills = jobSkills.filter(skill => 
            userSkills.some(userSkill => 
              userSkill.includes(skill) || skill.includes(userSkill)
            )
          );
          
          return {
            ...job,
            relevanceScore: matchingSkills.length,
            matchingSkills: matchingSkills
          };
        }).sort((a, b) => b.relevanceScore - a.relevanceScore);
      }
      
      console.log(`Simple scraper returning ${filteredJobs.length} jobs`);
      return filteredJobs;
      
    } catch (error) {
      console.error('Simple job scraper error:', error);
      return this.mockJobs; // Return default jobs on error
    }
  }

  async closeBrowser() {
    // No browser to close in simple scraper
    console.log('Simple scraper cleanup completed');
  }
}

export default SimpleJobScraper;