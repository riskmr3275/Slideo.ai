import { GoogleGenAI, Type, Schema } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy_key_if_not_set' });

const responseSchema: Schema = {
  type: Type.ARRAY,
  description: 'List of presentation slides matching the structured slide design system',
  items: {
    type: Type.OBJECT,
    properties: {
      layout: {
        type: Type.STRING,
        description:
          'Slide layout type: hero | section-title | bullet-slide | card-grid | numbered-cards | timeline | steps | comparison | stats | quote | diagram',
      },
      themeChoice: {
        type: Type.STRING,
        description:
          'Theme name from the approved theme palette list. Must stay within the chosen palette family for the whole presentation.',
      },
      contentJSON: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          subtitle: { type: Type.STRING },

          // bullet-slide layout
          bullets: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Array of bullet point strings. Used for bullet-slide layout. Minimum 3 items.',
          },

          // card-grid, numbered-cards, diagram layouts
          cards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                icon: { type: Type.STRING, description: 'Lucide icon name (lowercase-kebab): e.g. zap, brain, shield' },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
              },
            },
            description: 'Array of cards. Use 3–4 items for card-grid. Use 3–5 for numbered-cards or diagram.',
          },

          // stats layout
          stats: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                value: { type: Type.STRING, description: 'The stat number or metric, e.g. "94%", "$2.4M", "3x"' },
                label: { type: Type.STRING, description: 'Short label for the stat, e.g. "Accuracy"' },
                description: { type: Type.STRING, description: 'One-sentence explanation of the stat' },
              },
            },
            description: 'Array of statistics. Use 3–4 items.',
          },

          // timeline layout
          timelineEvents: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING, description: 'Date, year, or phase label, e.g. "2021", "Phase 1", "Q3"' },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
              },
            },
            description: 'Array of timeline events ordered chronologically. Use 3–5 items.',
          },

          // steps layout
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
              },
            },
            description: 'Array of sequential process steps. Use 3–5 items.',
          },

          // comparison layout
          comparisonItems: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                left: { type: Type.STRING, description: 'A pros/advantages/option-A point' },
                right: { type: Type.STRING, description: 'A cons/disadvantages/option-B point' },
              },
            },
            description: 'Array of comparison rows with left (pros/option A) and right (cons/option B) text. Use 3–5 rows.',
          },

          // comparison column headers
          leftLabel: {
            type: Type.STRING,
            description: 'Header for the left comparison column, e.g. "Advantages", "Option A", "Traditional"',
          },
          rightLabel: {
            type: Type.STRING,
            description: 'Header for the right comparison column, e.g. "Disadvantages", "Option B", "Modern"',
          },

          // quote layout
          quote: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: 'The quotation text (1–3 sentences max)' },
              author: { type: Type.STRING, description: 'Author name and title, e.g. "Alan Turing, Computer Scientist"' },
            },
          },
        },
        required: ['title'],
      },
    },
    required: ['layout', 'themeChoice', 'contentJSON'],
  },
};

// Palette families for consistent theming across slides
const PALETTE_FAMILIES: Record<string, string[]> = {
  'dark-formal': ['midnight-dark', 'obsidian', 'blackout', 'abyss', 'dark-knight', 'carbon', 'midnight-city'],
  'light-professional': ['minimal-light', 'slate-light', 'cool-light', 'warm-light', 'corporate-blue', 'pearl', 'silver'],
  'gradient-vibrant': ['purple-gradient', 'ocean-gradient', 'emerald-gradient', 'neon-blue', 'executive', 'electric-violet'],
  'pastel-friendly': ['lavender-haze', 'mint-tea', 'gold-rush', 'aurora', 'peach-fuzz', 'rose-water', 'spring'],
  'cinematic-dark': ['royal-velvet', 'blood-moon', 'galaxy', 'space-dust', 'retrowave', 'sunset-gradient'],
};

