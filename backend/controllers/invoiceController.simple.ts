import { Request, Response    } from 'express';
export const getInvoices: async ($1) => { try { };
    res.json({ success: true, data: []  });
  } catch(error) {
res.status(500).json({ success: false, message: error.message
});
};
export const createInvoice: async ($1) => { try { };
    res.json({ success: true, data: req.body  });
  } catch(error) {
res.status(500).json({ success: false, message: error.message
});
};