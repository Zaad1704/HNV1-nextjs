import { Router } from 'express';
import {
  getIntegrations,
  deleteIntegration,
  searchIntegrations,
  getSearchSuggestions,
  createPaymentIntent
} from '../controllers/integrationController';

const router = Router();

router.get('/', getIntegrations);
router.delete('/:id', deleteIntegration);
router.get('/search', searchIntegrations);
router.get('/search/suggestions', getSearchSuggestions);
router.post('/payment/intent', createPaymentIntent);

export default router;
