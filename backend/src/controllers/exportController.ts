import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import pptxgen from 'pptxgenjs';

const prisma = new PrismaClient();

export const exportToPptx = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  try {
    const presentation: any = await prisma.presentation.findUnique({
      where: { id },
      include: { slides: { orderBy: { index: 'asc' } } }
    });

    if (!presentation) {
      return res.status(404).json({ message: 'Presentation not found' });
    }

    const pptx = new pptxgen();
    pptx.title = presentation.title;

    presentation.slides.forEach((slide: any) => {
      const pptSlide = pptx.addSlide();
      const content = slide.contentJSON as any;

      // Handle Title
      pptSlide.addText(content.title || 'Untitled Slide', {
        x: 0.5, y: 0.5, w: '90%', h: 1,
        fontSize: 32, bold: true, color: '363636',
        align: 'center'
      });

      // Layout specific rendering
      switch (slide.layout) {
        case 'hero':
          if (content.subtitle) {
            pptSlide.addText(content.subtitle, {
              x: 0.5, y: 1.8, w: '90%', fontSize: 20, color: '666666', align: 'center'
            });
          }
          break;

        case 'bullet-slide':
        case 'list':
          const bullets = content.bullets || content.list || [];
          if (bullets.length > 0) {
            pptSlide.addText(
              bullets.map((b: string) => ({ text: b, options: { bullet: true, indentLevel: 0 } })),
              { x: 0.5, y: 2, w: '90%', fontSize: 18, color: '444444' }
            );
          }
          break;

        case 'card-grid':
        case 'stats':
          const items = content.cards || content.stats || [];
          items.forEach((item: any, idx: number) => {
            const xPos = 0.5 + (idx % 2) * 4.5;
            const yPos = 2 + Math.floor(idx / 2) * 2;
            pptSlide.addText(item.title || item.label || '', {
              x: xPos, y: yPos, w: 4, fontSize: 16, bold: true, color: '000000'
            });
            pptSlide.addText(item.description || item.value || '', {
              x: xPos, y: yPos + 0.5, w: 4, fontSize: 14, color: '666666'
            });
          });
          break;

        case 'quote':
          if (content.quote) {
            pptSlide.addText(`"${content.quote.text}"`, {
              x: 1, y: 2, w: 8, fontSize: 24, italic: true, align: 'center'
            });
            if (content.quote.author) {
              pptSlide.addText(`— ${content.quote.author}`, {
                x: 1, y: 3.5, w: 8, fontSize: 16, align: 'center'
              });
            }
          }
          break;

        default:
          if (content.description) {
            pptSlide.addText(content.description, {
              x: 0.5, y: 2, w: '90%', fontSize: 16, color: '333333'
            });
          }
      }
    });

    const buffer = await pptx.write({ outputType: 'nodebuffer' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${presentation.title.replace(/[^a-z0-9]/gi, '_')}.pptx"`);
    res.send(buffer);

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Failed to export presentation' });
  }
};
