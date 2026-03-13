import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const templates = [
  {
    name: 'Startup Pitch Deck',
    category: 'Business',
    description: 'A perfect structure for pitching your next big idea with investor-ready slides.',
    themeId: 'executive',
  },
  {
    name: 'Marketing Strategy',
    category: 'Marketing',
    description: 'Grow your brand with this strategic layout covering market analysis to execution.',
    themeId: 'sunset-gradient',
  },
  {
    name: 'Educational Lesson',
    category: 'Education',
    description: 'Engage students with clear, visual slides designed for academic excellence.',
    themeId: 'emerald-gradient',
  },
  {
    name: 'Product Launch',
    category: 'Creative',
    description: 'Showcase your new product with style, highlighting features and user benefits.',
    themeId: 'cyber-pink',
  },
  {
    name: 'Annual Report',
    category: 'Internal',
    description: 'Data-driven slides for your yearly summary, perfect for board meetings.',
    themeId: 'corporate-blue',
  },
  {
    name: 'Project Proposal',
    category: 'Projects',
    description: 'Win your next project with this professional template outlining scope and impact.',
    themeId: 'slate-light',
  },
  {
    name: 'Creative Portfolio',
    category: 'Creative',
    description: 'Perfect for designers and artists to showcase their best work beautifully.',
    themeId: 'lavender-haze',
  },
  {
    name: 'Conference Talk',
    category: 'Event',
    description: 'Highly visual slides for public speaking that keep your audience engaged.',
    themeId: 'midnight-city',
  },
  {
    name: 'Quarterly Business Review',
    category: 'Corporate',
    description: 'Keep your team aligned on goals and metrics with this comprehensive review.',
    themeId: 'obsidian',
  },
  {
    name: 'Project Post-Mortem',
    category: 'Corporate',
    description: 'Analyze successes, challenges, and key takeaways from your latest project.',
    themeId: 'obsidian',
  },
  {
    name: 'Sales Deck',
    category: 'Sales',
    description: 'High-converting slides for sales professionals to close deals effectively.',
    themeId: 'gold-rush',
  },
  {
    name: 'Tech Roadmap',
    category: 'Engineering',
    description: 'Visualize your product evolution and engineering milestones for the team.',
    themeId: 'neon-blue',
  },
  {
    name: 'Customer Case Study',
    category: 'Marketing',
    description: 'Showcase how you solved a real-world problem for a client with detailed insights.',
    themeId: 'pearl',
  },
  {
    name: 'Company Culture',
    category: 'Internal',
    description: 'Onboard new hires or share your values with the world in a clear way.',
    themeId: 'mint-tea',
  }
];

const layouts = ['hero', 'stats', 'three-cards', 'image-right', 'timeline', 'list', 'comparison', 'four-grid', 'steps', 'quote', 'basic-text', 'grid'];

async function main() {
  console.log('Start seeding templates...');

  await prisma.templateSlide.deleteMany();
  await prisma.template.deleteMany();

  for (const t of templates) {
    const template = await prisma.template.create({
      data: {
        name: t.name,
        category: t.category,
        description: t.description,
        themeId: t.themeId,
      }
    });

    const slides = [];
    for (let i = 0; i < 15; i++) {
        let layout = layouts[i % layouts.length];
        if (i === 0) layout = 'hero';
        
        const contentJSON: any = {
            title: `${t.name} - Section ${i + 1}`,
            subtitle: `Detailed content for slide ${i + 1} of the ${t.name} template.`,
            alignment: 'left'
        };

        if (layout === 'stats') {
            contentJSON.stats = [{ value: '99%', label: 'Efficiency', description: 'Significant improvement found.' }];
        } else if (layout === 'three-cards' || layout === 'four-grid') {
            contentJSON.cards = [
                { title: 'Feature A', description: 'Core functionality details' },
                { title: 'Feature B', description: 'Performance metrics' },
                { title: 'Feature C', description: 'User experience' },
                { title: 'Feature D', description: 'Scalability' }
            ];
        } else if (layout === 'timeline') {
            contentJSON.timeline = [
                { date: 'Phase 1', title: 'Conceptualization', description: 'Ideation and planning' },
                { date: 'Phase 2', title: 'Development', description: 'Core build out' },
                { date: 'Phase 3', title: 'Launch', description: 'Market entry' }
            ];
        } else if (layout === 'list') {
            contentJSON.list = ['Introduction to concepts', 'Core methodology', 'Findings and results', 'Future implications'];
        }

        slides.push({
            templateId: template.id,
            layout,
            contentJSON,
            index: i
        });
    }

    await prisma.templateSlide.createMany({
        data: slides
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
