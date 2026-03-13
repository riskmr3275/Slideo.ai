import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { AuthRequest } from '../middleware/auth';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dmd5d2qse', // Fallback to demo cloud name
  api_key: process.env.Cloudinary_API_KEY, // Matches .env
  api_secret: process.env.Clodinary_API_SECRET // Matches .env typo
});

export const uploadImage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'gamma_clone_uploads',
      resource_type: 'image'
    });

    res.status(200).json({
      url: result.secure_url,
      publicId: result.public_id
    });
  } catch (error: any) {
    console.error('Failed to upload image to Cloudinary:', error);
    res.status(500).json({ error: error.message || 'Failed to upload image' });
  }
};
