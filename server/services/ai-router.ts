import { QueryAnalysis } from "@shared/schema";

export class AIRouter {
  
  analyzeQuery(query: string): QueryAnalysis {
    const lowercaseQuery = query.toLowerCase();
    
    // Simple query patterns
    const simplePatterns = [
      /^what is|^who is|^when is|^where is|^how to/,
      /^define|^explain briefly|^summarize/,
      /^yes|^no|^thanks|^hello|^hi/
    ];
    
    // Research query patterns  
    const researchPatterns = [
      /research|analyze|compare|comprehensive|detailed analysis/,
      /seo|keyword research|content strategy|market analysis/,
      /statistics|data|trends|industry report/,
      /grant|proposal|framework|methodology/,
      /c\.r\.a\.f\.t|craft framework|e-e-a-t/
    ];

    // Complex query patterns
    const complexPatterns = [
      /create content|write article|generate|optimize/,
      /multiple|several|various|different/,
      /step by step|guide|tutorial|how-to/
    ];

    // Country detection
    const countryMatch = query.match(/\b(usa|us|america|uk|canada|australia|germany|france|spain|italy)\b/i);
    const targetCountry = countryMatch ? countryMatch[1].toLowerCase() : 'usa';

    // Determine complexity and provider
    let complexity: QueryAnalysis['complexity'] = 'simple';
    let provider: QueryAnalysis['provider'] = 'groq';
    let requiresCraft = false;
    let requiresKeywordResearch = false;

    if (researchPatterns.some(pattern => pattern.test(lowercaseQuery))) {
      complexity = 'research';
      provider = 'perplexity';
      requiresCraft = true;
      requiresKeywordResearch = true;
    } else if (complexPatterns.some(pattern => pattern.test(lowercaseQuery))) {
      complexity = 'complex';
      provider = 'anthropic';
      requiresCraft = true;
    } else if (simplePatterns.some(pattern => pattern.test(lowercaseQuery))) {
      complexity = 'simple';
      provider = 'groq';
    } else if (query.length > 100) {
      complexity = 'complex';
      provider = 'anthropic';
      requiresCraft = true;
    }

    // Check for C.R.A.F.T or SEO mentions
    if (/craft|c\.r\.a\.f\.t|seo|content optimization|keyword/i.test(lowercaseQuery)) {
      requiresCraft = true;
      requiresKeywordResearch = true;
    }

    return {
      complexity,
      provider,
      requiresCraft,
      requiresKeywordResearch,
      targetCountry
    };
  }

  shouldFallbackToAnthropic(provider: string, error: any): boolean {
    // Fall back to Anthropic if primary provider fails
    return provider !== 'anthropic' && (
      error.code === 'RATE_LIMIT_EXCEEDED' ||
      error.code === 'SERVICE_UNAVAILABLE' ||
      error.status >= 500 ||
      error.message?.includes('400') || // Bad Request often indicates API issues
      error.message?.includes('401') || // Unauthorized
      error.message?.includes('403')    // Forbidden
    );
  }
}

export const aiRouter = new AIRouter();
