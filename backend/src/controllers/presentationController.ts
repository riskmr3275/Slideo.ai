import { Request, Response } from 'express';
import { prisma } from '../index';
import { generatePresentationSlides } from '../services/aiService';
import { AuthRequest } from '../middleware/auth';

export const createPresentation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { topic, slideCount, tone, language, textContentAmount, themeId, imageStyle, templateId, slides } = req.body;

    if (!topic && !slides) {
      return res.status(400).json({ error: 'Topic or manual slides are required' });
    }

    let finalSlides = [];
    let requiredLayouts: string[] | undefined = undefined;

    if (templateId) {
      const template = await (prisma as any).template.findUnique({
        where: { id: templateId },
        include: { slides: { orderBy: { index: 'asc' } } }
      });
      if (template) {
        requiredLayouts = template.slides.map((s: any) => s.layout);
      }
    }

    if (slides && Array.isArray(slides)) {
      // Manual path (Templates)
      finalSlides = slides;
    } else {
      // AI generation path
      const count = requiredLayouts ? requiredLayouts.length : (parseInt(slideCount as string, 10) || 5);
      const advancedOptions = {
        tone: tone as string | undefined,
        language: language as string | undefined,
        textContentAmount: textContentAmount as string | undefined,
        themeId: themeId as string | undefined,
        imageStyle: imageStyle as string | undefined,
        requiredLayouts
      };
      finalSlides = await generatePresentationSlides(topic, count, advancedOptions);
    }

    // Save to DB
    const presentation = await prisma.presentation.create({
      data: {
        userId,
        title: topic || 'New Presentation',
        slides: {
          create: finalSlides.map((slide: any, index: number) => ({
            index: slide.index !== undefined ? slide.index : index,
            layout: slide.layout || 'hero',
            contentJSON: slide.contentJSON || {},
            themeChoice: slide.themeChoice || undefined
          })),
        },
      },
      include: {
        slides: {
          orderBy: { index: 'asc' },
        },
      },
    });

    // Increment usage count
    await prisma.user.update({
      where: { id: userId },
      data: {
        presentationsCreatedThisMonth: {
          increment: 1,
        },
      },
    });

    res.status(201).json(presentation);
  } catch (error) {
    console.error('Error creating presentation:', error);
    res.status(500).json({ error: 'Failed to create presentation' });
  }
};

export const generateSingleSlide = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { topic, tone, language, textContentAmount } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required to generate a slide' });
    }

    const advancedOptions = {
      tone: tone as string | undefined,
      language: language as string | undefined,
      textContentAmount: textContentAmount as string | undefined
    };

    // Generate exactly 1 slide using Gemini
    const generatedSlides = await generatePresentationSlides(topic, 1, advancedOptions);

    if (!generatedSlides || generatedSlides.length === 0) {
       return res.status(500).json({ error: 'Failed to generate slide content' });
    }

    // Return the generated JSON structure back to the frontend to handle saving
    res.status(200).json({ slide: generatedSlides[0] });
  } catch (error) {
    console.error('Error generating single slide:', error);
    res.status(500).json({ error: 'Failed to generate slide' });
  }
};

export const getUserPresentations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const presentations = await prisma.presentation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        _count: { select: { slides: true } }
      }
    });

    res.json(presentations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch presentations' });
  }
};

export const getPresentationById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const presentation = await prisma.presentation.findUnique({
      where: { id: id as string },
      include: {
        slides: {
          orderBy: { index: 'asc' },
        },
      },
    });

    if (!presentation) {
      return res.status(404).json({ error: 'Presentation not found' });
    }

    if (presentation.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(presentation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch presentation' });
  }
};

export const updatePresentation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const id = req.params.id as string;
    const { title, slides } = req.body;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Ensure the presentation belongs to the user
    const existing = await prisma.presentation.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Presentation not found' });
    }

    if (existing.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Use a transaction to delete existing slides and insert new ones
    // since the slide indices/layouts can change arbitrarily over time
    const updatedPresentation = await prisma.$transaction(async (tx) => {
      // Update presentation title
      const pres = await tx.presentation.update({
        where: { id },
        data: { title }
      });

      // Clear all existing slides
      await tx.slide.deleteMany({
        where: { presentationId: id }
      });

      // Create the new slides safely
      if (slides && slides.length > 0) {
        await tx.slide.createMany({
          data: slides.map((slide: any) => ({
             presentationId: id,
             index: slide.index,
             layout: slide.layout || 'content_list',
             contentJSON: slide.contentJSON || {},
             themeChoice: slide.themeChoice || null
          }))
        });
      }

      return pres;
    });

    res.json(updatedPresentation);
  } catch (error) {
    console.error('Error auto-saving presentation:', error);
    res.status(500).json({ error: 'Failed to update presentation' });
  }
};

export const deletePresentation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const id = req.params.id as string;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const presentation = await prisma.presentation.findUnique({
      where: { id }
    });

    if (!presentation) {
      return res.status(404).json({ error: 'Presentation not found' });
    }

    if (presentation.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.slide.deleteMany({
        where: { presentationId: id }
      });
      await tx.presentation.delete({
        where: { id }
      });
    });

    res.status(200).json({ message: 'Presentation deleted successfully' });
  } catch (error) {
    console.error('Error deleting presentation:', error);
    res.status(500).json({ error: 'Failed to delete presentation' });
  }
};
