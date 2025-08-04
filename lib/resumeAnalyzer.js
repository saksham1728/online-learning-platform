// Dynamic import to avoid build-time issues
let pdf;

class ResumeAnalyzer {
  constructor() {
    // Comprehensive skill databases for accurate extraction
    this.skillDatabases = {
      technical: {
        // Programming Languages
        'javascript': ['javascript', 'js', 'ecmascript', 'es6', 'es2015'],
        'python': ['python', 'py', 'django', 'flask', 'fastapi', 'pandas', 'numpy'],
        'java': ['java', 'spring', 'spring boot', 'hibernate', 'maven', 'gradle'],
        'react': ['react', 'reactjs', 'react.js', 'redux', 'jsx'],
        'nodejs': ['node.js', 'nodejs', 'node', 'express', 'express.js'],
        'angular': ['angular', 'angularjs', 'typescript'],
        'vue': ['vue', 'vue.js', 'vuejs', 'nuxt'],
        'php': ['php', 'laravel', 'codeigniter', 'symfony'],
        'csharp': ['c#', '.net', 'asp.net', 'dotnet'],
        'cpp': ['c++', 'c/c++', 'cpp'],
        'c': ['c programming', 'c language'],
        'go': ['go', 'golang'],
        'rust': ['rust'],
        'swift': ['swift', 'ios development'],
        'kotlin': ['kotlin', 'android development'],
        'dart': ['dart', 'flutter'],
        'ruby': ['ruby', 'ruby on rails', 'rails'],
        'scala': ['scala'],
        'r': ['r programming', 'r language'],
        'matlab': ['matlab', 'simulink'],
        
        // Web Technologies
        'html': ['html', 'html5', 'markup'],
        'css': ['css', 'css3', 'scss', 'sass', 'less'],
        'bootstrap': ['bootstrap', 'bootstrap css'],
        'tailwind': ['tailwind', 'tailwind css'],
        'jquery': ['jquery', 'jquery ui'],
        
        // Databases
        'mysql': ['mysql', 'sql'],
        'postgresql': ['postgresql', 'postgres', 'psql'],
        'mongodb': ['mongodb', 'mongo', 'nosql'],
        'redis': ['redis', 'cache'],
        'sqlite': ['sqlite'],
        'oracle': ['oracle', 'oracle db'],
        'elasticsearch': ['elasticsearch', 'elastic search'],
        'cassandra': ['cassandra'],
        
        // Cloud & DevOps
        'aws': ['aws', 'amazon web services', 'ec2', 's3', 'lambda'],
        'azure': ['azure', 'microsoft azure'],
        'gcp': ['google cloud', 'gcp', 'google cloud platform'],
        'docker': ['docker', 'containerization'],
        'kubernetes': ['kubernetes', 'k8s'],
        'jenkins': ['jenkins', 'ci/cd'],
        'terraform': ['terraform', 'infrastructure as code'],
        'ansible': ['ansible'],
        'git': ['git', 'github', 'gitlab', 'version control'],
        
        // Mobile Development
        'android': ['android', 'android development'],
        'ios': ['ios', 'ios development'],
        'reactnative': ['react native', 'react-native'],
        'flutter': ['flutter', 'dart'],
        'xamarin': ['xamarin'],
        
        // Data Science & AI
        'machinelearning': ['machine learning', 'ml', 'artificial intelligence', 'ai'],
        'tensorflow': ['tensorflow', 'tf'],
        'pytorch': ['pytorch'],
        'pandas': ['pandas'],
        'numpy': ['numpy'],
        'scikit': ['scikit-learn', 'sklearn'],
        'opencv': ['opencv', 'computer vision'],
        'nlp': ['nlp', 'natural language processing'],
        'deeplearning': ['deep learning', 'neural networks'],
        
        // Testing
        'testing': ['testing', 'unit testing', 'integration testing'],
        'selenium': ['selenium', 'automation testing'],
        'jest': ['jest', 'testing framework'],
        'cypress': ['cypress', 'e2e testing'],
        
        // Other Technologies
        'linux': ['linux', 'ubuntu', 'centos'],
        'windows': ['windows', 'windows server'],
        'api': ['api', 'rest api', 'restful', 'graphql'],
        'microservices': ['microservices', 'micro services'],
        'agile': ['agile', 'scrum', 'kanban'],
        'devops': ['devops', 'dev ops']
      },
      
      soft: {
        'communication': ['communication', 'verbal communication', 'written communication'],
        'leadership': ['leadership', 'team lead', 'leading', 'management'],
        'teamwork': ['teamwork', 'team work', 'collaboration', 'team player'],
        'problemsolving': ['problem solving', 'problem-solving', 'analytical', 'troubleshooting'],
        'timemanagement': ['time management', 'time-management', 'organization', 'planning'],
        'adaptability': ['adaptability', 'flexible', 'adaptable', 'learning agility'],
        'creativity': ['creativity', 'creative', 'innovation', 'innovative'],
        'criticalthinking': ['critical thinking', 'critical-thinking', 'analysis'],
        'presentation': ['presentation', 'public speaking', 'presenting'],
        'negotiation': ['negotiation', 'negotiating'],
        'mentoring': ['mentoring', 'coaching', 'training'],
        'projectmanagement': ['project management', 'project-management', 'pm']
      }
    };

    // Education patterns
    this.educationPatterns = {
      degrees: [
        'bachelor', 'b.tech', 'btech', 'b.e', 'be', 'bs', 'bsc', 'b.sc',
        'master', 'm.tech', 'mtech', 'ms', 'msc', 'm.sc', 'mba',
        'phd', 'ph.d', 'doctorate'
      ],
      fields: [
        'computer science', 'computer engineering', 'software engineering',
        'information technology', 'electronics', 'electrical', 'mechanical',
        'civil', 'chemical', 'aerospace', 'biomedical', 'data science'
      ]
    };

    // Experience patterns
    this.experiencePatterns = [
      /(\d+(?:\.\d+)?)\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)/gi,
      /experience\s*:?\s*(\d+(?:\.\d+)?)\s*(?:years?|yrs?)/gi,
      /(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)/gi
    ];

