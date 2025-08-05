# Implementation Plan

- [x] 1. Fix Critical API Issues

  - Fix async/await issues in public code sharing API route
  - Implement safe JSON parsing utility function
  - Remove view tracking functionality from shared code APIs
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 8.1, 8.2, 8.3, 8.4_

- [x] 2. Update Navigation and Remove Engineering Portal

  - Remove Engineering Portal option from AppSidebar component
  - Update sidebar navigation to maintain clean structure
  - Ensure all existing features remain accessible through direct paths
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 3. Fix Question Papers Universal Display

  - Remove automatic branch-based filtering from question papers page
  - Implement universal display showing all papers by default
  - Update filtering logic to only apply user-selected filters
  - Ensure papers from all branches (CSE, ECE, MECH) are visible
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 4. Convert Mock Exams to Notes Section

  - Update sidebar to show "Notes" instead of "Mock Exams"
  - Create new notes page component at `/workspace/notes`
  - Implement notes listing interface with download functionality
  - Create sample PDF notes for testing (at least 3 files)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 5. Implement Notes Database Schema

  - Create notes table schema in database configuration
  - Add notes API routes for CRUD operations
  - Implement notes data model and validation
  - Create database migration for notes table
  - _Requirements: 5.3, 5.4_

- [x] 6. Create Notes Management Interface

  - Build notes listing component with PDF preview
  - Implement download functionality for PDF notes
  - Add "Extract Questions" button to each note
  - Create responsive grid layout for notes display
  - _Requirements: 5.3, 5.4, 5.5_

- [x] 7. Implement AI Question Extraction Service

  - Create Gemini AI integration service class
  - Implement PDF to text conversion functionality
  - Build structured prompt for question extraction
  - Add error handling and retry mechanisms for AI calls
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 8. Create Question Extraction API Endpoint

  - Build API route for processing PDF question extraction
  - Integrate with Gemini AI service
  - Implement proper error handling and response formatting
  - Add rate limiting for AI API calls
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 9. Build Question Display Interface

  - Create component for displaying extracted questions
  - Implement question formatting and categorization
  - Add save/export functionality for extracted questions
  - Create loading states and progress indicators
  - _Requirements: 6.3, 6.4_

- [x] 10. Fix Shared Codes Display Issues

  - Create or fix shared codes management API endpoint
  - Update shared codes listing component
  - Implement proper error handling for failed loads
  - Ensure proper data formatting and display
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 11. Remove Question Paper Quiz Conversion

  - Remove "Convert to Quiz" buttons from question papers interface
  - Clean up quiz conversion related code
  - Update question papers component to show only View and Download options
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 12. Fix Comment System Integration

  - Debug and fix comment system integration with public code viewer
  - Ensure comment system displays correctly when enabled
  - Fix comment submission and display functionality
  - Test comment system with shared code viewer
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 13. Create Sample Notes and Test Data

  - Generate or source 3-5 sample PDF notes for different subjects
  - Upload sample notes to public directory
  - Create seed script for notes database entries
  - Test download functionality with sample files
  - _Requirements: 5.4, 5.5_

- [ ] 14. Implement Error Handling and Validation

  - Add comprehensive error handling to all new API routes
  - Implement input validation for file uploads and AI requests
  - Create consistent error response format across APIs
  - Add client-side error handling and user feedback
  - _Requirements: 6.5, 8.4_

- [x] 15. Update Public Code Viewer Component

  - Remove view count display from public code viewer
  - Fix error handling in loadCodeData function
  - Clean up unused imports and code
  - Test shared code viewing functionality end-to-end
  - _Requirements: 8.1, 8.2, 2.1, 2.4_

- [x] 16. Fix Shared Code URL Generation
  - Create URLService utility class for base URL detection
  - Update environment configuration to include NEXT_PUBLIC_BASE_URL
  - Modify code sharing components to use production URLs
  - Implement automatic domain detection for production vs development
  - Test URL generation in both local and production environments
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 17. Test and Validate All Changes
  - Test shared code creation and viewing workflow
  - Validate question papers display shows all branches
  - Test notes download and question extraction functionality
  - Verify navigation changes and removed features
  - Test URL generation with correct production domain
  - Perform end-to-end testing of all modified features
  - _Requirements: All requirements validation_
