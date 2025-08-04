// Simple in-memory rate limiter for development
// In production, use Redis-based rate limiting

const cache = new Map();

export function rateLimit({ interval, uniqueTokenPerInterval = 500 }) {
  return {
    check: async (limit, token) => {
      const now = Date.now();
      const key = `${token}`;
      
      // Clean up old entries
      if (cache.size > uniqueTokenPerInterval) {
        const oldestTime = now - interval;
        for (const [k, v] of cache.entries()) {
          if (v.reset < oldestTime) {
            cache.delete(k);
          }
        }
      }

      const tokenData = cache.get(key) || { count: 0, reset: now + interval };

      if (now > tokenData.reset) {
        tokenData.count = 0;
        tokenData.reset = now + interval;
      }

      if (tokenData.count >= limit) {
        throw new Error('Rate limit exceeded');
      }

      tokenData.count++;
      cache.set(key, tokenData);
      
      return { success: true };
    }
  };
}