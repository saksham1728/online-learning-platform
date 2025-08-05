# Design Document

## Overview

This design document outlines the technical approach for fixing critical platform issues and implementing enhancements. The solution focuses on API fixes, UI improvements, feature restructuring, and AI integration while maintaining system stability and user experience.

## Architecture

### System Components

1. **API Layer Fixes**
   - Next.js 13+ App Router API routes with proper async/await handling
   - Error handling middleware for graceful failures
   - JSON parsing utilities with fallback mechanisms

2. **Frontend Components**
   - Updated sidebar navigation component
   - Enhanced question papers display with universal filtering
   - New notes management interface
   - Improved code sharing viewer

3. **AI Integration Layer**
   - Gemini AI API integration for PDF processing
   - Question extraction service
   - Error handling and retry mechanisms

4. **Data Management**
   - Updated database queries for universal content access
   - Simplified view tracking removal
   - Enhanced notes storage system

## Components and Interfaces

### 1. API Route Fixes

#### Public Code API (`/api/public/code/[shareId]/route.jsx`)
```javascript
// Fixed async parameter handling
export async function GET(req, { params }) {
  const { shareId } = await params; // Properly await params
  const headersList = await headers(); // Properly await headers
  
  // Safe JSON parsing with fallback
  const tags = safeJsonParse(shareData.tags, []);
}

// Utility function for safe JSON parsing
function safeJsonParse(jsonString, fallback = null) {
  try {
    return JSON.parse(jsonString || 'null') || fallback;
  } catch {
    return fallback;
  }
}
```

#### Shared Codes Management API
- New endpoint: `/api/user/shared-codes`
- Proper error handling and data formatting
- Integration with existing database schema

### 2. Navigation Component Updates

#### AppSidebar Component
```javascript
const SideBarOptions = [
  // Remove Engineering Portal entry
  // Convert Mock Exams to Notes
  {
    title: 'Notes',
    icon: BookOpen,
    path: '/workspace/notes'
  }
  // Keep all other existing options
];
```

### 3. Question Papers Enhancement

#### Universal Display Logic
```javascript
// Remove branch-based filtering by default
const filterPapers = () => {
  let filtered = papers; // Start with all papers
  
  // Only apply user-selected filters, not automatic branch filtering
  if (selectedSubject !== 'all') {
    filtered = filtered.filter(paper => paper.subjectCode === selectedSubject);
  }
  // ... other filters
};
```

### 4. Notes Management System

#### Notes Interface
```javascript
interface Note {
  id: string;
  title: string;
  subject: string;
  branch: string;
  pdfUrl: string;
  uploadDate: string;
  downloadCount: number;
  extractedQuestions?: Question[];
}

interface Question {
  id: string;
  question: string;
  answer?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
}
```

#### Notes Component Structure
- Notes listing with download functionality
- PDF viewer integration
- AI question extraction interface
- Question display and management

### 5. AI Integration Service

#### Gemini AI Service
```javascript
class GeminiQuestionExtractor {
  async extractQuestions(pdfBuffer, options = {}) {
    // Convert PDF to text
    const text = await this.pdfToText(pdfBuffer);
    
    // Send to Gemini AI with structured prompt
    const prompt = this.buildExtractionPrompt(text, options);
    const response = await this.callGeminiAPI(prompt);
    
    // Parse and structure response
    return this.parseQuestions(response);
  }
  
  buildExtractionPrompt(text, options) {
    return `
      Extract practice questions from the following educational content.
      Format: JSON array with question, answer, difficulty, and topic fields.
      Content: ${text}
    `;
  }
}
```

## Data Models

### Updated Shared Code Model
```javascript
// Remove view tracking fields
const sharedCodeResponse = {
  shareId: string,
  title: string,
  description: string,
  code: string,
  language: string,
  category: string,
  tags: string[], // Safely parsed array
  allowComments: boolean,
  allowForking: boolean,
  createdAt: string
  // Removed: viewCount, lastViewedAt
};
```

