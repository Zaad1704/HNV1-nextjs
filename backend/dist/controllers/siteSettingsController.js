"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSiteSettings = exports.uploadLandingImage = exports.uploadSiteLogo = exports.getSiteSettings = void 0;
const SiteSettings_1 = __importDefault(require("../models/SiteSettings"));
const getSiteSettings = async (req, res) => {
    try {
        let settings = await SiteSettings_1.default.findOne();
        if (!settings) {
            settings = await SiteSettings_1.default.create({
                siteName: 'HNV Property Management',
                logo: '/logo.png',
                theme: 'default',
                currency: 'USD',
                dateFormat: 'MM/DD/YYYY',
                timezone: 'UTC'
            });
        }
        res.status(200).json({ success: true, data: settings });
    }
    catch (error) {
        console.error('Get site settings error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getSiteSettings = getSiteSettings;
const uploadSiteLogo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        const logoUrl = req.file.location;
        const settings = await SiteSettings_1.default.findOneAndUpdate({}, {
            logo: logoUrl,
            updatedAt: new Date(),
            updatedBy: req.user?._id
        }, { new: true, upsert: true });
        res.status(200).json({
            success: true,
            data: { logoUrl, settings },
            message: 'Logo uploaded successfully'
        });
    }
    catch (error) {
        console.error('Upload logo error:', error);
        res.status(500).json({ success: false, message: 'Error uploading logo' });
    }
};
exports.uploadSiteLogo = uploadSiteLogo;
const uploadLandingImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        const { section, field } = req.body;
        const imageUrl = req.file.location;
        const updatePath = section && field ? `content.${section}.${field}` : 'landingImage';
        const updateData = {
            [updatePath]: imageUrl,
            updatedAt: new Date(),
            updatedBy: req.user?._id
        };
        const settings = await SiteSettings_1.default.findOneAndUpdate({}, updateData, { new: true, upsert: true });
        res.status(200).json({
            success: true,
            data: { imageUrl, settings },
            message: 'Image uploaded successfully'
        });
    }
    catch (error) {
        console.error('Upload landing image error:', error);
        res.status(500).json({ success: false, message: 'Error uploading image' });
    }
};
exports.uploadLandingImage = uploadLandingImage;
const updateSiteSettings = async (req, res) => {
    try {
        const updateData = {
            ...req.body,
            updatedAt: new Date(),
            updatedBy: req.user?._id
        };
        const settings = await SiteSettings_1.default.findOneAndUpdate({}, updateData, { new: true, upsert: true });
        res.status(200).json({ success: true, data: settings });
    }
    catch (error) {
        console.error('Update site settings error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.updateSiteSettings = updateSiteSettings;
