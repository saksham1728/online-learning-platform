# Requirements Document

## Introduction

This document outlines the requirements for fixing critical issues in the educational platform and implementing enhancements to improve user experience. The platform currently has several bugs in the code sharing functionality, navigation issues, and needs feature improvements including converting mock exams to notes section and implementing AI-powered question extraction.

## Requirements

### Requirement 1: Fix Code Sharing API Issues

**User Story:** As a user sharing code, I want the shared code links to work properly without server errors, so that others can view my shared code successfully.

#### Acceptance Criteria

1. WHEN a user accesses a shared code URL THEN the system SHALL properly await async parameters and headers
2. WHEN the API processes shared code requests THEN the system SHALL handle JSON parsing errors gracefully
3. WHEN headers are accessed in the API THEN the system SHALL await the headers() function properly
4. WHEN params are accessed in dynamic routes THEN the system SHALL await the params object
5. WHEN JSON parsing fails for tags THEN the system SHALL default to empty array without crashing

### Requirement 2: Fix Shared Codes Display

**User Story:** As a user, I want to see all my shared codes in the code management section, so that I can manage and track my shared code snippets.

#### Acceptance Criteria

1. WHEN a user visits the shared codes section THEN the system SHALL display all their shared codes without "failed to load" errors
2. WHEN the shared codes API is called THEN the system SHALL return properly formatted data
3. WHEN shared codes are displayed THEN the system SHALL show title, language, creation date
4. WHEN a user clicks on a shared code THEN the system SHALL navigate to the public view correctly

### Requirement 3: Remove Engineering Portal from Sidebar

**User Story:** As a user, I want a cleaner navigation experience without redundant sections, so that I can access features more efficiently.

#### Acceptance Criteria

1. WHEN the sidebar is displayed THEN the system SHALL NOT show "Engineering Portal" option


### Requirement 4: Fix Question Papers Filtering

**User Story:** As a student, I want to see all available question papers by default with the ability to filter by subject, so that I can access papers from all branches.

#### Acceptance Criteria

1. WHEN the question papers page loads THEN the system SHALL display all available question papers regardless of user's branch
2. WHEN a user applies subject filters THEN the system SHALL filter papers by the selected subject
3. WHEN no filters are applied THEN the system SHALL show papers from all branches (CSE, ECE, MECH, etc.)
4. WHEN the page loads THEN the system SHALL NOT automatically filter by user's branch

### Requirement 5: Convert Mock Exams to Notes Section

**User Story:** As a student, I want to access study notes instead of mock exams, so that I can download notes and extract questions from them using AI.

#### Acceptance Criteria

1. WHEN the sidebar is displayed THEN the system SHALL show "Notes" instead of "Mock Exams"
2. WHEN a user clicks on Notes THEN the system SHALL navigate to a notes management page
3. WHEN the notes page loads THEN the system SHALL display available PDF notes for download
4. WHEN sample notes are needed THEN the system SHALL include at least 3 sample PDF files
5. WHEN a user views a note THEN the system SHALL provide download and "Extract Questions" options

### Requirement 6: Implement AI Question Extraction

**User Story:** As a student, I want to extract questions from PDF notes using AI, so that I can generate practice questions from study materials.

#### Acceptance Criteria

1. WHEN a user clicks "Extract Questions" on a note THEN the system SHALL send the PDF to Gemini AI API
2. WHEN the AI processes the PDF THEN the system SHALL extract relevant questions and answers
3. WHEN questions are extracted THEN the system SHALL display them in a readable format
4. WHEN the extraction is complete THEN the system SHALL allow users to save or export the questions
5. WHEN the AI API call fails THEN the system SHALL show appropriate error messages

### Requirement 7: Remove Question Paper to Quiz Conversion

**User Story:** As a user, I want a streamlined experience without confusing conversion options, so that the interface is cleaner and more focused.

#### Acceptance Criteria

1. WHEN question papers are displayed THEN the system SHALL NOT show "Convert to Quiz" buttons
2. WHEN a user views a question paper THEN the system SHALL only show View and Download options
3. WHEN the question papers interface is rendered THEN the system SHALL maintain clean, focused functionality

### Requirement 8: Remove View Count Functionality

**User Story:** As a platform administrator, I want to remove unnecessary view tracking to simplify the codebase and improve performance.

#### Acceptance Criteria

1. WHEN shared code is accessed THEN the system SHALL NOT track or display view counts
2. WHEN the public code viewer loads THEN the system SHALL NOT show view statistics
3. WHEN the database is accessed THEN the system SHALL NOT update view count fields
4. WHEN the API processes requests THEN the system SHALL skip view tracking operations

### Requirement 9: Fix Comment System Integration

**User Story:** As a user viewing shared code, I want the comment system to work properly, so that I can engage with the code and provide feedback.

#### Acceptance Criteria

1. WHEN a shared code allows comments THEN the system SHALL display the comment system correctly
2. WHEN users try to comment THEN the system SHALL process comments without errors
3. WHEN the comment system loads THEN the system SHALL integrate seamlessly with the code viewer
4. WHEN comments are submitted THEN the system SHALL store and display them properly