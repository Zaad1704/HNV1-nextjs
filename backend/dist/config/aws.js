"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3_CONFIG = exports.s3Client = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
exports.s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});
exports.S3_CONFIG = {
    bucket: process.env.AWS_S3_BUCKET || 'hnv1-storage',
    region: process.env.AWS_REGION || 'us-east-1',
    baseUrl: `https://${process.env.AWS_S3_BUCKET || 'hnv1-storage'}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com`
};
