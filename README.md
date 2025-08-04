# 🎓 Online Learning Platform

A comprehensive educational platform built with Next.js, featuring AI-powered tools, career services, code sharing, and engineering-focused learning resources.

## 🌟 Features Overview

### 🏠 **Core Learning Platform**
- **Course Management**: Create, enroll, and track progress in custom courses
- **Video Integration**: YouTube-based video lessons with progress tracking
- **Chapter-wise Learning**: Structured learning with completion tracking
- **User Profiles**: Personalized learning dashboards and progress analytics

### 🤖 **AI-Powered Tools**
- **Quiz Generator**: AI-generated quizzes from any topic using Gemini AI
- **Practice Mode**: Adaptive practice sessions with difficulty adjustment
- **Question Extraction**: Extract questions from PDF notes using AI
- **Resume Analysis**: AI-powered resume scoring and improvement suggestions

### 💼 **Career Services**
- **Job Scraping**: Real-time job scraping from LinkedIn, Internshala, Indeed, and Naukri
- **Smart Matching**: AI-powered job matching based on skills and experience
- **Resume Upload**: PDF resume parsing and analysis
- **Skill Gap Analysis**: Identify missing skills for target jobs
- **Application Tracking**: Track job applications and success rates


### 💻 **Code Sharing Platform**
- **Monaco Editor**: Professional code editor with syntax highlighting
- **Multi-language Support**: JavaScript, Python, Java, C++, and more
- **Public/Private Sharing**: Share code snippets with custom URLs
- **Comment System**: Collaborative code review and discussions
- **Analytics**: Track views and engagement on shared code

### 📚 **Notes Management**
- **PDF Upload**: Upload and organize study notes
- **Question Extraction**: AI-powered question extraction from notes
- **Download Tracking**: Monitor note usage and popularity
- **Subject Organization**: Categorize notes by subject and branch

### 💕 **Knowledge Dating**
- **Swipe Interface**: Tinder-like interface for discovering learning topics
- **AI-Generated Cards**: Personalized learning recommendations
- **Deep Dive Content**: Detailed explanations for liked topics
- **Progress Tracking**: Track learning interests and preferences

