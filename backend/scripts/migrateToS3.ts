import fs from 'fs';
import path from 'path';
import s3Service from '../services/s3Service';
import User from '../models/User';
import Organization from '../models/Organization';
import SiteSettings from '../models/SiteSettings';

async function migrateToS3() {
  console.log('Starting migration from local storage to S3...');

  const uploadsDir = path.join(process.cwd(), 'backend/uploads');
  
  if (!fs.existsSync(uploadsDir)) {
    console.log('No uploads directory found. Migration complete.');
    return;
  }

  const files = fs.readdirSync(uploadsDir);
  let migratedCount = 0;

  for (const file of files) {
    try {
      const filePath = path.join(uploadsDir, file);
      const fileBuffer = fs.readFileSync(filePath);
      const contentType = getContentType(file);
      const s3Key = `migrated/${file}`;

      // Upload to S3
      const s3Url = await s3Service.uploadFile(s3Key, fileBuffer, contentType);
      
      // Update database references
      await updateDatabaseReferences(`/uploads/${file}`, s3Url);
      
      console.log(`Migrated: ${file} -> ${s3Url}`);
      migratedCount++;
    } catch (error) {
      console.error(`Failed to migrate ${file}:`, error);
    }
  }

  console.log(`Migration complete. ${migratedCount} files migrated.`);
}

function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const contentTypes: { [key: string]: string } = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };
  return contentTypes[ext] || 'application/octet-stream';
}

async function updateDatabaseReferences(oldUrl: string, newUrl: string) {
  // Update users with profile pictures
  await User.updateMany(
    { profilePicture: oldUrl },
    { profilePicture: newUrl }
  );

  // Update organizations with logos
  await Organization.updateMany(
    { logo: oldUrl },
    { logo: newUrl }
  );

  // Update site settings
  await SiteSettings.updateMany(
    { logo: oldUrl },
    { logo: newUrl }
  );

  // Update any content images in site settings
  await SiteSettings.updateMany(
    { 'content.hero.backgroundImage': oldUrl },
    { 'content.hero.backgroundImage': newUrl }
  );
}

// Run migration if called directly
if (require.main === module) {
  migrateToS3().catch(console.error);
}

export default migrateToS3;