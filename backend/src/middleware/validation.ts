import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const createUrlSchema = z.object({
  url: z.string().url().max(2048),
  customAlias: z.string().min(3).max(20).optional().nullable()
    .transform(v => v === '' || v === null ? undefined : v),
  expiresAt: z.string().optional().nullable()
    .transform(v => v === '' || v === null ? undefined : v)
    .pipe(z.string().datetime().optional()),
  password: z.string().min(4).max(50).optional().nullable()
    .transform(v => v === '' || v === null ? undefined : v),
});

export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors,
        });
      }
      next(error);
    }
  };
};
