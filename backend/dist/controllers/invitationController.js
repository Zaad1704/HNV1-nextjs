"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinWithCode = exports.getOrganizationCode = exports.inviteTeamMember = void 0;
const User_1 = __importDefault(require("../models/User"));
const Organization_1 = __importDefault(require("../models/Organization"));
const crypto_1 = __importDefault(require("crypto"));
const inviteTeamMember = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const { email, role, name } = req.body;
        if (!email || !role || !name) {
            return res.status(400).json({
                success: false,
                message: 'Email, role, and name are required'
            });
        }
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }
        const inviteToken = crypto_1.default.randomBytes(32).toString('hex');
        const hashedToken = crypto_1.default.createHash('sha256').update(inviteToken).digest('hex');
        const user = await User_1.default.create({
            name,
            email,
            role,
            organizationId: req.user.organizationId,
            status: 'pending',
            isEmailVerified: false,
            emailVerificationToken: hashedToken,
            emailVerificationExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
        await Organization_1.default.findByIdAndUpdate(req.user.organizationId, { $addToSet: { members: user._id } });
        try {
            const messagingService = (await Promise.resolve().then(() => __importStar(require('../services/messagingService')))).default;
            const inviteLink = `${process.env.FRONTEND_URL}/accept-invitation?token=${inviteToken}`;
            const organization = await Organization_1.default.findById(req.user.organizationId);
            await messagingService.sendInvitation(email, req.user.name, organization?.name || 'Organization', role, inviteLink);
        }
        catch (emailError) {
            console.error('Failed to send invitation email:', emailError);
        }
        res.status(201).json({
            success: true,
            message: 'Invitation sent successfully',
            data: { email, role, name }
        });
    }
    catch (error) {
        console.error('Invite team member error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.inviteTeamMember = inviteTeamMember;
const getOrganizationCode = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const organization = await Organization_1.default.findById(req.user.organizationId);
        if (!organization) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }
        let orgCode = organization.inviteCode;
        if (!orgCode) {
            orgCode = req.user.organizationId.toString().substring(0, 8).toUpperCase();
            organization.inviteCode = orgCode;
            await organization.save();
        }
        res.json({
            success: true,
            data: {
                code: orgCode,
                organizationName: organization.name
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getOrganizationCode = getOrganizationCode;
const joinWithCode = async (req, res) => {
    try {
        const { code, name, email, password } = req.body;
        if (!code || !name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }
        const organization = await Organization_1.default.findOne({ inviteCode: code });
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Invalid organization code'
            });
        }
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }
        const user = await User_1.default.create({
            name,
            email,
            password,
            role: 'Agent',
            organizationId: organization._id,
            status: 'active',
            isEmailVerified: true
        });
        await Organization_1.default.findByIdAndUpdate(organization._id, { $addToSet: { members: user._id } });
        res.status(201).json({
            success: true,
            message: 'Successfully joined organization',
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                organization: {
                    name: organization.name
                }
            }
        });
    }
    catch (error) {
        console.error('Join with code error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.joinWithCode = joinWithCode;
