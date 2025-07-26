import express from 'express';
import { requireOrganization } from '../middleware/auth';
import {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  addUnit,
  updateUnit,
  deleteUnit
} from '../controllers/propertyController';

const router = express.Router();

router.route('/')
  .get(requireOrganization, getProperties)
  .post(requireOrganization, createProperty);

router.route('/:id')
  .get(requireOrganization, getProperty)
  .put(requireOrganization, updateProperty)
  .delete(requireOrganization, deleteProperty);

router.route('/:id/units')
  .post(requireOrganization, addUnit);

router.route('/:id/units/:unitId')
  .put(requireOrganization, updateUnit)
  .delete(requireOrganization, deleteUnit);

export default router;