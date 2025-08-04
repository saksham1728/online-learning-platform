// Dynamic import to avoid build-time issues
let pdf;

class ResumeParser {
  constructor() {
    this.skillsDatabase = {
      // Programming Languages
      programming: [
        'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift',
        'Kotlin', 'Dart', 'TypeScript', 'Scala', 'R', 'MATLAB', 'C', 'Objective-C', 'Perl',
        'Shell', 'Bash', 'PowerShell', 'VB.NET', 'F#', 'Haskell', 'Clojure', 'Erlang'
      ],
      
      // Web Technologies
      web: [
        'HTML', 'HTML5', 'CSS', 'CSS3', 'SCSS', 'Sass', 'Less', 'Bootstrap', 'Tailwind CSS',
        'React', 'ReactJS', 'React.js', 'Angular', 'AngularJS', 'Vue', 'Vue.js', 'Svelte',
        'jQuery', 'Node.js', 'Express', 'Next.js', 'Nuxt.js', 'Gatsby', 'Webpack', 'Vite'
      ],
      
      // Backend & Frameworks
      backend: [
        'Spring', 'Spring Boot', 'Django', 'Flask', 'FastAPI', 'Laravel', 'CodeIgniter',
        'Ruby on Rails', 'ASP.NET', '.NET Core', 'Express.js', 'Koa.js', 'NestJS',
        'Gin', 'Echo', 'Fiber', 'Actix', 'Rocket'
      ],
      
      // Databases
      databases: [
        'MySQL', 'PostgreSQL', 'MongoDB', 'SQLite', 'Oracle', 'SQL Server', 'Redis',
        'Cassandra', 'DynamoDB', 'Firebase', 'Firestore', 'CouchDB', 'Neo4j',
        'InfluxDB', 'Elasticsearch', 'MariaDB'
      ],
      
      // Cloud & DevOps
      cloud: [
        'AWS', 'Azure', 'Google Cloud', 'GCP', 'Docker', 'Kubernetes', 'Jenkins',
        'GitLab CI', 'GitHub Actions', 'CircleCI', 'Travis CI', 'Terraform',
        'Ansible', 'Chef', 'Puppet', 'Vagrant', 'Helm'
      ],
      
      // Mobile Development
      mobile: [
        'React Native', 'Flutter', 'Xamarin', 'Ionic', 'Cordova', 'PhoneGap',
        'Android', 'iOS', 'Swift', 'Kotlin', 'Objective-C'
      ],
      
      // Data Science & AI
      datascience: [
        'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Keras',
        'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Plotly',
        'Jupyter', 'Apache Spark', 'Hadoop', 'Kafka', 'Airflow'
      ],
      
      // Tools & Others
      tools: [
        'Git', 'GitHub', 'GitLab', 'Bitbucket', 'SVN', 'Jira', 'Confluence',
        'Slack', 'Trello', 'Asana', 'Figma', 'Adobe XD', 'Sketch', 'InVision',
        'Postman', 'Insomnia', 'VS Code', 'IntelliJ', 'Eclipse', 'Vim', 'Emacs'
      ]
    };
    
    this.softSkillsDatabase = [
      'Communication', 'Leadership', 'Team Work', 'Teamwork', 'Problem Solving',
      'Critical Thinking', 'Time Management', 'Project Management', 'Analytical',
      'Creative', 'Adaptable', 'Flexible', 'Organized', 'Detail Oriented',
      'Self Motivated', 'Initiative', 'Collaborative', 'Interpersonal',
      'Presentation', 'Public Speaking', 'Negotiation', 'Customer Service',
      'Sales', 'Marketing', 'Research', 'Writing', 'Documentation',
      'Training', 'Mentoring', 'Coaching', 'Strategic Planning'
    ];
    
    this.educationKeywords = [
      'Bachelor', 'Master', 'PhD', 'Doctorate', 'Diploma', 'Certificate',
      'B.Tech', 'B.E', 'M.Tech', 'M.E', 'MBA', 'MCA', 'BCA', 'BSc', 'MSc',
      'Computer Science', 'Information Technology', 'Software Engineering',
      'Electronics', 'Electrical', 'Mechanical', 'Civil', 'Chemical',
      'Biotechnology', 'Aerospace', 'Automobile', 'Engineering'
    ];
    
    this.experienceKeywords = [
      'experience', 'worked', 'developed', 'built', 'created', 'designed',
      'implemented', 'managed', 'led', 'coordinated', 'supervised',
      'intern', 'internship', 'trainee', 'associate', 'junior', 'senior',
      'lead', 'manager', 'director', 'architect', 'consultant'
    ];
  }

