import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { generatePresentationSlides } from '../services/aiService';

async function testTheme() {
  console.log('Testing AI generation with specific theme: "purple-gradient"');
  
  try {
    const slides = await generatePresentationSlides('Artificial Intelligence', 3, {
      themeId: 'purple-gradient',
      imageStyle: 'Creative'
    });

    console.log('Generated Slides:');
    slides.forEach((slide, i) => {
      console.log(`Slide ${i + 1}: Layout=${slide.layout}, Theme=${slide.themeChoice}`);
    });

    const firstSlideTheme = slides[0]?.themeChoice;
    if (firstSlideTheme === 'purple-gradient') {
      console.log('✅ SUCCESS: First slide matches selected theme.');
    } else {
      console.log(`❌ FAILURE: First slide theme is "${firstSlideTheme}", expected "purple-gradient".`);
    }

    // Check if other slides are in the same family
    const family = ['purple-gradient', 'ocean-gradient', 'emerald-gradient', 'neon-blue', 'executive', 'electric-violet'];
    const allInFamily = slides.every(s => family.includes(s.themeChoice));
    if (allInFamily) {
      console.log('✅ SUCCESS: All slides are within the correct palette family.');
    } else {
      console.log('⚠️ WARNING: Some slides are outside the chosen palette family.');
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testTheme();
