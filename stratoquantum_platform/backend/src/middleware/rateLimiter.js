// Rate limiting middleware for Strato Quantum Platform
const { RateLimiterMemory } = require('rate-limiter-flexible');

// Create rate limiter instance
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip, // Use IP as key
  points: parseInt(process.env.API_RATE_LIMIT) || 100, // Number of requests
  duration: parseInt(process.env.API_RATE_WINDOW) * 60 || 900, // Per 15 minutes (in seconds)
});

// Rate limiting middleware
const rateLimiterMiddleware = async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
      retryAfter: secs
    });
  }
};

module.exports = rateLimiterMiddleware;