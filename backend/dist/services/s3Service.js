"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const aws_1 = require("../config/aws");
class S3Service {
    async uploadFile(key, body, contentType) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket: aws_1.S3_CONFIG.bucket,
            Key: key,
            Body: body,
            ContentType: contentType,
            ACL: 'public-read'
        });
        await aws_1.s3Client.send(command);
        return `${aws_1.S3_CONFIG.baseUrl}/${key}`;
    }
    async deleteFile(key) {
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: aws_1.S3_CONFIG.bucket,
            Key: key
        });
        await aws_1.s3Client.send(command);
    }
    async getSignedUrl(key, expiresIn = 3600) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: aws_1.S3_CONFIG.bucket,
            Key: key
        });
        return await (0, s3_request_presigner_1.getSignedUrl)(aws_1.s3Client, command, { expiresIn });
    }
    extractKeyFromUrl(url) {
        return url.replace(`${aws_1.S3_CONFIG.baseUrl}/`, '');
    }
    async moveFile(oldKey, newKey) {
        const getCommand = new client_s3_1.GetObjectCommand({
            Bucket: aws_1.S3_CONFIG.bucket,
            Key: oldKey
        });
        const oldFile = await aws_1.s3Client.send(getCommand);
        const putCommand = new client_s3_1.PutObjectCommand({
            Bucket: aws_1.S3_CONFIG.bucket,
            Key: newKey,
            Body: oldFile.Body,
            ContentType: oldFile.ContentType,
            ACL: 'public-read'
        });
        await aws_1.s3Client.send(putCommand);
        await this.deleteFile(oldKey);
        return `${aws_1.S3_CONFIG.baseUrl}/${newKey}`;
    }
}
exports.default = new S3Service();
