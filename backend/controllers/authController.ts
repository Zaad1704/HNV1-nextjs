import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User, { IUser } from '../models/User';
import Organization from '../models/Organization';
import { catchAsync, CustomError } from '../middleware/errorHandler';
import { sendEmail } from '../services/emailService';

const signToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const createSendToken = (user: IUser, statusCode: number, res: Response): void => {
  const token = signToken(user._id);
  
  const cookieOptions = {
    expires: new Date(
      Date.now() + (parseInt(process.env.JWT_COOKIE_EXPIRES_IN || '7') * 24 * 60 * 60 * 1000)
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const
  };

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    data: {
      user
    }
  });
};

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               phone:
 *                 type: string
 *               organizationName:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const register = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { firstName, lastName, email, password, phone, organizationName } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new CustomError('User with this email already exists', 400);
  }

  // Create organization if provided
  let organization;
  if (organizationName) {
    organization = await Organization.create({
      name: organizationName,
      owner: null, // Will be set after user creation
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States'
      }
    });
  }

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email: email.toLowerCase(),
    password,
    phone,
    organization: organization?._id,
    role: organization ? 'admin' : 'user'
  });

  // Update organization owner
  if (organization) {
    organization.owner = user._id;
    organization.members = [user._id];
    await organization.save();
  }

  // Generate email verification token
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = emailVerificationToken;
  await user.save({ validateBeforeSave: false });

  // Send verification email
  try {
    const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${emailVerificationToken}`;
    
    await sendEmail({
      to: user.email,
      subject: 'Verify Your Email Address',
      template: 'emailVerification',
      data: {
        firstName: user.firstName,
        verificationURL
      }
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    // Don't fail registration if email fails
  }

  createSendToken(user, 201, res);
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const login = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    throw new CustomError('Please provide email and password', 400);
  }

  // Check if user exists and password is correct
  const user = await User.findOne({ email: email.toLowerCase() })
    .select('+password')
    .populate('organization');

  if (!user || !(await user.comparePassword(password))) {
    throw new CustomError('Incorrect email or password', 401);
  }

  if (!user.isActive) {
    throw new CustomError('Your account has been deactivated. Please contact support.', 401);
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  createSendToken(user, 200, res);
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
export const logout = (req: Request, res: Response): void => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset email sent
 */
export const forgotPassword = catchAsync(async (req: Request, res: Response): Promise<void> => {
  // Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email.toLowerCase() });
  if (!user) {
    throw new CustomError('There is no user with that email address.', 404);
  }

  // Generate the random reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await user.save({ validateBeforeSave: false });

  // Send it to user's email
  try {
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      template: 'passwordReset',
      data: {
        firstName: user.firstName,
        resetURL
      }
    });

    res.status(200).json({
      success: true,
      message: 'Token sent to email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    throw new CustomError('There was an error sending the email. Try again later.', 500);
  }
});

/**
 * @swagger
 * /api/auth/reset-password/{token}:
 *   patch:
 *     summary: Reset password with token
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - passwordConfirm
 *             properties:
 *               password:
 *                 type: string
 *                 minLength: 6
 *               passwordConfirm:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password reset successful
 */
export const resetPassword = catchAsync(async (req: Request, res: Response): Promise<void> => {
  // Get user based on the token
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // If token has not expired, and there is user, set the new password
  if (!user) {
    throw new CustomError('Token is invalid or has expired', 400);
  }

  if (req.body.password !== req.body.passwordConfirm) {
    throw new CustomError('Passwords do not match', 400);
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Log the user in, send JWT
  createSendToken(user, 200, res);
});

/**
 * @swagger
 * /api/auth/verify-email/{token}:
 *   get:
 *     summary: Verify email address
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 */
export const verifyEmail = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;

  const user = await User.findOne({ emailVerificationToken: token });

  if (!user) {
    throw new CustomError('Invalid verification token', 400);
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Email verified successfully'
  });
});

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: Resend email verification
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Verification email sent
 */
export const resendVerification = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const user = req.user!;

  if (user.isEmailVerified) {
    throw new CustomError('Email is already verified', 400);
  }

  // Generate new verification token
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = emailVerificationToken;
  await user.save({ validateBeforeSave: false });

  // Send verification email
  const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${emailVerificationToken}`;
  
  await sendEmail({
    to: user.email,
    subject: 'Verify Your Email Address',
    template: 'emailVerification',
    data: {
      firstName: user.firstName,
      verificationURL
    }
  });

  res.status(200).json({
    success: true,
    message: 'Verification email sent'
  });
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 */
export const getMe = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const user = await User.findById(req.user!._id).populate('organization');

  res.status(200).json({
    success: true,
    data: {
      user
    }
  });
});

/**
 * @swagger
 * /api/auth/update-password:
 *   patch:
 *     summary: Update current password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - passwordCurrent
 *               - password
 *               - passwordConfirm
 *             properties:
 *               passwordCurrent:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *               passwordConfirm:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password updated successfully
 */
export const updatePassword = catchAsync(async (req: Request, res: Response): Promise<void> => {
  // Get user from collection
  const user = await User.findById(req.user!._id).select('+password');

  // Check if POSTed current password is correct
  if (!(await user!.comparePassword(req.body.passwordCurrent))) {
    throw new CustomError('Your current password is wrong.', 401);
  }

  if (req.body.password !== req.body.passwordConfirm) {
    throw new CustomError('Passwords do not match', 400);
  }

  // If so, update password
  user!.password = req.body.password;
  await user!.save();

  // Log user in, send JWT
  createSendToken(user!, 200, res);
});