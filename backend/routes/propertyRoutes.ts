import express from 'express';
import { requireOrganization } from '../middleware/auth';
import {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty
} from '../controllers/propertyController-real';

const router = express.Router();

router.route('/')
  .get(requireOrganization, getProperties)
  .post(requireOrganization, createProperty);

router.route('/:id')
  .get(requireOrganization, getProperty)
  .put(requireOrganization, updateProperty)
  .delete(requireOrganization, deleteProperty);

// Unit routes temporarily disabled

export default router;