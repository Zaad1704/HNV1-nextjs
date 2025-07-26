import { Request, Response, NextFunction } from 'express';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import User from '../models/User';

export const generateTwoFactorSecret = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById((req.user as any)._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is already enabled'
      });
    }

    const secret = speakeasy.generateSecret({
      name: `HNV1 (${user.email})`,
      issuer: 'HNV1 Property Management',
      length: 32
    });

    // Store temporary secret (not yet confirmed)
    user.twoFactorTempSecret = secret.base32;
    await user.save();

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    res.status(200).json({
      success: true,
      data: {
        secret: secret.base32,
        qrCode: qrCodeUrl,
        manualEntryKey: secret.base32
      },
      message: '2FA secret generated. Please verify with your authenticator app.'
    });

  } catch (error) {
    console.error('Generate 2FA secret error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during 2FA setup'
    });
  }
};

export const verifyTwoFactorSetup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    const user = await User.findById((req.user as any)._id);

    if (!user || !user.twoFactorTempSecret) {
      return res.status(400).json({
        success: false,
        message: 'No 2FA setup in progress'
      });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorTempSecret,
      encoding: 'base32',
      token,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    // Enable 2FA
    user.twoFactorSecret = user.twoFactorTempSecret;
    user.twoFactorEnabled = true;
    user.twoFactorTempSecret = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: '2FA enabled successfully'
    });

  } catch (error) {
    console.error('Verify 2FA setup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during 2FA verification'
    });
  }
};

export const disableTwoFactor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    const user = await User.findById((req.user as any)._id);

    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is not enabled'
      });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret!,
      encoding: 'base32',
      token,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    // Disable 2FA
    user.twoFactorSecret = undefined;
    user.twoFactorEnabled = false;
    user.twoFactorTempSecret = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: '2FA disabled successfully'
    });

  } catch (error) {
    console.error('Disable 2FA error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during 2FA disable'
    });
  }
};

export const verifyTwoFactorLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, twoFactorToken } = req.body;

    if (!email || !password || !twoFactorToken) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and 2FA token are required'
      });
    }

    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        message: '2FA is not enabled for this account'
      });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: twoFactorToken,
      window: 2
    });

    if (!verified) {
      return res.status(401).json({
        success: false,
        message: 'Invalid 2FA token'
      });
    }

    // Generate JWT token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        twoFactorEnabled: user.twoFactorEnabled
      },
      message: 'Login successful'
    });

  } catch (error) {
    console.error('2FA login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

export const getTwoFactorStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById((req.user as any)._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        twoFactorEnabled: user.twoFactorEnabled || false,
        hasSetupInProgress: !!user.twoFactorTempSecret
      }
    });

  } catch (error) {
    console.error('Get 2FA status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};