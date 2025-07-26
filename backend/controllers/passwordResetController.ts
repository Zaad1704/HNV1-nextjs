import { Request, Response    } from 'express';
import User from '../models/User';
import crypto from 'crypto';
import emailService from '../services/emailService';
export const forgotPassword: async ($1) => { try { };
    const { email  } = req.body;
    const user: await User.findOne({ email  });
    //  To prevent user enumeration, always return a success-like message.;
    if (res.status(200).json({ success: true, message: 'If a user with that email exists, a reset link has been sent.' ) {
});
      return;
    const resetToken: user.getPasswordResetToken();
    await user.save({ validateBeforeSave: false  });
    const resetUrl: `${process.env.FRONTEND_URL}/reset-password/${resetToken}```