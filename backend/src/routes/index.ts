import { Router } from 'express';
import { UrlController } from '../controllers/url.controller';
import { validateRequest, createUrlSchema } from '../middleware/validation';
import { createUrlLimiter, apiLimiter } from '../middleware/rateLimiter';

const router = Router();
const urlController = new UrlController();

// Apply general rate limiting to all API routes
router.use('/api', apiLimiter);

// URL shortening
router.post('/api/shorten', createUrlLimiter, validateRequest(createUrlSchema), (req, res) =>
  urlController.createShortUrl(req, res)
);

// URL management
router.get('/api/urls', (req, res) => urlController.getUserUrls(req, res));
router.get('/api/urls/:id', (req, res) => urlController.getUrlDetails(req, res));
router.patch('/api/urls/:id', (req, res) => urlController.updateUrl(req, res));
router.delete('/api/urls/:id', (req, res) => urlController.deleteUrl(req, res));

// Analytics
router.get('/api/urls/:id/analytics', (req, res) => urlController.getAnalytics(req, res));
router.get('/api/urls/:id/export', (req, res) => urlController.exportAnalytics(req, res));

// QR Code
router.get('/api/qr/:shortCode', (req, res) => urlController.generateQRCode(req, res));

// Redirect (must be last to not conflict with /api routes)
router.get('/:shortCode', (req, res) => urlController.redirect(req, res));

export default router;
