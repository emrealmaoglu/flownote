import rateLimit from "express-rate-limit";

/**
 * Auth Rate Limiter
 * Login ve Register endpoint'leri için sıkı rate limit
 * @SecOps - Brute force koruması
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 attempts per windowMs
  message: {
    statusCode: 429,
    message: "Too many login attempts, please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Başarılı girişleri sayma
});

/**
 * Apply auth rate limiter to express routes
 */
export function applyAuthRateLimit(app: {
  use: (path: string, handler: unknown) => void;
}) {
  app.use("/api/auth/login", authRateLimiter);
  app.use("/api/auth/register", authRateLimiter);
}