### 🔧 **Additional Features**
- **Authentication**: Secure user authentication with Clerk
- **Database**: PostgreSQL with Drizzle ORM
- **File Uploads**: Resume and document upload functionality
- **Rate Limiting**: API rate limiting for scraping and AI calls
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (Neon recommended)
- Clerk account for authentication
- Google Gemini API key
- YouTube API key (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd online-learning-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in the required environment variables (see [Environment Variables](#environment-variables) section)

4. **Set up the database**
   ```bash
   npm run db:push
   npm run seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

### **Authentication (Clerk)**
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
CLERK_SECRET_KEY=sk_test_your_secret_key

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

**How to get Clerk keys:**
1. Go to [clerk.com](https://clerk.com)
2. Create a new application
3. Copy the publishable key and secret key from the dashboard
4. Configure sign-in/sign-up URLs in Clerk dashboard

### **Database (PostgreSQL)**
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
NEXT_PUBLIC_DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
```

**Recommended: Neon Database**
1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Replace the placeholder values

**Alternative: Local PostgreSQL**
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/learning_platform
```

### **AI Services**
```env
# Google Gemini AI (Required for AI features)
GEMINI_API_KEY=your_gemini_api_key

# AI Guru Lab API (Optional - for additional AI features)
AI_GURU_LAB_API=your_ai_guru_lab_api_key
```

**How to get Gemini API key:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your .env file

### **YouTube Integration (Optional)**
```env
# YouTube API (Optional - for video features)
YOUTUBE_API_KEY=your_youtube_api_key
```

**How to get YouTube API key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable YouTube Data API v3
3. Create credentials (API key)
4. Copy the key to your .env file

### **Job Scraping Configuration (Optional)**
```env
# Job Scraping Settings (Optional)
SCRAPING_RATE_LIMIT=10
SCRAPING_TIMEOUT=30000
ENABLE_JOB_SCRAPING=true
```

## 📁 Project Structure

```
online-learning-platform/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   ├── admin/                    # Admin dashboard
│   ├── api/                      # API routes
│   │   ├── courses/              # Course management APIs
│   │   ├── quiz/                 # Quiz and practice APIs
│   │   ├── job-recommendations/  # Career services APIs
│   │   ├── notes/                # Notes management APIs
│   │   └── code-sharing/         # Code sharing APIs
│   ├── course/                   # Course viewing pages
│   ├── share/                    # Public code sharing pages
│   └── workspace/                # Main application workspace
│       ├── ai-tools/             # AI-powered tools
│       ├── engineering-portal/   # Engineering-specific features
│       ├── career-services/      # Job search and career tools
│       ├── code-editor/          # Code editor and sharing
│       ├── knowledge-dating/     # Learning topic discovery
│       └── notes/                # Notes management
├── components/                   # Reusable UI components
│   ├── ui/                       # Base UI components (shadcn/ui)
│   ├── code-sharing/             # Code sharing components
│   └── notes/                    # Notes-related components
├── config/                       # Configuration files
│   ├── db.jsx                    # Database connection
│   └── schema.js                 # Database schema (Drizzle)
├── lib/                          # Utility libraries
│   ├── jobScraper.js             # Job scraping logic
│   ├── geminiQuestionExtractor.js # AI question extraction
│   ├── resumeAnalyzer.js         # Resume analysis
│   └── utils.js                  # General utilities
├── public/                       # Static assets
│   ├── sample-notes/             # Sample PDF notes
│   └── sample-papers/            # Sample question papers
├── scripts/                      # Database seeding scripts
└── uploads/                      # User uploaded files
```

## 🗄️ Database Schema

The platform uses PostgreSQL with the following main tables:

### **Core Tables**
- `users` - User accounts and profiles
- `courses` - Course information and content
- `enrollCourse` - Course enrollment tracking

### **AI & Quiz System**
- `quizzes` - AI-generated quizzes
- `quiz_attempts` - Quiz attempt tracking
- `practice_sessions` - Practice mode sessions
- `question_banks` - Question repositories

### **Career Services**
- `user_resumes` - Uploaded resume data
- `job_listings` - Scraped job postings
- `job_matches` - AI-powered job matching

### **Code Sharing**
- `shared_codes` - Shared code snippets
- `share_analytics` - Usage analytics
- `share_comments` - Code comments and reviews

### **Notes System**
- `notes` - PDF notes and documents
- `extracted_questions` - AI-extracted questions from notes

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Drizzle Studio (database GUI)
npm run seed         # Seed database with sample data

# Custom Scripts
npm run seed:branches    # Seed engineering branches
npm run seed:subjects    # Seed branch subjects
npm run seed:notes       # Seed sample notes
```

## 🎯 Key Features Deep Dive

### **AI-Powered Quiz Generation**
- Uses Google Gemini AI to generate contextual quizzes
- Supports multiple difficulty levels
- Automatic scoring and feedback
- Progress tracking and analytics

### **Smart Job Matching**
- Real-time scraping from major job portals
- AI-powered skill matching algorithm
- Resume analysis and gap identification
- Application tracking and success metrics

### **Code Sharing Platform**
- Monaco Editor with syntax highlighting
- Support for 20+ programming languages
- Public/private sharing with custom URLs
- Comment system and collaboration tools


## 🔒 Security Features

- **Authentication**: Secure user authentication with Clerk
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Comprehensive input validation and sanitization
- **File Upload Security**: Secure file upload with type validation
- **Database Security**: Parameterized queries and SQL injection prevention

## 🚀 Deployment

### **Vercel (Recommended)**
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### **Docker**
```bash
# Build Docker image
docker build -t learning-platform .

# Run container
docker run -p 3000:3000 --env-file .env learning-platform
```

### **Manual Deployment**
```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 API Documentation

### **Authentication**
All API routes require authentication via Clerk. Include the session token in requests.

### **Key Endpoints**
- `GET /api/courses` - Get user courses
- `POST /api/quiz/generate` - Generate AI quiz
- `POST /api/job-recommendations` - Get job recommendations
- `POST /api/notes/extract-questions` - Extract questions from PDF
- `GET /api/code-sharing/[shareId]` - Get shared code

## 🐛 Troubleshooting

### **Common Issues**

**Database Connection Issues**
```bash
# Check database URL format
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# Test connection
npm run db:studio
```

**Clerk Authentication Issues**
- Verify publishable key and secret key
- Check domain configuration in Clerk dashboard
- Ensure redirect URLs are correctly set

**AI Features Not Working**
- Verify Gemini API key is valid
- Check API quota and billing
- Ensure network connectivity to Google AI services

**Job Scraping Issues**
- Check rate limiting settings
- Verify network connectivity
- Review scraping logs for specific portal issues

## 📊 Performance Optimization

- **Database Indexing**: Optimized indexes for common queries
- **Caching**: Redis caching for frequently accessed data
- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic code splitting with Next.js
- **CDN**: Static asset delivery via CDN

## 📱 Mobile Support

The platform is fully responsive and optimized for:
- Mobile phones (iOS/Android)
- Tablets
- Desktop computers
- Various screen sizes and orientations

## 🔄 Updates and Maintenance

- Regular dependency updates
- Security patches
- Feature enhancements
- Performance optimizations
- Bug fixes and improvements

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Review troubleshooting guide
- Contact the development team

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Next.js** - React framework
- **Clerk** - Authentication service
- **Drizzle ORM** - Database ORM
- **Google Gemini AI** - AI services
- **Tailwind CSS** - Styling framework
- **shadcn/ui** - UI components
- **Monaco Editor** - Code editor
- **Puppeteer** - Web scraping

---

**Built with ❤️ for education and learning**