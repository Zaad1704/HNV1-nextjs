"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCloudinaryConfigured = exports.uploadToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const stream_1 = require("stream");
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary_1.v2.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}
else {
    console.warn('Cloudinary credentials not configured - image uploads will use local storage');
}
const uploadToCloudinary = async (file, folder = 'hnv-property-management') => {
    try {
        let uploadSource;
        if (file.buffer) {
            uploadSource = new Promise((resolve, reject) => {
                const stream = cloudinary_1.v2.uploader.upload_stream({ folder, resource_type: 'auto' }, (error, result) => {
                    if (error)
                        reject(error);
                    else
                        resolve(result?.secure_url);
                });
                stream_1.Readable.from(file.buffer).pipe(stream);
            });
        }
        else if (file.path) {
            const result = await cloudinary_1.v2.uploader.upload(file.path, {
                folder,
                resource_type: 'auto',
            });
            uploadSource = result.secure_url;
        }
        else {
            throw new Error('No file buffer or path provided');
        }
        return await uploadSource;
    }
    catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Failed to upload file');
    }
};
exports.uploadToCloudinary = uploadToCloudinary;
const isCloudinaryConfigured = () => {
    return !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
};
exports.isCloudinaryConfigured = isCloudinaryConfigured;
exports.default = cloudinary_1.v2;
