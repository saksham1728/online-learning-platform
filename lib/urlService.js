/**
 * URLService - Utility for generating consistent URLs across the application
 * Handles production vs development URL generation
 */
class URLService {
  /**
   * Get the base URL for the application
   * Priority: NEXT_PUBLIC_BASE_URL > VERCEL_URL > production fallback > localhost
   */
  static getBaseURL() {
    // Check for explicit environment variable first
    if (process.env.NEXT_PUBLIC_BASE_URL) {
      return process.env.NEXT_PUBLIC_BASE_URL;
    }

    // In production, use Vercel URL if available
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }

    // Production fallback to known deployment URL
    if (process.env.NODE_ENV === "production") {
      return "https://online-learning-platform-ashy.vercel.app";
    }

    // Development fallback
    return "http://localhost:3000";
  }

  /**
   * Generate a share URL for a given share ID
   * @param {string} shareId - The share ID
   * @returns {string} - Complete share URL
   */
  static generateShareURL(shareId) {
    const baseURL = this.getBaseURL();
    return `${baseURL}/share/${shareId}`;
  }

  /**
   * Generate a relative share URL (for internal use)
   * @param {string} shareId - The share ID
   * @returns {string} - Relative share URL
   */
  static generateRelativeShareURL(shareId) {
    return `/share/${shareId}`;
  }

  /**
   * Check if we're in production environment
   * @returns {boolean}
   */
  static isProduction() {
    return process.env.NODE_ENV === "production";
  }
}

module.exports = URLService;
