import { NextResponse } from "next/server";

// Standard error response format
export function createErrorResponse(error, status = 500, details = null) {
  const response = {
    success: false,
    error: typeof error === "string" ? error : error.message || "Unknown error",
    message: getErrorMessage(error, status),
    timestamp: new Date().toISOString(),
  };

  if (details && process.env.NODE_ENV === "development") {
    response.details = details;
  }

  return NextResponse.json(response, { status });
}

// Get user-friendly error messages
function getErrorMessage(error, status) {
  switch (status) {
    case 400:
      return "Invalid request. Please check your input and try again.";
    case 401:
      return "Authentication required. Please log in to continue.";
    case 403:
      return "Access denied. You do not have permission to perform this action.";
    case 404:
      return "The requested resource was not found.";
    case 409:
      return "Conflict. The resource already exists or is in use.";
    case 429:
      return "Too many requests. Please wait before trying again.";
    case 500:
      return "Internal server error. Please try again later.";
    default:
      return typeof error === "string"
        ? error
        : "An unexpected error occurred.";
  }
}

// Success response format
export function createSuccessResponse(data, message = null) {
  const response = {
    success: true,
    timestamp: new Date().toISOString(),
    ...data,
  };

  if (message) {
    response.message = message;
  }

  return NextResponse.json(response);
}

// Validation utilities
export class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

export function validateRequired(value, fieldName) {
  if (!value || (typeof value === "string" && !value.trim())) {
    throw new ValidationError(`${fieldName} is required`, fieldName);
  }
}

export function validateEmail(email, fieldName = "Email") {
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ValidationError(
      `${fieldName} must be a valid email address`,
      fieldName
    );
  }
}

export function validateLength(value, min, max, fieldName) {
  if (value && (value.length < min || value.length > max)) {
    throw new ValidationError(
      `${fieldName} must be between ${min} and ${max} characters`,
      fieldName
    );
  }
}

export function validateUrl(url, fieldName = "URL") {
  if (url) {
    try {
      new URL(url);
    } catch {
      throw new ValidationError(`${fieldName} must be a valid URL`, fieldName);
    }
  }
}

// Async error handler wrapper
export function withErrorHandler(handler) {
  return async (req, params) => {
    try {
      return await handler(req, params);
    } catch (error) {
      console.error("API Error:", error);

      if (error instanceof ValidationError) {
        return createErrorResponse(error.message, 400, { field: error.field });
      }

      // Database errors
      if (error.code === "23505") {
        return createErrorResponse("Resource already exists", 409);
      }

      if (error.code === "23503") {
        return createErrorResponse("Referenced resource not found", 400);
      }

      // Rate limiting errors
      if (error.message?.includes("rate limit")) {
        return createErrorResponse("Rate limit exceeded", 429);
      }

      // Default server error
      return createErrorResponse("Internal server error", 500, error.message);
    }
  };
}

// Input sanitization
export function sanitizeInput(input) {
  if (typeof input !== "string") return input;

  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .substring(0, 10000); // Limit length to prevent abuse
}

export function sanitizeHtml(input) {
  if (typeof input !== "string") return input;

  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// Rate limiting helper
const rateLimitStore = new Map();

export function checkRateLimit(identifier, windowMs = 60000, maxRequests = 10) {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Get existing requests for this identifier
  const requests = rateLimitStore.get(identifier) || [];

  // Filter out old requests
  const recentRequests = requests.filter((time) => time > windowStart);

  // Check if limit exceeded
  if (recentRequests.length >= maxRequests) {
    return {
      allowed: false,
      resetTime: Math.min(...recentRequests) + windowMs,
    };
  }

  // Add current request
  recentRequests.push(now);
  rateLimitStore.set(identifier, recentRequests);

  return {
    allowed: true,
    remaining: maxRequests - recentRequests.length,
  };
}
