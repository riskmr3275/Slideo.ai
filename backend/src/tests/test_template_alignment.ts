import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { generatePresentationSlides } from '../services/aiService';

async function testTemplateAlignment() {
  console.log('Testing AI generation with specific template structure...');
  
  // Requirement: Hero -> Comparison -> Bullet Slide -> Quote
  const requiredLayouts = ['hero', 'comparison', 'bullet-slide', 'quote'];
  const themeId = 'purple-gradient';
  
  try {
    const slides = await generatePresentationSlides(
      'Modern AI Infrastructure',
      requiredLayouts.length,
      {
        themeId,
        requiredLayouts
      }
    );

    console.log('\nGenerated Slides Alignment Check:');
    let success = true;
    
    slides.forEach((slide, i) => {
      const expected = requiredLayouts[i];
      const actual = slide.layout;
      const status = expected === actual ? '✅' : '❌';
      if (expected !== actual) success = false;
      
      console.log(`Slide ${i + 1}: Expected Layout=${expected}, Actual Layout=${actual} ${status}`);
    });

    if (success) {
      console.log('\n🎉 SUCCESS: AI correctly followed the template layout sequence.');
    } else {
      console.log('\n❌ FAILURE: AI did not follow the required layout sequence.');
    }

  } catch (error) {
    console.error('Error during verification:', error);
  }
}

testTemplateAlignment();
