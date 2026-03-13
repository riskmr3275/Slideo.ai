import { Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';

// Configure Cloudinary (shared with uploadController)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dmd5d2qse',
  api_key: process.env.Cloudinary_API_KEY,
  api_secret: process.env.Clodinary_API_SECRET
});

export const uploadPptx = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    if (!req.file) {
      return res.status(400).json({ error: 'No PPTX file provided' });
    }

    // Upload raw file to Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'slideo_pptx_imports',
      resource_type: 'raw',
      public_id: `${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9]/g, '_')}`
    });

    const importedPpt = await prisma.importedPpt.create({
      data: {
        userId,
        fileName: req.file.originalname,
        fileUrl: result.secure_url
      }
    });

    res.status(201).json(importedPpt);
  } catch (error: any) {
    console.error('PPTX Upload Error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload PPTX' });
  }
};

export const getImportedPpts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const imports = await prisma.importedPpt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(imports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch imported PPTs' });
  }
};
import AdmZip from 'adm-zip';
import axios from 'axios';

export const convertPptToPresentation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const id = req.params.id as string;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const importedPpt = await prisma.importedPpt.findFirst({
      where: { id, userId }
    });

    if (!importedPpt) {
      return res.status(404).json({ error: 'Imported PPT not found' });
    }

    // 1. Fetch the PPTX file from Cloudinary
    const response = await axios.get(importedPpt.fileUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data as any);

    // 2. Parse PPTX using AdmZip
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();
    
    // Find all slide files
    const slideEntries = zipEntries
      .filter(entry => entry.entryName.startsWith('ppt/slides/slide') && entry.entryName.endsWith('.xml'))
      .sort((a, b) => {
        const aNum = parseInt(a.entryName.match(/\d+/)?.[0] || '0');
        const bNum = parseInt(b.entryName.match(/\d+/)?.[0] || '0');
        return aNum - bNum;
      });

    const parsedSlides = slideEntries.map((entry, index) => {
      const content = entry.getData().toString('utf8');
      
      // Extract all text content using regex (looking for <a:t>Content</a:t>)
      const textMatches = content.match(/<a:t>([^<]+)<\/a:t>/g) || [];
      const cleanTexts = textMatches.map(m => m.replace(/<a:t>|<\/a:t>/g, ''));

      // Basic heuristic: first long text is title, others are bullets
      let title = cleanTexts[0] || `Slide ${index + 1}`;
      let bullets = cleanTexts.slice(1).filter(t => t.trim().length > 0);

      // If title is too long, it might be content
      if (title.length > 100 && bullets.length === 0) {
        bullets = [title];
        title = `Slide ${index + 1}`;
      }

      return {
        index,
        layout: index === 0 ? 'hero' : (bullets.length > 5 ? 'list' : 'content_list'),
        themeChoice: 'minimal-light',
        contentJSON: {
          title,
          subtitle: index === 0 ? bullets[0] || '' : '',
          bullets: index === 0 ? [] : bullets,
          alignment: 'left'
        }
      };
    });

    // 3. Create a new presentation with the parsed slides
    const presentation = await prisma.presentation.create({
      data: {
        userId,
        title: importedPpt.fileName.replace('.pptx', ''),
        slides: {
          create: parsedSlides.length > 0 ? parsedSlides : [
            {
              index: 0,
              layout: 'hero',
              contentJSON: {
                title: importedPpt.fileName.replace('.pptx', ''),
                subtitle: 'Imported Presentation (No text found)',
                alignment: 'center'
              }
            }
          ]
        }
      },
      include: {
        slides: true
      }
    });

    res.status(201).json(presentation);
  } catch (error: any) {
    console.error('PPT Conversion Error:', error);
    res.status(500).json({ error: error.message || 'Failed to convert PPT' });
  }
};
