import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy_key_if_not_set' });

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

    let layoutInstruction = `Slide Count: Exactly ${count} slides.`;
    if (advancedOptions?.requiredLayouts) {
      layoutInstruction = `CRITICAL: You MUST generate EXACTLY ${count} slides that map visually to these layouts in order: [${advancedOptions.requiredLayouts.join(', ')}]. Do not skip any. Use the blocks that best fit each required layout.`;
    }

    const prompt = `You are an advanced presentation design AI responsible for generating structured slides for a modern presentation editor similar to Gamma.app.

Your job is to generate visually balanced slides using block-based layouts.

Do not generate simple text slides.

---

SYSTEM CONTEXT

Slides are rendered using a block-based design engine.

Each slide is composed of visual blocks stacked vertically.

Supported blocks:
header, paragraph, cards, bullet-list, stats, steps, timeline, quote, image, chart

Each slide must contain at least TWO blocks.
Slides must visually fill the layout and avoid large empty spaces.

---

VISUAL DENSITY RULES

Slides must follow visual density rules:
• slides must include at least one visual block
• visual blocks include cards, stats, steps, bullet lists
• paragraphs should never appear alone

Bad slide example:
header
paragraph

Good slide example:
header
paragraph
cards

---

CARD GRID RULES

Card blocks must include layout hints.
Example:
{
"type":"cards",
"layout":"grid",
"columns":2,
"items":[
  {"icon":"zap", "title":"Performance", "description":"High performing teams focus... "}
]
}

Column rules:
4 cards → 2x2 grid
3 cards → 3 column grid
2 cards → 2 column grid

---

BULLET LIST RULES

Bullet lists must contain 4–6 items.
Example:
{
"type":"bullet-list",
"title":"Key Insights",
"items":[
  "Improves employee engagement",
  "Encourages innovation"
]
}

---

STATS BLOCK RULES

Stats blocks must contain 3–4 statistics.
Example:
{
"type":"stats",
"layout":"grid",
"columns":2,
"items":[
  {"value":"87%", "label":"Employee Retention", "description":"Strong culture improves retention."}
]
}

---

STEP BLOCK RULES

Steps blocks must contain sequential process information.
Example:
{
"type":"steps",
"layout":"horizontal",
"items":[
  {"title": "Define Vision", "description": "Establish clear values."}
]
}

---

VISUAL HIERARCHY

Slides must maintain hierarchy.
1. header (largest text)
2. subtitle or paragraph
3. visual content block

Never generate slides containing only text.

---

LAYOUT BALANCE

Slides must appear visually balanced.
Rules:
• combine text blocks with visual blocks
• avoid long paragraphs
• distribute content evenly

---

DYNAMIC INSTRUCTIONS FOR THIS GENERATION

Topic: "${topic}"
${layoutInstruction}
${toneInstruction}
${languageInstruction}
${contentDensity}
${imageStyleInstruction}

---

OUTPUT FORMAT

Return slides as structured JSON.
Example:

{
"slides":[
  {
    "blocks":[
      {
        "type":"header",
        "text":"Company Culture"
      },
      {
        "type":"paragraph",
        "text":"Understanding how culture shapes innovation and collaboration."
      },
      {
        "type":"cards",
        "layout":"grid",
        "columns":2,
        "items":[
          {
            "icon":"zap",
            "title":"Performance",
            "description":"High-performing teams focus on measurable outcomes."
          },
          {
            "icon":"brain",
            "title":"Innovation",
            "description":"Creative thinking drives long-term growth."
          },
          {
            "icon":"shield",
            "title":"Security",
            "description":"Strong security practices build trust."
          },
          {
            "icon":"users",
            "title":"Collaboration",
            "description":"Cross-team communication accelerates development."
          }
        ]
      }
    ]
  }
]
}

FINAL OBJECTIVE
Generate presentation slides that resemble visually rich slides created in Gamma.
Slides must:
• contain multiple blocks
• include visual blocks
• avoid plain text layouts
• provide layout hints for rendering engines`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.75,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Failed to generate content from Gemini');
    }

    // Clean up potential markdown formatting
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedJson = JSON.parse(cleanText);

    const rawSlides = Array.isArray(parsedJson.slides) ? parsedJson.slides : (Array.isArray(parsedJson) ? parsedJson : []);

    // Transform blocks back to layout mapped objects for the frontend
    const mappedSlides = rawSlides.map((slideObj: any, idx: number) => {
      let layout = 'hero';
      const contentJSON: any = {};
      const blocks = Array.isArray(slideObj.blocks) ? slideObj.blocks : [];

      let slideTheme = advancedOptions?.themeId || 'minimal-light';
      let familyThemes = [slideTheme];
      for (const themes of Object.values(PALETTE_FAMILIES)) {
        if (themes.includes(slideTheme)) {
          familyThemes = themes;
          break;
        }
      }
      const themeChoice = familyThemes[idx % familyThemes.length];

      for (const block of blocks) {
        if (!block || typeof block !== 'object') continue;
        
        if (block.type === 'header') {
          contentJSON.title = block.text;
        } else if (block.type === 'paragraph') {
          contentJSON.subtitle = block.text;
        } else if (block.type === 'cards') {
          // Process columns rule mapping
          if (block.columns === 2 || block.items?.length === 2 || block.items?.length === 4) {
             layout = 'card-grid'; // generic grid layout which handles 2x2
          } else if (block.columns === 3 || block.items?.length === 3) {
             layout = 'three-cards';
          } else {
             layout = 'card-grid';
          }
          contentJSON.cards = Array.isArray(block.items) ? block.items : [];
        } else if (block.type === 'bullet-list') {
          layout = 'bullet-slide';
          contentJSON.bullets = Array.isArray(block.items) ? block.items : [];
          if (block.title) contentJSON.title = block.title;
        } else if (block.type === 'stats') {
          layout = 'stats';
          contentJSON.stats = Array.isArray(block.items) ? block.items : [];
        } else if (block.type === 'steps') {
          layout = 'steps';
          contentJSON.steps = Array.isArray(block.items) ? block.items : [];
        } else if (block.type === 'timeline') {
          layout = 'timeline';
          contentJSON.timelineEvents = Array.isArray(block.items) ? block.items : [];
        } else if (block.type === 'quote') {
          layout = 'quote';
          contentJSON.quote = { text: block.text || '', author: block.author || '' };
        } else if (block.type === 'image') {
          layout = 'image-left'; 
        } else if (block.type === 'chart' || block.type === 'diagram') {
          layout = 'diagram';
          contentJSON.cards = Array.isArray(block.items) ? block.items : [];
        }
      }

      if (idx === 0) {
         layout = 'hero';
      }

      if (advancedOptions?.requiredLayouts && advancedOptions.requiredLayouts[idx]) {
        layout = advancedOptions.requiredLayouts[idx];
      }

      return {
        layout,
        themeChoice,
        contentJSON
      };
    });

    return mappedSlides;
  } catch (error) {
    console.error('Error generating presentation:', error);
    const fallbackCount = advancedOptions?.requiredLayouts ? advancedOptions.requiredLayouts.length : slideCount;
    const fallbackTheme = advancedOptions?.themeId || 'minimal-light';
    
    let familyThemes = [fallbackTheme];
    for (const themes of Object.values(PALETTE_FAMILIES)) {
      if (themes.includes(fallbackTheme)) {
        familyThemes = themes;
        break;
      }
    }

    return Array.from({ length: fallbackCount }).map((_, i) => {
      const layouts = ['hero', 'bullet-slide', 'card-grid', 'stats', 'steps', 'timeline', 'comparison', 'quote'];
      const layout = advancedOptions?.requiredLayouts 
        ? advancedOptions.requiredLayouts[i]
        : (i === 0 ? 'hero' : i === fallbackCount - 1 ? 'quote' : layouts[i % layouts.length]);
      
      const themeChoice = i === 0 
        ? fallbackTheme 
        : familyThemes[i % familyThemes.length];

      const content: any = {
        title: i === 0 ? topic : `Key Insight ${i}: Detailed Analysis`,
        subtitle: `In-depth exploration of ${topic} and its strategic implications for modern development.`,
      };

      if (['bullet-slide', 'list'].includes(layout)) {
        content.bullets = [
          'Comprehensive industry-leading analysis and reporting',
          'Strategic implementation of core principles',
          'Data-driven decision making for optimal performance',
          'User-centric design focus with accessibility in mind'
        ];
      }

      if (['card-grid', 'numbered-cards', 'diagram'].includes(layout)) {
        content.cards = [
          { icon: 'zap', title: 'Performance', description: 'Blazing fast load times.' },
          { icon: 'shield', title: 'Security', description: 'Enterprise-grade protection.' },
          { icon: 'brain', title: 'Intelligence', description: 'Advanced AI driven workflows.' },
          { icon: 'layout', title: 'Design', description: 'Premium aesthetics with focus.' }
        ];
      }

      if (layout === 'stats') {
        content.stats = [
          { value: '98%', label: 'Uptime', description: 'Guaranteed reliability.' },
          { value: '4.8/5', label: 'Satisfaction', description: 'Industry leader.' },
          { value: '12x', label: 'Growth', description: 'Scalable infrastructure.' }
        ];
      }

      if (['timeline', 'timelineEvents'].includes(layout)) {
        content.timelineEvents = [
          { date: 'Phase 1', title: 'Strategy', description: 'Core objective setting.' },
          { date: 'Phase 2', title: 'Execution', description: 'Iterative deployment cycle.' },
          { date: 'Phase 3', title: 'Optimization', description: 'Scaling and performance.' }
        ];
      }

      if (['steps', 'process-flow'].includes(layout)) {
        content.steps = [
          { title: 'Discovery', description: 'Deep dive into user needs.' },
          { title: 'Prototyping', description: 'Interactive design testing.' },
          { title: 'Launch', description: 'Full-scale market release.' }
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
          author: 'Steve Jobs'
        };
      }

      return { layout, themeChoice, contentJSON: content };
    });
  }
};
