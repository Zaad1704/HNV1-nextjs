import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary only if credentials are available
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.warn('Cloudinary credentials not configured - image uploads will use local storage');
}

export const uploadToCloudinary = async (file: any, folder: string = 'hnv-property-management'): Promise<string> => {
  try {
    let uploadSource;
    
    if (file.buffer) {
      // Convert buffer to stream for multer memory storage
      uploadSource = new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder, resource_type: 'auto' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result?.secure_url);
          }
        );
        Readable.from(file.buffer).pipe(stream);
      });
    } else if (file.path) {
      // Direct file path upload
      const result = await cloudinary.uploader.upload(file.path, {
        folder,
        resource_type: 'auto',
      });
      uploadSource = result.secure_url;
    } else {
      throw new Error('No file buffer or path provided');
    }
    
    return await uploadSource;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload file');
  }
};

export const isCloudinaryConfigured = (): boolean => {
  return !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
};

export default cloudinary;