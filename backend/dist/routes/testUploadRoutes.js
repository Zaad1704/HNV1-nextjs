"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
router.get('/check-uploads', (req, res) => {
    const uploadsDir = path_1.default.join(__dirname, '../uploads');
    const imagesDir = path_1.default.join(__dirname, '../uploads/images');
    try {
        const uploadsExists = fs_1.default.existsSync(uploadsDir);
        const imagesExists = fs_1.default.existsSync(imagesDir);
        let uploadsContents = [];
        let imagesContents = [];
        if (uploadsExists) {
            uploadsContents = fs_1.default.readdirSync(uploadsDir);
        }
        if (imagesExists) {
            imagesContents = fs_1.default.readdirSync(imagesDir);
        }
        res.json({
            uploadsDir,
            imagesDir,
            uploadsExists,
            imagesExists,
            uploadsContents,
            imagesContents,
            cwd: process.cwd(),
            __dirname
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
