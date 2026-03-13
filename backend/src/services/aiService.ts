import { GoogleGenAI, Type, Schema } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy_key_if_not_set' });

const responseSchema: Schema = {
  type: Type.ARRAY,
  description: "List of presentation slides matching the anti-gravity layout system",
  items: {
    type: Type.OBJECT,
    properties: {
      layout: {
        type: Type.STRING,
        description: "Layout structure: hero, section, basic-text, list, two-column, three-cards, four-grid, timeline, steps, comparison, stats, quote, image-left, image-right",
      },
      contentJSON: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Main slide title" },
          subtitle: { type: Type.STRING, description: "Optional slide subtitle" },
          grid: { type: Type.STRING, description: "Grid instructions, e.g., '3-column', '2x2-grid'" },
          alignment: { type: Type.STRING, description: "General alignment, e.g., 'center', 'left'" },
          spacing: { type: Type.STRING, description: "Spacing rules, e.g., 'equal', 'balanced'" },
          animation: { type: Type.STRING, description: "Animation style: fade-in, slide-up, zoom-in, stagger, float" },
          themeChoice: { type: Type.STRING, description: "Dynamic visually stunning layout background theme (MUST be chosen per slide)" },
          imageQuery: { type: Type.STRING, description: "Search keyword for image if needed" },
          cards: {
            type: Type.ARRAY,
            description: "List of visual components for the layout",
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                icon: { type: Type.STRING, description: "Lucide icon keyword, e.g., brain, cpu, lock, globe, activity" }
              },
              required: ["title", "description"]
            }
          },
          stats: {
            type: Type.ARRAY,
            description: "List of statistics for the slide",
            items: {
              type: Type.OBJECT,
              properties: {
                value: { type: Type.STRING },
                label: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["value", "label", "description"]
            }
          },
          steps: {
            type: Type.ARRAY,
            description: "List of sequential steps",
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["title", "description"]
            }
          },
          list: {
            type: Type.ARRAY,
            description: "List of bullet point strings for the list layout",
            items: { type: Type.STRING }
          },
          quote: {
            type: Type.OBJECT,
            description: "A highlighted quote or key insight",
            properties: {
              text: { type: Type.STRING },
              author: { type: Type.STRING }
            }
          }
        },
        required: ["title", "subtitle", "themeChoice"],
      },
    },
    required: ["layout", "contentJSON"],
  },
};