export const generatePresentationSlides = async (
  topic: string,
  slideCount: number = 5,
  advancedOptions?: { 
    tone?: string; 
    language?: string; 
    textContentAmount?: string;
    themeId?: string;
    imageStyle?: string;
    requiredLayouts?: string[];
  }
) => {
  try {
    const toneInstruction = advancedOptions?.tone ? `Tone: ${advancedOptions.tone}.` : 'Tone: professional and informative.';
    const languageInstruction = advancedOptions?.language ? `Language: ${advancedOptions.language}.` : 'Language: English.';

    const count = advancedOptions?.requiredLayouts ? advancedOptions.requiredLayouts.length : slideCount;

    const contentDensity = advancedOptions?.textContentAmount === 'minimal'
      ? 'Keep content brief (1-sentence descriptions, 3 items minimum).'
      : advancedOptions?.textContentAmount === 'detailed'
        ? 'Include rich detail (2–3 sentences, 4–5 items per slide).'
        : 'Use moderate content (1–2 sentences, 3–4 items per slide).';

    const imageStyleInstruction = advancedOptions?.imageStyle 
      ? `Visual Style for images: ${advancedOptions.imageStyle}. Describe images that fit this aesthetic.`
      : '';

    // Determine palette family and force theme if requested
    let paletteFamilyInstruction = '';
    let forceThemeInstruction = '';

    if (advancedOptions?.themeId) {
      const themeId = advancedOptions.themeId;
      let family = 'light-professional'; // Default
      for (const [fname, themes] of Object.entries(PALETTE_FAMILIES)) {
        if (themes.includes(themeId)) {
          family = fname;
          break;
        }
      }
      
      paletteFamilyInstruction = `CRITICAL: You MUST use the "${family}" palette family only.`;
      forceThemeInstruction = `The user has specifically selected the theme "${themeId}". You MUST use "${themeId}" for the FIRST slide (hero) and primarily use it or very close variations from the same family for other slides.`;
    }

    let layoutInstruction = `Generate ${count} slides.`;
    if (advancedOptions?.requiredLayouts) {
      layoutInstruction = `CRITICAL: You MUST generate EXACTLY ${count} slides with the following layouts in this EXACT order: [${advancedOptions.requiredLayouts.join(', ')}]. Do not skip or change any.`;
    }

    const prompt = `You are an expert AI presentation architect. Your task is to generate professional presentation slides about: "${topic}".

${layoutInstruction}
${toneInstruction}
${languageInstruction}
${contentDensity}
${imageStyleInstruction}

═══════════════════════════════════════════
STEP 1 — PALETTE SELECTION (CRITICAL RULE)
═══════════════════════════════════════════
${paletteFamilyInstruction || 'Pick ONE palette family for the entire presentation. All slides must use themes from this ONE family only.'}
${forceThemeInstruction}

PALETTE FAMILIES (pick exactly one):
- dark-formal: midnight-dark, obsidian, blackout, abyss, dark-knight, carbon, midnight-city
- light-professional: minimal-light, slate-light, cool-light, warm-light, corporate-blue, pearl, silver
- gradient-vibrant: purple-gradient, ocean-gradient, emerald-gradient, neon-blue, executive, electric-violet
- pastel-friendly: lavender-haze, mint-tea, gold-rush, aurora, peach-fuzz, rose-water, spring
- cinematic-dark: royal-velvet, blood-moon, galaxy, space-dust, retrowave, sunset-gradient

Guidelines for picking:
- Academic/Research/Science → dark-formal or gradient-vibrant
- Business/Finance/Corporate → light-professional
- Creative/Startup/Product → gradient-vibrant or pastel-friendly
- Health/Wellness → pastel-friendly or light-professional
- Technology/AI/Future → dark-formal or gradient-vibrant

You MAY vary the specific theme within the family for visual interest, for example:
  Slide 1 (hero) → midnight-dark
  Slide 2 (section) → abyss
  Slide 3 (cards) → obsidian
  Slide 4 (stats) → dark-knight
DO NOT mix families (e.g., do NOT use midnight-dark on one slide and lavender-haze on another).

═══════════════════════════════
STEP 2 — LAYOUT SELECTION RULES
═══════════════════════════════
Choose the BEST layout for each section's content:

| Situation | Layout to use |
|-----------|--------------|
| Opening slide | hero |
| Major section transition | section-title |
| 3–4 key concepts or features | card-grid |
| Numbered list of items (prioritized) | numbered-cards |
| Long explanation or key points list | bullet-slide |
| Sequential process or workflow | steps |
| Historical events or roadmap | timeline |
| Pros vs cons or A vs B | comparison |
| Key metrics or KPIs | stats |
| Single impactful quote or insight | quote |
| System architecture or flow diagram | diagram |
| Closing slide | hero |

Presentation structure rules:
- FIRST slide MUST be "hero" layout
- LAST slide should be "hero" or "quote" layout  
- Space out layouts — do not repeat the same layout consecutively (except hero at start/end)
- Aim for variety across the ${slideCount} slides
- Include at least one stats slide if topic has any metrics or numbers
- Include steps or timeline if topic has any process or history

═══════════════════════════════
STEP 3 — SLIDE TYPE CLASSIFIER (ARCHITECTURAL)
═══════════════════════════════
Follow these exact rules to select the layout for each slide:
- If slide contains a bold introduction or opening → hero
- If slide contains statistics or numerical metrics → stats
- If slide contains multiple key concepts or features → card-grid
- If slide contains a prioritized list → numbered-cards
- If slide contains sequential steps or a process → steps
- If slide contains chronological events → timeline
- If slide contains data comparisons → comparison
- If slide contains a high-impact quote → quote
- If slide contains a conceptual overview with multiple points → card-grid
- Default for simple text lists → bullet-slide

═══════════════════════════════
STEP 4 — CONTENT QUALITY & STRUCTURING (MANDATORY)
═══════════════════════════════
- EVERY slide must be "visually full" as per Gamma/Canva standards.
- bullet-slide: Exactly 4-6 rich bullet points.
- card-grid: Exactly 4 items (each with icon, title, 15-25 word description).
- stats: Exactly 4 distinct metrics with realistic numerical values and context.
- steps: Exactly 4 sequential steps with clear instructions.
- timeline: Exactly 4 chronological milestones.
- comparison: Exactly 4 rows comparing "Feature", "Benefit", or "Outcome".
- ALL Descriptions must be full, professional sentences. No fragments.

Generate ${slideCount} slides now as a JSON array. Each slide object: { layout, contentJSON }.`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema,
        temperature: 0.75,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Failed to generate content from Gemini');
    }

    // Clean up potential markdown formatting if the model disobeys
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedJson = JSON.parse(cleanText);

    return Array.isArray(parsedJson) ? parsedJson : [];
  } catch (error) {
    console.error('Error generating presentation:', error);
    // Fallback to structured mock data
    const fallbackCount = advancedOptions?.requiredLayouts ? advancedOptions.requiredLayouts.length : slideCount;
    const fallbackTheme = advancedOptions?.themeId || 'minimal-light';
    
    // Find family for fallback variations if themeId isn't the only one we want to use
    let familyThemes = [fallbackTheme];
    for (const themes of Object.values(PALETTE_FAMILIES)) {
      if (themes.includes(fallbackTheme)) {
        familyThemes = themes;
        break;
      }
    }

    return Array.from({ length: fallbackCount }).map((_, i) => {
      const layouts = ['hero', 'bullet-slide', 'card-grid', 'stats', 'steps', 'timeline', 'comparison', 'quote', 'three-cards', 'four-grid', 'diagram', 'numbered-cards'];
      const layout = advancedOptions?.requiredLayouts 
        ? advancedOptions.requiredLayouts[i]
        : (i === 0 ? 'hero' : i === fallbackCount - 1 ? 'quote' : layouts[i % layouts.length]);
      
      const themeChoice = i === 0 
        ? fallbackTheme 
        : familyThemes[i % familyThemes.length];

      // Robust mock data for ANY layout
      const content: any = {
        title: i === 0 ? topic : `Key Insight ${i}: Detailed Analysis`,
        subtitle: `In-depth exploration of ${topic} and its strategic implications for modern development.`,
      };

      if (layout === 'bullet-slide' || layout === 'list' || layout === 'bullets') {
        content.bullets = [
          'Comprehensive industry-leading analysis and reporting',
          'Strategic implementation of core principles and values',
          'Data-driven decision making for optimal performance',
          'User-centric design focus with accessibility in mind'
        ];
      }

      if (['card-grid', 'three-cards', 'four-grid', 'numbered-cards', 'diagram', 'grid'].includes(layout)) {
        content.cards = [
          { icon: 'zap', title: 'Performance', description: 'Blazing fast load times and optimized runtime efficiency.' },
          { icon: 'shield', title: 'Security', description: 'Enterprise-grade protection and deep security auditing.' },
          { icon: 'brain', title: 'Intelligence', description: 'Advanced AI driven workflows and predictive analytics.' },
          { icon: 'layout', title: 'Design', description: 'Premium aesthetics with focus on user engagement and conversion.' }
        ];
      }

      if (layout === 'stats') {
        content.stats = [
          { value: '98%', label: 'Uptime', description: 'Guaranteed reliability for mission critical systems.' },
          { value: '4.8/5', label: 'Satisfaction', description: 'Consistently rated as the industry leader.' },
          { value: '12x', label: 'Growth', description: 'Scalable infrastructure for exponential success.' }
        ];
      }

      if (layout === 'timeline' || layout === 'timelineEvents') {
        content.timelineEvents = [
          { date: 'Phase 1', title: 'Strategy', description: 'Core objective setting and market research phase.' },
          { date: 'Phase 2', title: 'Execution', description: 'Rapid development and iterative deployment cycle.' },
          { date: 'Phase 3', title: 'Optimization', description: 'Scaling and performance tuning for global reach.' }
        ];
      }

      if (layout === 'steps' || layout === 'process-flow') {
        content.steps = [
          { title: 'Discovery', description: 'Deep dive into user needs and project requirements.' },
          { title: 'Prototyping', description: 'Rapid wireframing and interactive design testing.' },
          { title: 'Launch', description: 'Final verification and full-scale market release.' }
        ];
      }

      if (layout === 'comparison') {
        content.leftLabel = 'Traditional';
        content.rightLabel = 'Next-Gen';
        content.comparisonItems = [
          { left: 'Manual processes', right: 'AI-automated workflows' },
          { left: 'Static reporting', right: 'Interactive real-time dashboards' },
          { left: 'Fragmented tools', right: 'Unified all-in-one ecosystem' }
        ];
      }

      if (layout === 'quote') {
        content.quote = {
          text: 'Innovation distinguishes between a leader and a follower.',
          author: 'Steve Jobs, Co-founder of Apple'
        };
      }

      return { layout, themeChoice, contentJSON: content };
    });
  }
};
