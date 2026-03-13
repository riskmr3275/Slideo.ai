import { Request, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';
import { generatePresentationSlides } from '../services/aiService';

export const getTemplates = async (req: Request, res: Response) => {
  console.log('GET /api/templates request received');
  try {
    const templates = await (prisma as any).template.findMany({
      include: {
        slides: {
          orderBy: { index: 'asc' }
        }
      }
    });
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
};

export const getTemplateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const template = await (prisma as any).template.findUnique({
      where: { id },
      include: {
        slides: {
          orderBy: { index: 'asc' }
        }
      }
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
};

export const useTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { templateId, customization } = req.body;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const template = await (prisma as any).template.findUnique({
      where: { id: templateId },
      include: { slides: true }
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Create a presentation based on the template (editable copy with placeholder content)
    const presentation = await prisma.presentation.create({
      data: {
        userId,
        title: template.name,
        slides: {
          create: (template.slides as any[]).map((s: any) => ({
            index: s.index,
            layout: s.layout,
            contentJSON: s.contentJSON as any,
            themeChoice: customization?.themeId || template.themeId
          }))
        }
      },
      include: {
        slides: true
      }
    });

    res.status(201).json(presentation);
  } catch (error) {
    console.error('Error using template:', error);
    res.status(500).json({ error: 'Failed to create presentation from template' });
  }
};

export const updateTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, category, description, themeId } = req.body;

    const template = await (prisma as any).template.update({
      where: { id },
      data: {
        name,
        category,
        description,
        themeId
      }
    });

    res.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
};
