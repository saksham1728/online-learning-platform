# Design Document

## Overview

The enhanced job scraping system will provide a streamlined, reliable, and intelligent job recommendation service that scrapes opportunities from multiple portals (LinkedIn, Internshala, Indeed, Naukri) and presents them with accurate matching scores and working apply links. The system will replace the current confusing multi-button interface with a single "Refresh Jobs" action while significantly improving scraping quality and user experience.

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend UI   │────│   API Gateway    │────│  Job Scraping   │
│                 │    │                  │    │    Service      │
│ - Single Button │    │ - Rate Limiting  │    │                 │
│ - Progress UI   │    │ - Caching        │    │ - Multi-Portal  │
│ - Job Display   │    │ - Error Handling │    │ - Parallel Exec │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                │                        │
                       ┌──────────────────┐    ┌─────────────────┐
                       │   Database       │    │  External APIs  │
                       │                  │    │                 │
                       │ - Job Cache      │    │ - LinkedIn      │
                       │ - User Prefs     │    │ - Internshala   │
                       │ - Analytics      │    │ - Indeed        │
                       └──────────────────┘    │ - Naukri        │
                                               └─────────────────┘
```

### Component Architecture

```
Enhanced Job Scraping Service
├── Portal Scrapers
│   ├── LinkedInScraper (Enhanced)
│   ├── InternshalaScaper (Enhanced)
│   ├── IndeedScraper (Enhanced)
│   └── NaukriScraper (Enhanced)
├── Job Processing Engine
│   ├── Deduplication Service
│   ├── Quality Filter
│   ├── Match Scoring Algorithm
│   └── Data Enrichment
├── Caching Layer
│   ├── Redis Cache
│   ├── Database Storage
│   └── Cache Invalidation
└── API Layer
    ├── Job Recommendations API
    ├── Scraping Status API
    └── Analytics API
```

## Components and Interfaces

### 1. Enhanced Job Scraping Service

**Purpose**: Orchestrates the entire job scraping process with improved reliability and performance.

**Key Features**:
- Parallel scraping from multiple portals
- Intelligent error handling and retry logic
- Real-time progress tracking
- Quality-based job filtering

**Interface**:
```javascript
class EnhancedJobScrapingService {
  async scrapeJobs(userProfile, options = {}) {
    // Returns: { jobs, summary, errors }
  }
  
  async getScrapingStatus(sessionId) {
    // Returns: { status, progress, currentPortal, jobsFound }
  }
  
  async getCachedJobs(userProfile, maxAge = 2) {
    // Returns: { jobs, cacheAge, isStale }
  }
}
```

### 2. Portal Scrapers (Enhanced)

**LinkedIn Scraper Enhancements**:
- Better anti-bot detection handling
- Improved job detail extraction
- Salary range parsing
- Company information enrichment

**Internshala Scraper Enhancements**:
- Both internship and full-time job extraction
- Stipend/salary normalization
- Application deadline tracking
- Skill requirement parsing

**Indeed Scraper Enhancements**:
- Enhanced job description parsing
- Company rating extraction
- Remote work detection
- Application method identification

**Naukri Scraper Enhancements**:
- Experience level parsing
- Salary range extraction
- Company size information
- Job freshness indicators

### 3. Job Processing Engine

**Deduplication Service**:
```javascript
class JobDeduplicationService {
  removeDuplicates(jobs) {
    // Uses fuzzy matching on title, company, and location
    // Returns unique jobs with source attribution
  }
}
```

**Quality Filter**:
```javascript
class JobQualityFilter {
  filterJobs(jobs, minQualityScore = 0.6) {
    // Filters based on:
    // - Complete job information
    // - Valid apply links
    // - Recent posting dates
    // - Legitimate companies
  }
}
```

**Enhanced Match Scoring Algorithm**:
```javascript
class MatchScoringAlgorithm {
  calculateMatchScore(job, userProfile) {
    // Weighted scoring:
    // - Skills match (40%)
    // - Experience level (25%)
    // - Location preference (15%)
    // - Salary alignment (10%)
    // - Company type (5%)
    // - Job freshness (5%)
  }
}
```

### 4. Simplified Frontend Interface

**Single Action Design**:
- Replace multiple buttons with one "Refresh Jobs" button
- Show cache age and last update time
- Provide manual refresh option with clear expectations

**Progress Tracking UI**:
```javascript
const ProgressStates = {
  IDLE: 'idle',
  SCRAPING: 'scraping',
  PROCESSING: 'processing',
  COMPLETE: 'complete',
  ERROR: 'error'
}

const ProgressInfo = {
  currentPortal: 'LinkedIn',
  jobsFound: 45,
  totalPortals: 4,
  completedPortals: 2,
  estimatedTimeRemaining: '30 seconds'
}
```

### 5. Enhanced Job Display

**Job Card Enhancements**:
- Clear match score explanation
- Working apply buttons with fallback options
- Skill alignment indicators
- Salary competitiveness markers
- Application deadline warnings

**Apply Link Management**:
```javascript
class ApplyLinkManager {
  getApplyUrl(job) {
    // Priority order:
    // 1. Direct application URL
    // 2. Company career page
    // 3. Original job posting
    // 4. Portal search results
  }
  