  async parseResume(pdfBuffer, userEmail) {
    try {
      // Dynamically import pdf-parse to avoid build issues
      if (!pdf) {
        const pdfParseModule = await import('pdf-parse');
        pdf = pdfParseModule.default || pdfParseModule;
      }
      
      // Extract text from PDF
      const pdfData = await pdf(pdfBuffer);
      const text = pdfData.text;
      
      console.log('Extracted text length:', text.length);
      
      if (!text || text.length < 100) {
        throw new Error('Could not extract sufficient text from PDF');
      }

      return this.parseResumeFromText(text, userEmail);

    } catch (error) {
      console.error('Resume parsing error:', error);
      throw new Error(`Failed to parse resume: ${error.message}`);
    }
  }

  async parseResumeFromText(text, userEmail) {
    try {
      console.log('Parsing resume from text, length:', text.length);
      
      if (!text || text.length < 50) {
        throw new Error('Insufficient text content for analysis');
      }

      // Parse different sections
      const personalInfo = this.extractPersonalInfo(text, userEmail);
      const skills = this.extractSkills(text);
      const experience = this.extractExperience(text);
      const education = this.extractEducation(text);
      const projects = this.extractProjects(text);
      const certifications = this.extractCertifications(text);
      
      console.log('Extracted data:', {
        personalInfo: personalInfo.name,
        technicalSkills: skills.technical.length,
        softSkills: skills.soft.length,
        experienceYears: experience.years,
        projects: projects.length,
        certifications: certifications.length
      });
      
      // Calculate analysis score
      const analysisScore = this.calculateAnalysisScore({
        personalInfo, skills, experience, education, projects, certifications, text
      });
      
      // Generate insights
      const insights = this.generateInsights({
        skills, experience, education, projects, certifications, analysisScore
      });

      return {
        extractedText: text,
        personalInfo,
        skills,
        experience,
        education,
        projects,
        certifications,
        analysisScore,
        ...insights
      };

    } catch (error) {
      console.error('Text parsing error:', error);
      throw new Error(`Failed to parse resume text: ${error.message}`);
    }
  }

