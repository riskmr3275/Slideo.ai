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
  advancedOptions?: { tone?: string; language?: string; textContentAmount?: string }
) => {
  try {
    const toneInstruction = advancedOptions?.tone ? `Tone: ${advancedOptions.tone}.` : 'Tone: professional and informative.';
    const languageInstruction = advancedOptions?.language ? `Language: ${advancedOptions.language}.` : 'Language: English.';

    const contentDensity = advancedOptions?.textContentAmount === 'minimal'
      ? 'Keep content brief (1-sentence descriptions, 3 items minimum).'
      : advancedOptions?.textContentAmount === 'detailed'
        ? 'Include rich detail (2–3 sentences, 4–5 items per slide).'
        : 'Use moderate content (1–2 sentences, 3–4 items per slide).';

    const prompt = `You are an expert AI presentation architect. Your task is to generate ${slideCount} professional presentation slides about: "${topic}".

${toneInstruction}
${languageInstruction}
${contentDensity}

═══════════════════════════════════════════
STEP 1 — PALETTE SELECTION (CRITICAL RULE)
═══════════════════════════════════════════
Pick ONE palette family for the entire presentation. All slides must use themes from this ONE family only.

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
STEP 3 — CONTENT QUALITY RULES
═══════════════════════════════
- Titles: 3–7 words, punchy and specific (NOT generic like "Introduction" or "Overview")
- Subtitles: 1 complete sentence of context (max 15 words)
- Bullets: Each bullet is a complete sentence or concept. Minimum 3 bullets, max 7.
- Cards: Each card has a clear short title (2–4 words) and 1–2 sentence description.
- Stats: Values must be realistic for the topic (use approximations like "90%" not just "HIGH")
- Timeline events: Must be in chronological order with real or plausible dates
- Steps: Each step is an actionable verb phrase. Min 3, max 5 steps.
- ComparisonItems: Min 3 rows, max 5 rows.

CONTENT RULES BY LAYOUT:
- hero: title (bold statement), subtitle (1-sentence context), NO cards/bullets
- bullet-slide: title + subtitle + bullets (min 3, max 6)
- card-grid: title + subtitle + cards (3–4 items with icon, title, description)  
- numbered-cards: title + subtitle + cards (3–5 items, ordered by importance)
- stats: title + subtitle + stats (3–4 items with realistic values)
- timeline: title + subtitle + timelineEvents (3–5 items in order)
- steps: title + subtitle + steps (3–5 items in sequence)
- comparison: title + subtitle + comparisonItems + leftLabel + rightLabel (3–5 rows)
- quote: title + quote (text + author)
- section-title: title + subtitle only
- diagram: title + subtitle + cards (3–5 items as flow nodes)

Generate ${slideCount} slides now as a JSON array. Each slide: { layout, themeChoice, contentJSON }.`;

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
    return Array.from({ length: slideCount }).map((_, i) => {
      const layouts = ['hero', 'bullet-slide', 'card-grid', 'stats', 'steps', 'timeline', 'comparison', 'quote'];
      const layout = i === 0 ? 'hero' : i === slideCount - 1 ? 'quote' : layouts[i % layouts.length];
      return {
        layout,
        themeChoice: i === 0 ? 'midnight-dark' : i % 2 === 0 ? 'obsidian' : 'abyss',
        contentJSON: {
          title: i === 0 ? topic : `Section ${i}: Key Insights`,
          subtitle: 'Core concepts and analysis',
          bullets:
            layout === 'bullet-slide'
              ? [
                  'First key principle to understand',
                  'Second important consideration',
                  'Third strategic recommendation',
                ]
              : undefined,
          cards:
            layout === 'card-grid' || layout === 'numbered-cards'
              ? [
                  { icon: 'zap', title: 'Core Concept', description: 'The fundamental principle driving this topic.' },
                  { icon: 'brain', title: 'Key Insight', description: 'A critical insight derived from analysis.' },
                  { icon: 'shield', title: 'Best Practice', description: 'Recommended approach for implementation.' },
                ]
              : undefined,
          stats:
            layout === 'stats'
              ? [
                  { value: '85%', label: 'Efficiency Gain', description: 'Measured improvement in performance' },
                  { value: '3x', label: 'ROI', description: 'Return on investment ratio' },
                  { value: '40%', label: 'Cost Reduction', description: 'Operational cost savings' },
                ]
              : undefined,
          quote:
            layout === 'quote'
              ? { text: 'The best way to predict the future is to create it.', author: 'Peter Drucker, Management Consultant' }
              : undefined,
        },
      };
    });
  }
};
