import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import crypto from 'crypto';

export const generatePasskeyChallenge = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById((req.user as any)._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const challenge = crypto.randomBytes(32).toString('base64url');
    
    // Store challenge temporarily (in production, use Redis)
    user.passkeyChallenge = challenge;
    user.passkeyChallengeExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await user.save();

    const publicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: "HNV1 Property Management",
        id: process.env.FRONTEND_URL?.replace(/https?:\/\//, '') || "localhost"
      },
      user: {
        id: user._id.toString(),
        name: user.email,
        displayName: user.name
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" },
        { alg: -257, type: "public-key" }
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required"
      },
      timeout: 60000,
      attestation: "direct"
    };

    res.status(200).json({
      success: true,
      data: publicKeyCredentialCreationOptions
    });

  } catch (error) {
    console.error('Generate passkey challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during passkey setup'
    });
  }
};

export const registerPasskey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { credential, deviceName } = req.body;
    const user = await User.findById((req.user as any)._id);

    if (!user || !user.passkeyChallenge) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired challenge'
      });
    }

    // Verify challenge (simplified - in production, use proper WebAuthn verification)
    if (user.passkeyChallengeExpires && user.passkeyChallengeExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Challenge expired'
      });
    }

    const passkeyId = crypto.randomBytes(16).toString('hex');
    
    user.passkeys.push({
      id: passkeyId,
      publicKey: credential.response.publicKey || credential.id,
      counter: 0,
      deviceName: deviceName || 'Unknown Device',
      createdAt: new Date()
    });

    user.passkeyChallenge = undefined;
    user.passkeyChallengeExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Passkey registered successfully',
      data: { passkeyId, deviceName }
    });

  } catch (error) {
    console.error('Register passkey error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during passkey registration'
    });
  }
};

export const getPasskeys = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById((req.user as any)._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const passkeys = user.passkeys.map(pk => ({
      id: pk.id,
      deviceName: pk.deviceName,
      createdAt: pk.createdAt
    }));

    res.status(200).json({
      success: true,
      data: { passkeys, total: passkeys.length }
    });

  } catch (error) {
    console.error('Get passkeys error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const deletePasskey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { passkeyId } = req.params;
    const user = await User.findById((req.user as any)._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.passkeys = user.passkeys.filter(pk => pk.id !== passkeyId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Passkey deleted successfully'
    });

  } catch (error) {
    console.error('Delete passkey error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};