  extractPersonalInfo(text, userEmail) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Extract name (usually in first few lines)
    let name = '';
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      // Skip common headers and look for name-like patterns
      if (!line.toLowerCase().includes('resume') && 
          !line.toLowerCase().includes('curriculum') &&
          !line.toLowerCase().includes('cv') &&
          line.length > 5 && line.length < 50 &&
          /^[A-Za-z\s\.]+$/.test(line)) {
        name = line;
        break;
      }
    }
    
    // Extract email
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = text.match(emailRegex) || [];
    const email = emails[0] || userEmail;
    
    // Extract phone
    const phoneRegex = /(?:\+91[\s-]?)?(?:\d[\s-]?){9,10}\d/g;
    const phones = text.match(phoneRegex) || [];
    const phone = phones[0] ? phones[0].replace(/\s+/g, ' ').trim() : '';
    
    // Extract location
    const locationKeywords = [
      'Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata',
      'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Bhopal',
      'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra',
      'India', 'Karnataka', 'Maharashtra', 'Tamil Nadu', 'Telangana', 'Gujarat'
    ];
    
    let location = '';
    for (const keyword of locationKeywords) {
      if (text.toLowerCase().includes(keyword.toLowerCase())) {
        location = keyword;
        break;
      }
    }
    
    return {
      name: name || 'Not found',
      email: email,
      phone: phone || 'Not found',
      location: location || 'India'
    };
  }

  extractSkills(text) {
    const textLower = text.toLowerCase();
    const foundTechnicalSkills = new Set();
    const foundSoftSkills = new Set();
    
    // Extract technical skills
    Object.values(this.skillsDatabase).flat().forEach(skill => {
      const skillLower = skill.toLowerCase();
      if (textLower.includes(skillLower)) {
        foundTechnicalSkills.add(skill);
      }
    });
    
    // Extract soft skills
    this.softSkillsDatabase.forEach(skill => {
      const skillLower = skill.toLowerCase();
      if (textLower.includes(skillLower)) {
        foundSoftSkills.add(skill);
      }
    });
    
    // Additional pattern matching for skills
    const skillPatterns = [
      /(?:skills?|technologies?|tools?)\s*:?\s*([^\n]+)/gi,
      /(?:proficient|experienced)\s+(?:in|with)\s*:?\s*([^\n]+)/gi,
      /(?:knowledge|expertise)\s+(?:of|in)\s*:?\s*([^\n]+)/gi
    ];
    
    skillPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const skillText = match.split(':')[1] || match;
          const skills = skillText.split(/[,;|&]/).map(s => s.trim());
          skills.forEach(skill => {
            if (skill.length > 2 && skill.length < 30) {
              // Check if it's a known technical skill
              const isKnownSkill = Object.values(this.skillsDatabase).flat()
                .some(knownSkill => knownSkill.toLowerCase() === skill.toLowerCase());
              if (isKnownSkill) {
                foundTechnicalSkills.add(skill);
              }
            }
          });
        });
      }
    });
    
    return {
      technical: Array.from(foundTechnicalSkills).slice(0, 15), // Limit to top 15
      soft: Array.from(foundSoftSkills).slice(0, 10) // Limit to top 10
    };
  }

  extractExperience(text) {
    const textLower = text.toLowerCase();
    
    // Extract years of experience
    const experiencePatterns = [
      /(\d+)\+?\s*years?\s*(?:of\s*)?experience/gi,
      /experience\s*:?\s*(\d+)\+?\s*years?/gi,
      /(\d+)\s*years?\s*(?:of\s*)?(?:professional\s*)?experience/gi
    ];
    
    let years = 0;
    for (const pattern of experiencePatterns) {
      const match = text.match(pattern);
      if (match) {
        const yearMatch = match[0].match(/\d+/);
        if (yearMatch) {
          years = Math.max(years, parseInt(yearMatch[0]));
        }
      }
    }
    
    // If no explicit years found, estimate from job positions
    if (years === 0) {
      let estimatedYears = 0;
      if (textLower.includes('intern')) estimatedYears = 0;
      else if (textLower.includes('junior') || textLower.includes('associate')) estimatedYears = 1;
      else if (textLower.includes('senior')) estimatedYears = 3;
      else if (textLower.includes('lead') || textLower.includes('manager')) estimatedYears = 5;
      
      years = estimatedYears;
    }
    
    // Count internships
    const internshipMatches = text.match(/intern(?:ship)?/gi) || [];
    const internships = internshipMatches.length;
    
    // Count projects
    const projectMatches = text.match(/project/gi) || [];
    const projects = Math.min(projectMatches.length, 10); // Cap at 10
    
    // Extract companies
    const companyPatterns = [
      /(?:worked\s+at|employed\s+at|company)\s*:?\s*([^\n,]+)/gi,
      /([A-Z][a-zA-Z\s&]+(?:Ltd|Inc|Corp|Company|Technologies|Solutions|Systems))/g
    ];
    
    const companies = new Set();
    companyPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const company = match.replace(/(?:worked\s+at|employed\s+at|company)\s*:?\s*/gi, '').trim();
          if (company.length > 3 && company.length < 50) {
            companies.add(company);
          }
        });
      }
    });
    
    return {
      years: years,
      internships: internships,
      projects: projects,
      companies: Array.from(companies).slice(0, 5) // Limit to 5 companies
    };
  }

  extractEducation(text) {
    const lines = text.split('\n').map(line => line.trim());
    
    let degree = '';
    let university = '';
    let cgpa = 0;
    let year = 0;
    
    // Extract degree
    const degreePatterns = [
      /(?:Bachelor|Master|PhD|Doctorate|B\.?Tech|B\.?E|M\.?Tech|M\.?E|MBA|MCA|BCA|BSc|MSc)(?:\s+(?:of|in))?\s+([^\n,]+)/gi,
      /(Computer Science|Information Technology|Software Engineering|Electronics|Electrical|Mechanical|Civil)/gi
    ];
    
    for (const pattern of degreePatterns) {
      const match = text.match(pattern);
      if (match) {
        degree = match[0].trim();
        break;
      }
    }
    
    // Extract university
    const universityPatterns = [
      /(?:University|College|Institute)\s+of\s+([^\n,]+)/gi,
      /([A-Z][a-zA-Z\s]+(?:University|College|Institute))/g,
      /(VTU|Anna University|Mumbai University|Delhi University|IIT|NIT|BITS)/gi
    ];
    
    for (const pattern of universityPatterns) {
      const match = text.match(pattern);
      if (match) {
        university = match[0].trim();
        break;
      }
    }
    
    // Extract CGPA/GPA
    const cgpaPatterns = [
      /(?:CGPA|GPA|Grade)\s*:?\s*(\d+\.\d+)/gi,
      /(\d+\.\d+)\s*\/\s*10/gi,
      /(\d+\.\d+)\s*\/\s*4/gi
    ];
    
    for (const pattern of cgpaPatterns) {
      const match = text.match(pattern);
      if (match) {
        const gradeMatch = match[0].match(/\d+\.\d+/);
        if (gradeMatch) {
          cgpa = parseFloat(gradeMatch[0]);
          // Convert GPA to CGPA if needed
          if (cgpa <= 4) {
            cgpa = (cgpa / 4) * 10;
          }
          break;
        }
      }
    }
    
    // Extract graduation year
    const yearPatterns = [
      /(?:graduated|graduation|passing)\s+(?:in\s+|year\s+)?(20\d{2})/gi,
      /(20\d{2})\s*-\s*(20\d{2})/gi,
      /(?:batch|year)\s+(?:of\s+)?(20\d{2})/gi
    ];
    
    for (const pattern of yearPatterns) {
      const match = text.match(pattern);
      if (match) {
        const yearMatch = match[0].match(/20\d{2}/);
        if (yearMatch) {
          year = parseInt(yearMatch[0]);
          break;
        }
      }
    }
    
    return {
      degree: degree || 'Engineering',
      university: university || 'University',
      cgpa: cgpa || 7.5,
      year: year || new Date().getFullYear()
    };
  }

  extractProjects(text) {
    const projects = [];
    const projectPatterns = [
      /(?:project|projects)\s*:?([^\n]+(?:\n[^\n]*){0,3})/gi,
      /(?:built|developed|created)\s+([^\n]+)/gi
    ];
    
    projectPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach((match, index) => {
          if (projects.length < 5) { // Limit to 5 projects
            const projectText = match.replace(/(?:project|projects)\s*:?/gi, '').trim();
            if (projectText.length > 10) {
              projects.push({
                name: projectText.split('\n')[0].trim(),
                description: projectText,
                technologies: this.extractTechnologiesFromText(projectText)
              });
            }
          }
        });
      }
    });
    
    return projects;
  }

  extractCertifications(text) {
    const certifications = [];
    const certPatterns = [
      /(?:certification|certificate|certified)\s*:?([^\n]+)/gi,
      /(AWS|Google|Microsoft|Oracle|Cisco|Adobe)\s+(?:Certified|Certificate)\s+([^\n]+)/gi
    ];
    
    certPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          if (certifications.length < 5) { // Limit to 5 certifications
            const cert = match.replace(/(?:certification|certificate|certified)\s*:?/gi, '').trim();
            if (cert.length > 5) {
              certifications.push(cert);
            }
          }
        });
      }
    });
    
    return certifications;
  }

  extractTechnologiesFromText(text) {
    const technologies = new Set();
    const allSkills = Object.values(this.skillsDatabase).flat();
    
    allSkills.forEach(skill => {
      if (text.toLowerCase().includes(skill.toLowerCase())) {
        technologies.add(skill);
      }
    });
    
    return Array.from(technologies).slice(0, 5);
  }

  calculateAnalysisScore(data) {
    let score = 0;
    
    // Personal info completeness (10 points)
    if (data.personalInfo.name !== 'Not found') score += 3;
    if (data.personalInfo.email) score += 2;
    if (data.personalInfo.phone !== 'Not found') score += 2;
    if (data.personalInfo.location) score += 3;
    
    // Skills (30 points)
    score += Math.min(data.skills.technical.length * 2, 20);
    score += Math.min(data.skills.soft.length * 1, 10);
    
    // Experience (25 points)
    score += Math.min(data.experience.years * 3, 15);
    score += Math.min(data.experience.projects * 1, 5);
    score += Math.min(data.experience.companies.length * 1, 5);
    
    // Education (20 points)
    if (data.education.degree) score += 10;
    if (data.education.university) score += 5;
    if (data.education.cgpa > 6) score += 5;
    
    // Projects and certifications (15 points)
    score += Math.min(data.projects.length * 2, 10);
    score += Math.min(data.certifications.length * 1, 5);
    
    return Math.min(Math.round(score), 100);
  }

  generateInsights(data) {
    const strengths = [];
    const improvements = [];
    const recommendations = [];
    
    // Analyze strengths
    if (data.skills.technical.length >= 8) {
      strengths.push('Strong technical skill set with diverse technologies');
    }
    if (data.experience.years >= 2) {
      strengths.push('Good professional experience in the field');
    }
    if (data.projects.length >= 3) {
      strengths.push('Solid project portfolio demonstrating practical skills');
    }
    if (data.education.cgpa >= 8) {
      strengths.push('Excellent academic performance');
    }
    if (data.certifications.length >= 2) {
      strengths.push('Industry certifications show commitment to learning');
    }
    
    // Analyze improvements
    if (data.skills.technical.length < 5) {
      improvements.push('Expand technical skill set with trending technologies');
    }
    if (data.experience.years < 1) {
      improvements.push('Gain more practical experience through internships or projects');
    }
    if (data.projects.length < 2) {
      improvements.push('Build more projects to showcase practical skills');
    }
    if (data.certifications.length === 0) {
      improvements.push('Consider getting industry-relevant certifications');
    }
    if (data.skills.soft.length < 3) {
      improvements.push('Highlight more soft skills and interpersonal abilities');
    }
    
    // Generate recommendations
    const techSkills = data.skills.technical;
    if (techSkills.includes('JavaScript') || techSkills.includes('React')) {
      recommendations.push('Consider learning Node.js to become a full-stack developer');
    }
    if (techSkills.includes('Python')) {
      recommendations.push('Explore machine learning with TensorFlow or PyTorch');
    }
    if (techSkills.includes('Java')) {
      recommendations.push('Learn Spring Boot for enterprise application development');
    }
    if (!techSkills.some(skill => ['AWS', 'Azure', 'Google Cloud'].includes(skill))) {
      recommendations.push('Learn cloud technologies like AWS or Azure for better job prospects');
    }
    if (data.analysisScore < 70) {
      recommendations.push('Focus on building a stronger portfolio with detailed project descriptions');
    }
    
    return {
      strengths: strengths.length > 0 ? strengths : ['Good foundation in chosen field'],
      improvements: improvements.length > 0 ? improvements : ['Continue building on current strengths'],
      recommendations: recommendations.length > 0 ? recommendations : ['Keep learning and stay updated with industry trends']
    };
  }
}

export default ResumeParser;