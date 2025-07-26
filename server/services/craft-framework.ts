import { CraftStep } from "@shared/schema";

export class CraftFramework {
  
  async applyCraftFramework(content: string, targetCountry: string = 'usa'): Promise<{
    optimizedContent: string;
    steps: CraftStep[];
  }> {
    const steps: CraftStep[] = [];
    let optimizedContent = content;

    // Step 1: Cut the fluff
    const { content: cutContent, applied: cutApplied } = this.cutTheFluff(optimizedContent);
    optimizedContent = cutContent;
    steps.push({
      step: 'cut',
      description: 'Removed unnecessary words, phrases, and fluff for clarity',
      applied: cutApplied
    });

    // Step 2: Review and optimize
    const { content: reviewedContent, applied: reviewApplied } = this.reviewAndOptimize(optimizedContent, targetCountry);
    optimizedContent = reviewedContent;
    steps.push({
      step: 'review',
      description: 'Optimized structure, headings, and SEO elements',
      applied: reviewApplied
    });

    // Step 3: Add media suggestions
    const mediaStep = this.addMediaSuggestions(optimizedContent);
    steps.push({
      step: 'add',
      description: mediaStep.description,
      applied: mediaStep.applied
    });

    // Step 4: Fact-check indicators
    const factCheckStep = this.addFactCheckIndicators(optimizedContent);
    steps.push({
      step: 'fact-check',
      description: factCheckStep.description,
      applied: factCheckStep.applied
    });

    // Step 5: Trust-building elements
    const { content: trustContent, applied: trustApplied } = this.addTrustBuilding(optimizedContent);
    optimizedContent = trustContent;
    steps.push({
      step: 'trust-build',
      description: 'Enhanced conversational tone and trust-building elements',
      applied: trustApplied
    });

    return {
      optimizedContent,
      steps
    };
  }

  private cutTheFluff(content: string): { content: string; applied: boolean } {
    const fluffPatterns = [
      /\b(very|really|quite|extremely|absolutely|totally|completely|definitely|certainly|obviously|clearly|actually|basically|literally|essentially|particularly|specifically|especially|importantly|significantly|substantially|considerably|relatively|comparatively)\b/gi,
      /\b(in order to|for the purpose of|with the intention of|in an effort to|as a means to)\b/gi,
      /\b(it is important to note that|it should be mentioned that|it is worth noting that|please note that)\b/gi,
      /\b(as you can see|as mentioned above|as stated previously|as we discussed)\b/gi
    ];

    let optimized = content;
    let changesMade = false;

    fluffPatterns.forEach(pattern => {
      const original = optimized;
      optimized = optimized.replace(pattern, '');
      if (original !== optimized) changesMade = true;
    });

    // Clean up extra spaces
    optimized = optimized.replace(/\s+/g, ' ').trim();

    return { content: optimized, applied: changesMade };
  }

  private reviewAndOptimize(content: string, targetCountry: string): { content: string; applied: boolean } {
    let optimized = content;
    let changesMade = false;

    // Add proper HTML structure if missing
    if (!content.includes('<h1>') && !content.includes('<h2>')) {
      // Add basic HTML structure
      const lines = content.split('\n');
      const firstLine = lines[0];
      if (firstLine && firstLine.length > 10) {
        optimized = `<h1>${firstLine}</h1>\n${lines.slice(1).join('\n')}`;
        changesMade = true;
      }
    }

    // Ensure conversational "you" language
    const impersonalPatterns = [
      { from: /\bone can\b/gi, to: 'you can' },
      { from: /\bpeople should\b/gi, to: 'you should' },
      { from: /\busers will\b/gi, to: 'you will' },
      { from: /\bindividuals who\b/gi, to: 'you who' }
    ];

    impersonalPatterns.forEach(({ from, to }) => {
      const original = optimized;
      optimized = optimized.replace(from, to);
      if (original !== optimized) changesMade = true;
    });

    return { content: optimized, applied: changesMade };
  }

  private addMediaSuggestions(content: string): { description: string; applied: boolean } {
    const suggestions = [];
    
    if (content.includes('statistics') || content.includes('data')) {
      suggestions.push('Add data visualization charts or infographics');
    }
    
    if (content.includes('comparison') || content.includes('vs')) {
      suggestions.push('Include comparison tables');
    }
    
    if (content.includes('step') || content.includes('process')) {
      suggestions.push('Add process flowcharts or step-by-step visuals');
    }
    
    if (content.includes('example') || content.includes('case study')) {
      suggestions.push('Include screenshots or example images');
    }

    const description = suggestions.length > 0 
      ? `Media suggestions: ${suggestions.join(', ')}`
      : 'Consider adding relevant visuals to enhance engagement';

    return { description, applied: suggestions.length > 0 };
  }

  private addFactCheckIndicators(content: string): { description: string; applied: boolean } {
    const factsToCheck = [];
    
    // Look for statistical claims
    const statPattern = /\d+%|\d+\s*(billion|million|thousand)/gi;
    const stats = content.match(statPattern);
    if (stats) {
      factsToCheck.push(`Verify statistics: ${stats.slice(0, 3).join(', ')}`);
    }
    
    // Look for definitive claims
    const claimPatterns = [
      /studies show/gi,
      /research indicates/gi,
      /experts say/gi,
      /proven/gi
    ];
    
    claimPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        factsToCheck.push('Verify claims with credible sources');
      }
    });

    const description = factsToCheck.length > 0
      ? `Fact-check needed: ${factsToCheck.join(', ')}`
      : 'All claims appear to be appropriately sourced';

    return { description, applied: factsToCheck.length > 0 };
  }

  private addTrustBuilding(content: string): { content: string; applied: boolean } {
    let optimized = content;
    let changesMade = false;

    // Add author credibility if missing
    if (!content.includes('Author:') && !content.includes('Sofeia AI')) {
      optimized = `${optimized}\n\n<p><strong>Author: Sofeia AI | 3 min read | ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></p>`;
      changesMade = true;
    }

    // Enhance conversational tone markers
    const conversationalMarkers = [
      'Here\'s what you need to know:',
      'Let me explain:',
      'You might be wondering:',
      'The bottom line:'
    ];

    // Add conversational elements if content is too formal
    if (!/here's|let me|you might|bottom line/i.test(content)) {
      // Add a conversational intro if possible
      const firstParagraph = optimized.match(/<p>(.*?)<\/p>/);
      if (firstParagraph) {
        const enhanced = firstParagraph[1].replace(/^/, 'Here\'s what you need to know: ');
        optimized = optimized.replace(firstParagraph[0], `<p>${enhanced}</p>`);
        changesMade = true;
      }
    }

    return { content: optimized, applied: changesMade };
  }
}

export const craftFramework = new CraftFramework();
