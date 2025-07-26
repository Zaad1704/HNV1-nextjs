"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
const googleapis_1 = require("googleapis");
const path_1 = __importDefault(require("path"));
const stream_1 = require("stream");
let auth;
let drive;
const UPLOAD_FOLDER_ID = process.env.GOOGLE_DRIVE_UPLOAD_FOLDER_ID;
let isGoogleDriveConfigured = false;
try {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON || '{}');
    if (credentials.client_email && credentials.private_key) {
        auth = new googleapis_1.google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/drive'],
        });
        drive = googleapis_1.google.drive({ version: 'v3', auth });
        isGoogleDriveConfigured = true;
    }
    else {
        console.warn('⚠️ Google Drive upload service not configured - file uploads will be disabled');
    }
}
catch (error) {
    console.warn('Google Drive credentials parsing failed - file uploads will be disabled:', error);
}
const uploadImage = async (req, res) => {
    if (!isGoogleDriveConfigured) {
        return res.status(503).json({
            success: false,
            message: 'File upload service is not configured. Please contact administrator.'
        });
    }
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No file uploaded.'
        });
    }
    try {
        const file = req.file;
        const bufferStream = new stream_1.Readable();
        bufferStream.push(file.buffer);
        bufferStream.push(null);
        const uniqueFilename = `upload-${Date.now()}-${Math.random().toString(36).substring(2, 15)}${path_1.default.extname(file.originalname)}`;
        const fileMetadata = {
            name: uniqueFilename,
            parents: UPLOAD_FOLDER_ID ? [UPLOAD_FOLDER_ID] : undefined,
        };
        const media = {
            mimeType: file.mimetype,
            body: bufferStream,
        };
        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id',
        });
        const fileId = response.data.id;
        await drive.permissions.create({
            fileId: fileId,
            resource: {
                role: 'reader',
                type: 'anyone',
            },
        });
        const imageUrl = `https://drive.google.com/uc?id=${fileId}`;
        const thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
        res.json({
            success: true,
            data: {
                url: imageUrl,
                thumbnailUrl: thumbnailUrl,
                fileId: fileId,
                filename: uniqueFilename,
                originalName: file.originalname,
                size: file.size
            }
        });
    }
    catch (error) {
        console.error('Google Drive upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Upload failed. Please try again.'
        });
    }
};
exports.uploadImage = uploadImage;