export const generatePresentationSlides = async (
  topic: string,
  slideCount: number = 5,
  advancedOptions?: { tone?: string; language?: string; textContentAmount?: string }
) => {
  try {
    let prompt = `You are an expert presentation content writer and slide architecture engine.

Your task is to generate ${slideCount} slides about: "${topic}".
${advancedOptions?.tone ? `Tone: ${advancedOptions.tone}.` : ''}
${advancedOptions?.language ? `Language: ${advancedOptions.language}.` : ''}

===== CONTENT WRITING GUIDELINES =====

Every slide MUST follow this professional structure:

1. TITLE — Short, descriptive, and clear (under 8 words)
2. SUBTITLE — A 1–2 sentence explanation of what this slide covers
3. CONTENT — Choose the most appropriate layout for the information:
   • For key concepts use cards with a title, icon, and 1-sentence description
   • For processes/steps use a numbered steps layout
   • For data and KPIs use stats layout
   • For comparisons use comparison layout
   • For quotes or highlights use quote layout
   • For standard bullet points use list layout (3–5 items, concise)

WRITING STYLE:
• Titles: Short and descriptive — like a newspaper headline
• Subtitles: 1–2 sentences that introduce or contextualize the slide
• Bullet points / descriptions: Concise, easy to read, no fluff
• Use 3–5 bullet points or cards per slide depending on topic
• Avoid long paragraphs — this is a SLIDE, not an essay
• Write for clarity, structure, and visual readability
${advancedOptions?.textContentAmount ? `• TEXT DENSITY: "${advancedOptions.textContentAmount}" — ${
  advancedOptions.textContentAmount === 'Minimal' ? 'Keywords only, very few words per point' :
  advancedOptions.textContentAmount === 'Concise' ? 'Short punchy sentences, 5–10 words each' :
  advancedOptions.textContentAmount === 'Detailed' ? 'Full sentences with clear explanation' :
  'Rich, exhaustive content with full context and depth'
}` : '• TEXT DENSITY: Concise — short, clear sentences of 5–10 words each'}

===== SLIDE DESIGN RULES =====

Design slides like modern AI-powered presentations (Gamma / Beautiful.ai style):
• Strong typography hierarchy (large title, smaller subtitle, structured content)
• Minimal text per visual unit — one idea per card/bullet
• Balanced whitespace and visual grouping
• Grid-based layouts with consistent spacing
• Use section slides to divide major topic areas

===== LAYOUT SELECTION GUIDE =====
hero        → Opening slide, title + compelling subtitle (no cards)
section     → Topic divider, bold title only
basic-text  → Heavy text / analysis slide
list        → 3–5 bullet points
two-column  → Two contrasting columns of content
three-cards → 3 key features/concepts with icons
four-grid   → 4 items in a 2×2 grid
timeline    → Chronological events or history
steps       → Sequential process (numbered steps)
comparison  → Side-by-side comparison of 2 options
stats       → Key metrics and numbers
quote       → Highlighted quote / key insight
image-left  → Visual on left, text on right
image-right → Text on left, visual on right

===== THEME SELECTION =====
Pick a visually stunning theme per slide from:
minimal-light, slate-light, warm-light, cool-light,
midnight-dark, blackout, purple-gradient, ocean-gradient,
sunset-gradient, emerald-gradient, cyber-pink, neon-blue,
obsidian, gold-rush, lavender-haze, mint-tea, royal-velvet, aurora

Use dark/gradient themes for impact slides (opening, stats, quotes).
Use light themes for content-heavy or analytical slides.

===== EXAMPLE SLIDE (list layout) =====
{
  "layout": "list",
  "contentJSON": {
    "title": "Problem Statement",
    "subtitle": "Air pollution forecasting is challenging due to complex environmental patterns and large datasets.",
    "themeChoice": "midnight-dark",
    "list": [
      "Manual model tuning requires significant time and expertise",
      "Single optimization methods often get stuck in local minima",
      "Neural architecture search space is extremely large",
      "Training thousands of models demands high computational cost"
    ]
  }
}

===== EXAMPLE SLIDE (three-cards layout) =====
{
  "layout": "three-cards",
  "contentJSON": {
    "title": "Core Benefits",
    "subtitle": "Our solution delivers three transformative outcomes for organizations.",
    "themeChoice": "purple-gradient",
    "grid": "3-column",
    "alignment": "center",
    "cards": [
      { "title": "Speed", "description": "Reduces training time by 80% with parallel optimization", "icon": "zap" },
      { "title": "Accuracy", "description": "Achieves state-of-the-art results on benchmark datasets", "icon": "target" },
      { "title": "Scalability", "description": "Scales to any size dataset without architecture changes", "icon": "trending-up" }
    ]
  }
}

===== OUTPUT REQUIREMENT =====
Return ONLY a raw JSON array with exactly ${slideCount} slide objects.
DO NOT use markdown code blocks. DO NOT add explanatory text around the JSON.

JSON schema for each slide:
{
  "layout": string,
  "contentJSON": {
    "title": string (required),
    "subtitle": string (required — 1-2 sentences),
    "themeChoice": string (required),
    "grid": string (optional),
    "alignment": string (optional),
    "spacing": string (optional),
    "animation": string (optional),
    "imageQuery": string (optional),
    "list": string[] (optional — for list layout, 3-5 items),
    "cards": [{ "title": string, "description": string, "icon": string }] (optional),
    "stats": [{ "value": string, "label": string, "description": string }] (optional),
    "steps": [{ "title": string, "description": string }] (optional),
    "quote": { "text": string, "author": string } (optional)
  }
}
`;



    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
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
    // In dev mode/without a valid key, fallback to mock data
    return Array.from({ length: slideCount }).map((_, i) => ({
      layout: i === 0 ? 'title_slide' : 'content_list',
      contentJSON: {
        title: i === 0 ? topic : `Slide ${i + 1}`,
        subtitle: i === 0 ? 'Generated by AI' : undefined,
        bullets: i > 0 ? ['Point 1', 'Point 2', 'Point 3'] : undefined,
      },
    }));
  }
};