  validateApplyUrl(url) {
    // Checks URL accessibility and validity
  }
}
```

## Data Models

### Enhanced Job Model

```javascript
const JobSchema = {
  id: String,
  title: String,
  company: String,
  location: String,
  remote: Boolean,
  jobType: String, // 'Full-time', 'Internship', 'Contract'
  experience: {
    min: Number,
    max: Number,
    level: String // 'Entry', 'Mid', 'Senior'
  },
  salary: {
    min: Number,
    max: Number,
    currency: String,
    period: String, // 'annual', 'monthly'
    disclosed: Boolean
  },
  skills: {
    required: [String],
    preferred: [String],
    matched: [String] // User's matching skills
  },
  description: String,
  requirements: [String],
  benefits: [String],
  company: {
    name: String,
    size: String,
    industry: String,
    rating: Number
  },
  application: {
    url: String,
    method: String, // 'direct', 'portal', 'email'
    deadline: Date,
    easyApply: Boolean
  },
  source: {
    portal: String,
    originalUrl: String,
    scrapedAt: Date
  },
  matching: {
    score: Number,
    factors: [String],
    explanation: String
  },
  quality: {
    score: Number,
    completeness: Number,
    freshness: Number
  }
}
```

### Scraping Session Model

```javascript
const ScrapingSessionSchema = {
  sessionId: String,
  userId: String,
  status: String,
  startedAt: Date,
  completedAt: Date,
  progress: {
    currentPortal: String,
    completedPortals: [String],
    totalPortals: Number,
    jobsFound: Number,
    errors: [Object]
  },
  results: {
    totalJobs: Number,
    uniqueJobs: Number,
    qualityJobs: Number,
    portalBreakdown: Object
  }
}
```

## Error Handling

### Graceful Degradation Strategy

1. **Portal Failures**: Continue with available portals
2. **Rate Limiting**: Implement exponential backoff
3. **Network Issues**: Retry with different user agents
4. **Parsing Errors**: Log and continue with partial data
5. **Complete Failure**: Fall back to cached data

### Error Recovery Mechanisms

```javascript
class ErrorRecoveryManager {
  async handlePortalError(portal, error) {
    // Implement portal-specific recovery strategies
  }
  
  async handleRateLimit(portal, retryAfter) {
    // Implement intelligent backoff
  }
  
  async handleNetworkError(portal, attempt) {
    // Retry with different configurations
  }
}
```

## Testing Strategy

### Unit Testing
- Individual portal scrapers
- Job processing algorithms
- Match scoring logic
- Deduplication service

### Integration Testing
- End-to-end scraping workflow
- Database operations
- API endpoints
- Error handling scenarios

### Performance Testing
- Concurrent scraping performance
- Large dataset processing
- Memory usage optimization
- Response time benchmarks

### User Acceptance Testing
- Single button workflow
- Progress indicator accuracy
- Apply link functionality
- Match score relevance

## Security Considerations

### Anti-Bot Measures
- Rotating user agents
- Request timing randomization
- Proxy rotation (if needed)
- Respectful rate limiting

### Data Privacy
- No storage of personal information from job portals
- Secure handling of user profile data
- Compliance with portal terms of service
- Regular data cleanup

### API Security
- Rate limiting on scraping endpoints
- Authentication for user-specific data
- Input validation and sanitization
- Error message sanitization

## Performance Optimization

### Caching Strategy
- Redis for session data
- Database for job listings
- CDN for static assets
- Browser caching for UI components

### Parallel Processing
- Concurrent portal scraping
- Asynchronous job processing
- Background cache warming
- Queue-based job processing

### Resource Management
- Connection pooling
- Memory usage monitoring
- CPU usage optimization
- Disk space management

## Monitoring and Analytics

### System Metrics
- Scraping success rates per portal
- Average response times
- Error rates and types
- Cache hit ratios

### User Metrics
- Job view rates
- Application click-through rates
- Match score accuracy
- User satisfaction scores

### Business Metrics
- Job discovery effectiveness
- Portal performance comparison
- Skill demand trends
- Salary market analysis

## Deployment Strategy

### Phased Rollout
1. **Phase 1**: Backend service deployment
2. **Phase 2**: Frontend interface updates
3. **Phase 3**: Enhanced scraping logic
4. **Phase 4**: Analytics and monitoring

### Feature Flags
- Enable/disable specific portals
- Toggle enhanced matching algorithm
- Control cache behavior
- A/B test UI improvements

### Rollback Plan
- Database migration rollback
- API version fallback
- Frontend component reversion
- Configuration rollback procedures