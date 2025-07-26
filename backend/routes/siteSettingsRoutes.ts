import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import { getSiteSettings, updateSiteSettings, uploadSiteLogo, uploadLandingImage } from '../controllers/siteSettingsController';
import upload from '../middleware/uploadMiddleware';

const router = Router();

// Public route
router.get('/', getSiteSettings);

// Protected routes
router.use(protect);
router.put('/', authorize('Super Admin'), updateSiteSettings);
router.post('/upload-logo', authorize('Super Admin'), upload.single('logo'), uploadSiteLogo);
router.post('/upload-image', authorize('Super Admin'), upload.single('image'), uploadLandingImage);

export default router;