import { NextResponse } from "next/server";
import { db } from "../../../config/db";
import { notesTable } from "../../../config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, desc } from "drizzle-orm";
import { 
  createErrorResponse, 
  createSuccessResponse, 
  validateRequired, 
  validateLength,
  sanitizeInput,
  withErrorHandler 
} from "../../../lib/errorHandler";

export const GET = withErrorHandler(async (req) => {
  const user = await currentUser();
  if (!user) {
    return createErrorResponse('Unauthorized', 401);
  }

  const { searchParams } = new URL(req.url);
  const subject = sanitizeInput(searchParams.get('subject'));
  const branch = sanitizeInput(searchParams.get('branch'));

  let query = db.select().from(notesTable).where(eq(notesTable.isPublic, true));
  
  // Apply filters if provided
  if (subject) {
    query = query.where(eq(notesTable.subject, subject));
  }
  if (branch) {
    query = query.where(eq(notesTable.branch, branch));
  }

  const notes = await query.orderBy(desc(notesTable.uploadDate));

  return createSuccessResponse({
    notes: notes,
    total: notes.length
  });
});

export const POST = withErrorHandler(async (req) => {
  const user = await currentUser();
  if (!user) {
    return createErrorResponse('Unauthorized', 401);
  }

  const body = await req.json();
  const {
    noteId,
    title,
    subject,
    subjectCode,
    branch,
    pdfUrl,
    pages,
    fileSize
  } = body;

  // Validate required fields
  validateRequired(noteId, 'Note ID');
  validateRequired(title, 'Title');
  validateRequired(pdfUrl, 'PDF URL');
  
  // Validate field lengths
  validateLength(title, 1, 500, 'Title');
  validateLength(subject, 0, 100, 'Subject');
  validateLength(subjectCode, 0, 20, 'Subject Code');
  validateLength(branch, 0, 50, 'Branch');

  // Sanitize inputs
  const sanitizedData = {
    noteId: sanitizeInput(noteId),
    title: sanitizeInput(title),
    subject: sanitizeInput(subject) || '',
    subjectCode: sanitizeInput(subjectCode) || '',
    branch: sanitizeInput(branch) || '',
    pdfUrl: sanitizeInput(pdfUrl),
    pages: parseInt(pages) || 0,
    fileSize: sanitizeInput(fileSize) || '',
    createdBy: user.emailAddresses[0]?.emailAddress,
    uploadDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const result = await db.insert(notesTable).values(sanitizedData).returning();

  return createSuccessResponse({
    note: result[0]
  }, 'Note created successfully');
});