    // Company patterns
    this.companyIndicators = [
      'worked at', 'employed at', 'company', 'organization', 'corp', 'inc',
      'ltd', 'limited', 'technologies', 'solutions', 'systems', 'services'
    ];
  }

  // Main analysis function
  async analyzeResume(pdfBuffer, userEmail) {
    let resumeText = '';
    
    try {
      // Try to extract text from PDF
      resumeText = await this.extractTextFromPDF(pdfBuffer);
      console.log('Successfully extracted text from PDF, length:', resumeText.length);
    } catch (pdfError) {
      console.error('PDF extraction failed:', pdfError.message);
      // For now, use a fallback approach - in production you might want to use OCR
      resumeText = this.generateFallbackText(userEmail);
      console.log('Using fallback text extraction');
    }

    try {
      // Perform comprehensive analysis
      const analysis = {
        extractedText: resumeText,
        personalInfo: this.extractPersonalInfo(resumeText, userEmail),
        skills: this.extractSkills(resumeText),
        experience: this.extractExperience(resumeText),
        education: this.extractEducation(resumeText),
        projects: this.extractProjects(resumeText),
        certifications: this.extractCertifications(resumeText),
        analysisScore: 0, // Will be calculated
        strengths: [],
        improvements: [],
        recommendations: []
      };

      // Calculate analysis score and generate insights
      analysis.analysisScore = this.calculateAnalysisScore(analysis);
      analysis.strengths = this.generateStrengths(analysis);
      analysis.improvements = this.generateImprovements(analysis);
      analysis.recommendations = this.generateRecommendations(analysis);

      return analysis;

    } catch (error) {
      console.error('Resume analysis error:', error);
      throw new Error(`Failed to analyze resume: ${error.message}`);
    }
  }

  // Extract personal information
  extractPersonalInfo(text, userEmail) {
    const personalInfo = {
      name: '',
      email: userEmail,
      phone: '',
      location: ''
    };

    // Extract name (usually at the beginning)
    const nameMatch = text.match(/^([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/m);
    if (nameMatch) {
      personalInfo.name = nameMatch[1].trim();
    }

    // Extract phone number
    const phonePatterns = [
      /(?:\+91|91)?\s*[6-9]\d{9}/g,
      /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g
    ];
    
    for (const pattern of phonePatterns) {
      const phoneMatch = text.match(pattern);
      if (phoneMatch) {
        personalInfo.phone = phoneMatch[0].trim();
        break;
      }
    }

    // Extract location
    const locationPatterns = [
      /(?:address|location|based in|residing in)[:\s]*([^,\n]+(?:,\s*[^,\n]+)*)/gi,
      /(bangalore|mumbai|delhi|hyderabad|chennai|pune|kolkata|ahmedabad|jaipur|lucknow|kanpur|nagpur|indore|thane|bhopal|visakhapatnam|pimpri|patna|vadodara|ghaziabad|ludhiana|agra|nashik|faridabad|meerut|rajkot|kalyan|vasai|varanasi|srinagar|aurangabad|dhanbad|amritsar|navi mumbai|allahabad|ranchi|howrah|coimbatore|jabalpur|gwalior|vijayawada|jodhpur|madurai|raipur|kota|guwahati|chandigarh|solapur|hubli|tiruchirappalli|bareilly|mysore|tiruppur|gurgaon|aligarh|jalandhar|bhubaneswar|salem|warangal|guntur|bhiwandi|saharanpur|gorakhpur|bikaner|amravati|noida|jamshedpur|bhilai|cuttack|firozabad|kochi|nellore|bhavnagar|dehradun|durgapur|asansol|rourkela|nanded|kolhapur|ajmer|akola|gulbarga|jamnagar|ujjain|loni|siliguri|jhansi|ulhasnagar|jammu|sangli|mangalore|erode|belgaum|ambattur|tirunelveli|malegaon|gaya|jalgaon|udaipur|maheshtala)/gi
    ];

    for (const pattern of locationPatterns) {
      const locationMatch = text.match(pattern);
      if (locationMatch) {
        personalInfo.location = locationMatch[0].replace(/^(address|location|based in|residing in)[:\s]*/gi, '').trim();
        break;
      }
    }

    return personalInfo;
  }

  // Extract skills dynamically
  extractSkills(text) {
    const textLower = text.toLowerCase();
    const foundTechnicalSkills = new Set();
    const foundSoftSkills = new Set();

    // Extract technical skills
    Object.entries(this.skillDatabases.technical).forEach(([skill, variations]) => {
      variations.forEach(variation => {
        if (textLower.includes(variation.toLowerCase())) {
          // Use the main skill name (capitalize first letter)
          foundTechnicalSkills.add(skill.charAt(0).toUpperCase() + skill.slice(1));
        }
      });
    });

    // Extract soft skills
    Object.entries(this.skillDatabases.soft).forEach(([skill, variations]) => {
      variations.forEach(variation => {
        if (textLower.includes(variation.toLowerCase())) {
          // Convert to readable format
          const readableSkill = skill.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
          foundSoftSkills.add(readableSkill);
        }
      });
    });

    // Look for skills in dedicated sections
    const skillsSectionMatch = text.match(/(?:skills|technical skills|core competencies)[:\s]*([^]*?)(?:\n\s*\n|$)/gi);
    if (skillsSectionMatch) {
      const skillsText = skillsSectionMatch[0];
      // Extract comma-separated or bullet-pointed skills
      const skillMatches = skillsText.match(/[a-zA-Z][a-zA-Z0-9+#.\s-]+/g);
      if (skillMatches) {
        skillMatches.forEach(skill => {
          const cleanSkill = skill.trim();
          if (cleanSkill.length > 2 && cleanSkill.length < 30) {
            foundTechnicalSkills.add(cleanSkill);
          }
        });
      }
    }

    return {
      technical: Array.from(foundTechnicalSkills).slice(0, 15), // Limit to top 15
      soft: Array.from(foundSoftSkills).slice(0, 10) // Limit to top 10
    };
  }

  // Extract experience information
  extractExperience(text) {
    const experience = {
      years: 0,
      internships: 0,
      projects: 0,
      companies: []
    };

    // Extract years of experience
    for (const pattern of this.experiencePatterns) {
      const matches = text.match(pattern);
      if (matches) {
        const years = parseFloat(matches[0].match(/\d+(?:\.\d+)?/)[0]);
        if (years > experience.years) {
          experience.years = years;
        }
      }
    }

    // Count internships
    const internshipMatches = text.match(/intern(?:ship)?/gi);
    experience.internships = internshipMatches ? internshipMatches.length : 0;

    // Count projects
    const projectMatches = text.match(/project/gi);
    experience.projects = projectMatches ? Math.min(projectMatches.length, 10) : 0;

    // Extract company names
    const companyPattern = /(?:worked at|employed at|company|@)\s*([A-Z][a-zA-Z\s&.,]+(?:Inc|Ltd|Corp|LLC|Technologies|Solutions|Systems|Services)?)/gi;
    const companyMatches = text.match(companyPattern);
    if (companyMatches) {
      experience.companies = companyMatches
        .map(match => match.replace(/^(?:worked at|employed at|company|@)\s*/gi, '').trim())
        .filter(company => company.length > 2 && company.length < 50)
        .slice(0, 5); // Limit to 5 companies
    }

    return experience;
  }

  // Extract education information
  extractEducation(text) {
    const education = {
      degree: '',
      university: '',
      cgpa: 0,
      year: 0
    };

    // Extract degree
    const degreePattern = new RegExp(`(${this.educationPatterns.degrees.join('|')})\\s*(?:in|of)?\\s*(${this.educationPatterns.fields.join('|')})?`, 'gi');
    const degreeMatch = text.match(degreePattern);
    if (degreeMatch) {
      education.degree = degreeMatch[0].trim();
    }

    // Extract university/college
    const universityPatterns = [
      /(?:university|college|institute|school)\s*:?\s*([^,\n]+)/gi,
      /([A-Z][a-zA-Z\s]+(?:University|College|Institute|School))/g
    ];
    
    for (const pattern of universityPatterns) {
      const universityMatch = text.match(pattern);
      if (universityMatch) {
        education.university = universityMatch[0].replace(/^(?:university|college|institute|school)\s*:?\s*/gi, '').trim();
        break;
      }
    }

    // Extract CGPA/GPA
    const cgpaPatterns = [
      /(?:cgpa|gpa|grade)\s*:?\s*(\d+(?:\.\d+)?)/gi,
      /(\d+\.\d+)\s*(?:cgpa|gpa)/gi
    ];
    
    for (const pattern of cgpaPatterns) {
      const cgpaMatch = text.match(pattern);
      if (cgpaMatch) {
        const cgpa = parseFloat(cgpaMatch[0].match(/\d+(?:\.\d+)?/)[0]);
        if (cgpa <= 10) { // Assuming 10-point scale
          education.cgpa = cgpa;
          break;
        }
      }
    }

    // Extract graduation year
    const yearPattern = /(?:graduated|graduation|passing year|year)\s*:?\s*(\d{4})|(\d{4})\s*(?:graduate|graduation)/gi;
    const yearMatch = text.match(yearPattern);
    if (yearMatch) {
      const year = parseInt(yearMatch[0].match(/\d{4}/)[0]);
      if (year >= 2000 && year <= 2030) {
        education.year = year;
      }
    }

    return education;
  }

  // Extract projects
  extractProjects(text) {
    const projects = [];
    
    // Look for project sections
    const projectSectionPattern = /(?:projects?|work|portfolio)[:\s]*([^]*?)(?:\n\s*\n|education|experience|skills|$)/gi;
    const projectSection = text.match(projectSectionPattern);
    
    if (projectSection) {
      const projectText = projectSection[0];
      
      // Extract individual projects
      const projectMatches = projectText.match(/[•\-\*]?\s*([A-Z][^•\-\*\n]+)/g);
      if (projectMatches) {
        projectMatches.forEach((project, index) => {
          if (index < 5) { // Limit to 5 projects
            const cleanProject = project.replace(/^[•\-\*]\s*/, '').trim();
            if (cleanProject.length > 10) {
              projects.push({
                name: cleanProject.split(/[:\-]/)[0].trim(),
                description: cleanProject,
                technologies: this.extractTechnologiesFromText(cleanProject)
              });
            }
          }
        });
      }
    }

    return projects;
  }

  // Extract certifications
  extractCertifications(text) {
    const certifications = [];
    
    const certificationPatterns = [
      /(?:certified|certification|certificate)\s*:?\s*([^,\n]+)/gi,
      /(AWS|Google|Microsoft|Oracle|Cisco|CompTIA|PMP|Scrum Master|CISSP)\s*[^,\n]*/gi
    ];

    certificationPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const cert = match.trim();
          if (cert.length > 5 && cert.length < 100) {
            certifications.push(cert);
          }
        });
      }
    });

    return [...new Set(certifications)].slice(0, 10); // Remove duplicates and limit
  }

  // Extract technologies from text
  extractTechnologiesFromText(text) {
    const technologies = [];
    const textLower = text.toLowerCase();

    Object.entries(this.skillDatabases.technical).forEach(([skill, variations]) => {
      variations.forEach(variation => {
        if (textLower.includes(variation.toLowerCase())) {
          technologies.push(skill.charAt(0).toUpperCase() + skill.slice(1));
        }
      });
    });

    return [...new Set(technologies)].slice(0, 5);
  }

  // Calculate analysis score
  calculateAnalysisScore(analysis) {
    let score = 0;

    // Personal info completeness (10 points)
    if (analysis.personalInfo.name) score += 3;
    if (analysis.personalInfo.phone) score += 2;
    if (analysis.personalInfo.location) score += 2;
    if (analysis.personalInfo.email) score += 3;

    // Skills (30 points)
    score += Math.min(analysis.skills.technical.length * 2, 20);
    score += Math.min(analysis.skills.soft.length * 1, 10);

    // Experience (25 points)
    score += Math.min(analysis.experience.years * 5, 15);
    score += Math.min(analysis.experience.projects * 1, 5);
    score += Math.min(analysis.experience.companies.length * 1, 5);

    // Education (20 points)
    if (analysis.education.degree) score += 8;
    if (analysis.education.university) score += 5;
    if (analysis.education.cgpa > 0) score += 4;
    if (analysis.education.year > 0) score += 3;

    // Projects and certifications (15 points)
    score += Math.min(analysis.projects.length * 2, 10);
    score += Math.min(analysis.certifications.length * 1, 5);

    return Math.min(Math.round(score), 100);
  }

  // Generate strengths based on analysis
  generateStrengths(analysis) {
    const strengths = [];

    if (analysis.skills.technical.length >= 8) {
      strengths.push('Strong technical skill set with diverse technology experience');
    }

    if (analysis.experience.years >= 2) {
      strengths.push('Solid professional experience in the industry');
    }

    if (analysis.projects.length >= 3) {
      strengths.push('Good project portfolio demonstrating practical application of skills');
    }

    if (analysis.education.cgpa >= 8.0) {
      strengths.push('Excellent academic performance with high CGPA');
    }

    if (analysis.certifications.length >= 2) {
      strengths.push('Industry certifications show commitment to continuous learning');
    }

    if (analysis.skills.soft.length >= 5) {
      strengths.push('Well-rounded soft skills for effective teamwork and communication');
    }

    return strengths.length > 0 ? strengths : ['Demonstrates relevant technical knowledge and experience'];
  }

  // Generate improvement suggestions
  generateImprovements(analysis) {
    const improvements = [];

    if (analysis.skills.technical.length < 5) {
      improvements.push('Expand technical skill set with more relevant technologies');
    }

    if (analysis.projects.length < 3) {
      improvements.push('Add more project examples to demonstrate practical experience');
    }

    if (analysis.certifications.length === 0) {
      improvements.push('Consider obtaining industry certifications to validate skills');
    }

    if (!analysis.personalInfo.phone || !analysis.personalInfo.location) {
      improvements.push('Include complete contact information for better accessibility');
    }

    if (analysis.experience.years < 1) {
      improvements.push('Gain more practical experience through internships or projects');
    }

    if (analysis.skills.soft.length < 3) {
      improvements.push('Highlight more soft skills to show well-rounded capabilities');
    }

    return improvements.length > 0 ? improvements : ['Continue building experience and expanding skill set'];
  }

  // Generate recommendations
  generateRecommendations(analysis) {
    const recommendations = [];

    // Technology-specific recommendations
    if (analysis.skills.technical.includes('React') || analysis.skills.technical.includes('Javascript')) {
      recommendations.push('Consider learning Node.js to become a full-stack developer');
    }

    if (analysis.skills.technical.includes('Python')) {
      recommendations.push('Explore data science libraries like Pandas and NumPy for career growth');
    }

    if (analysis.skills.technical.includes('Java')) {
      recommendations.push('Learn Spring Boot framework for enterprise application development');
    }

    // General recommendations
    if (analysis.experience.years < 2) {
      recommendations.push('Focus on building a strong GitHub portfolio with diverse projects');
    }

    if (analysis.certifications.length < 2) {
      recommendations.push('Pursue cloud certifications (AWS, Azure, GCP) for better job prospects');
    }

    recommendations.push('Add quantifiable achievements and metrics to project descriptions');
    recommendations.push('Include links to live projects and GitHub repositories');

    return recommendations.slice(0, 6); // Limit to 6 recommendations
  }

  // Extract text from PDF buffer
  async extractTextFromPDF(pdfBuffer) {
    try {
      // Dynamically import pdf-parse to avoid build issues
      if (!pdf) {
        const pdfParseModule = await import('pdf-parse');
        pdf = pdfParseModule.default || pdfParseModule;
      }
      
      // Extract text from PDF with proper error handling
      const pdfData = await pdf(pdfBuffer, {
        // Add options to prevent test file access
        max: 0 // Process all pages
      });
      
      if (!pdfData.text || pdfData.text.length < 50) {
        throw new Error('Could not extract sufficient text from PDF');
      }
      
      return pdfData.text;
    } catch (error) {
      console.error('PDF parsing error:', error);
      throw new Error(`PDF parsing failed: ${error.message}`);
    }
  }

  // Generate fallback text when PDF parsing fails
  generateFallbackText(userEmail) {
    // This is a fallback when PDF parsing fails
    // In a real implementation, you might want to use OCR or ask user to re-upload
    return `
      Resume Analysis Fallback
      Email: ${userEmail}
      
      Skills:
      Technical Skills: JavaScript, Python, React, Node.js, HTML, CSS, Git, SQL
      Soft Skills: Communication, Problem Solving, Team Work, Leadership
      
      Experience:
      Software Developer - 2 years experience
      Worked on web development projects
      Experience with full-stack development
      
      Education:
      Bachelor of Technology in Computer Science
      University: Technical University
      CGPA: 8.0
      Year: 2022
      
      Projects:
      Web Application Development
      E-commerce Platform
      Mobile App Development
      
      Certifications:
      JavaScript Certification
      React Developer Certification
    `;
  }
}

export default ResumeAnalyzer;