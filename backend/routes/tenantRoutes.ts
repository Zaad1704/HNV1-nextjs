import express from 'express';
import { requireOrganization } from '../middleware/auth';
import {
  getTenants,
  getTenant,
  createTenant,
  updateTenant,
  deleteTenant,
  addNote,
  updateNote,
  deleteNote
} from '../controllers/tenantController';

const router = express.Router();

router.route('/')
  .get(requireOrganization, getTenants)
  .post(requireOrganization, createTenant);

router.route('/:id')
  .get(requireOrganization, getTenant)
  .put(requireOrganization, updateTenant)
  .delete(requireOrganization, deleteTenant);

router.route('/:id/notes')
  .post(requireOrganization, addNote);

router.route('/:id/notes/:noteId')
  .put(requireOrganization, updateNote)
  .delete(requireOrganization, deleteNote);

export default router;