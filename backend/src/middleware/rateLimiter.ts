import rateLimit from 'express-rate-limit';

// Rate limiter для создания ссылок (10 в час с одного IP)
export const createUrlLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '3600000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10'),
  message: 'Too many URLs created from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Общий лимит для API
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
