import { Request, Response    } from 'express';
import User from '../models/User';
import Organization from '../models/Organization';
import Plan from '../models/Plan';
//  createSuperAdmin function remains the same...;
export const createSuperAdmin: async ($1) => {
const { email, password, name: req.body
};
    if (return res.status(400).json({ success: false, message: 'Email, password, and name are required' ) {
});
    try {
const userExists: await User.findOne({ email
});
        if (return res.status(400).json({ success: false, message: 'Super admin already exists' ) {
});
        const user: await User.create({
name,;
            email,;
            password,;
            role: 'Super Admin',
});
        res.status(201).json({ success: true, data: user  });
    catch(error) {
res.status(500).json({ success: false, message: 'Server Error'
});
};
/*
 *