### Notes Data Model
```javascript
const notesSchema = {
  id: 'varchar(255) PRIMARY KEY',
  title: 'varchar(500) NOT NULL',
  subject: 'varchar(100)',
  branch: 'varchar(50)',
  pdfUrl: 'text NOT NULL',
  uploadDate: 'timestamp DEFAULT CURRENT_TIMESTAMP',
  downloadCount: 'integer DEFAULT 0',
  extractedQuestions: 'json',
  createdBy: 'varchar(255)',
  isPublic: 'boolean DEFAULT true'
};
```

### Question Extraction Model
```javascript
const questionSchema = {
  id: 'varchar(255) PRIMARY KEY',
  noteId: 'varchar(255) REFERENCES notes(id)',
  question: 'text NOT NULL',
  answer: 'text',
  difficulty: 'enum("Easy", "Medium", "Hard")',
  topic: 'varchar(200)',
  extractedAt: 'timestamp DEFAULT CURRENT_TIMESTAMP'
};
```

## Error Handling

### API Error Handling Strategy
1. **Graceful Degradation**: APIs return partial data when possible
2. **Consistent Error Format**: Standardized error response structure
3. **Client-Side Resilience**: Frontend handles API failures gracefully
4. **Logging**: Comprehensive error logging for debugging

### Error Response Format
```javascript
{
  success: false,
  error: 'error_code',
  message: 'User-friendly error message',
  details?: 'Technical details for debugging'
}
```

## Testing Strategy

### Unit Testing
- API route testing with mocked dependencies
- Component testing with React Testing Library
- Utility function testing (JSON parsing, data formatting)

### Integration Testing
- End-to-end shared code flow testing
- Notes upload and question extraction workflow
- Navigation and filtering functionality

### AI Integration Testing
- Mock Gemini API responses for consistent testing
- PDF processing pipeline testing
- Question extraction accuracy validation

## Performance Considerations

### Optimizations
1. **Lazy Loading**: Load notes and questions on demand
2. **Caching**: Cache frequently accessed question papers and notes
3. **Pagination**: Implement pagination for large datasets
4. **PDF Processing**: Async processing with progress indicators

### Monitoring
- API response time monitoring
- Error rate tracking
- User interaction analytics (non-privacy invasive)

### 6. URL Configuration Service

#### Base URL Detection
```javascript
class URLService {
  static getBaseURL() {
    // Check for explicit environment variable first
    if (process.env.NEXT_PUBLIC_BASE_URL) {
      return process.env.NEXT_PUBLIC_BASE_URL;
    }
    
    // In production, use Vercel URL
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    
    // Fallback to localhost for development
    return process.env.NODE_ENV === 'production' 
      ? 'https://online-learning-platform-ashy.vercel.app'
      : 'http://localhost:3000';
  }
  
  static generateShareURL(shareId) {
    const baseURL = this.getBaseURL();
    return `${baseURL}/share/${shareId}`;
  }
}
```

#### Environment Configuration
```javascript
// .env.local (for development)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

// .env.production (for production)
NEXT_PUBLIC_BASE_URL=https://online-learning-platform-ashy.vercel.app
```

## Security Considerations

### Data Protection
- Secure PDF upload handling
- Input validation for all user inputs
- Rate limiting for AI API calls
- Proper authentication for sensitive operations

### AI Integration Security
- API key protection
- Request sanitization
- Response validation
- Usage quota management

## Migration Strategy

### Phase 1: Critical Fixes
1. Fix API async/await issues
2. Remove view tracking functionality
3. Update navigation sidebar

### Phase 2: Feature Updates
1. Implement universal question papers display
2. Convert mock exams to notes section
3. Add sample notes and basic functionality

### Phase 3: AI Integration
1. Implement Gemini AI service
2. Add question extraction functionality
3. Enhance notes management features

### Rollback Plan
- Database migration scripts with rollback capabilities
- Feature flags for gradual rollout
- Backup of current functionality before changes