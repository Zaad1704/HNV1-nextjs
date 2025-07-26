import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_CONFIG } from '../config/aws';

class S3Service {
  async uploadFile(key: string, body: Buffer, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: S3_CONFIG.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      ACL: 'public-read'
    });

    await s3Client.send(command);
    return `${S3_CONFIG.baseUrl}/${key}`;
  }

  async deleteFile(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: S3_CONFIG.bucket,
      Key: key
    });

    await s3Client.send(command);
  }

  async getSignedUrl(key: string, expiresIn: number = 3600) {
    const command = new GetObjectCommand({
      Bucket: S3_CONFIG.bucket,
      Key: key
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  }

  extractKeyFromUrl(url: string): string {
    return url.replace(`${S3_CONFIG.baseUrl}/`, '');
  }

  async moveFile(oldKey: string, newKey: string) {
    // Get the old file
    const getCommand = new GetObjectCommand({
      Bucket: S3_CONFIG.bucket,
      Key: oldKey
    });
    
    const oldFile = await s3Client.send(getCommand);
    
    // Upload to new location
    const putCommand = new PutObjectCommand({
      Bucket: S3_CONFIG.bucket,
      Key: newKey,
      Body: oldFile.Body,
      ContentType: oldFile.ContentType,
      ACL: 'public-read'
    });

    await s3Client.send(putCommand);

    // Delete old file
    await this.deleteFile(oldKey);

    return `${S3_CONFIG.baseUrl}/${newKey}`;
  }
}

export default new S3Service();