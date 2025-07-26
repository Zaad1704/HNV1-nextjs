import express from 'express';
import { requireOrganization } from '../middleware/auth';
import { uploadSingle, uploadMultiple } from '../middleware/upload';
import { uploadFile, uploadMultipleFiles } from '../controllers/uploadController';

const router = express.Router();

router.post('/single', requireOrganization, uploadSingle('file'), uploadFile);
router.post('/multiple', requireOrganization, uploadMultiple('files'), uploadMultipleFiles);

export default router;