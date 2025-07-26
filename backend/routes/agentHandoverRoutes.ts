import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

// Get agent handovers
router.get('/', async (req, res) => {
  try {
    res.status(200).json({ 
      success: true, 
      data: [],
      message: 'Agent handover feature coming soon'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create agent handover
router.post('/', async (req, res) => {
  try {
    res.status(201).json({ 
      success: true, 
      data: {},
      message: 'Agent handover submitted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;