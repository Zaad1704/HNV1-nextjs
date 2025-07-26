import { Request, Response    } from 'express';
export const getCMSContent: async ($1) => { try { };
    res.json({ success: true, data: []  });
  } catch(error) {
res.status(500).json({ success: false, message: error.message
});
};
export const createCMSContent: async ($1) => { try { };
    res.json({ success: true, data: req.body  });
  } catch(error) {
res.status(500).json({ success: false, message: error.message
});
};