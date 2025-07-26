import { Router } from 'express';
import path from 'path';
import fs from 'fs';

const router = Router();

router.get('/check-uploads', (req, res) => {
  const uploadsDir = path.join(__dirname, '../uploads');
  const imagesDir = path.join(__dirname, '../uploads/images');
  
  try {
    const uploadsExists = fs.existsSync(uploadsDir);
    const imagesExists = fs.existsSync(imagesDir);
    
    let uploadsContents = [];
    let imagesContents = [];
    
    if (uploadsExists) {
      uploadsContents = fs.readdirSync(uploadsDir);
    }
    
    if (imagesExists) {
      imagesContents = fs.readdirSync(imagesDir);
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;