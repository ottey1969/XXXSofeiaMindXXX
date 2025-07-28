import { QueryAnalysis } from "@shared/schema";

export class AIRouter {
  
  analyzeQuery(query: string): QueryAnalysis {
    const lowercaseQuery = query.toLowerCase();
    
    // Simple query patterns (use Groq)
    const simplePatterns = [
      /^what is|^who is|^when is|^where is|^how to/,
      /^define|^explain briefly|^summarize/,
      /^yes|^no|^thanks|^hello|^hi/,
      /^simple|^quick|^basic/
    ];
    
    // Blog and content creation patterns (use Anthropic - prioritized)
    const blogContentPatterns = [
      /blog|article|post|content/,
      /write.*about|create.*about|generate.*about/,
      /content.*creation|content.*writing|content.*strategy/,
      /copywriting|copy.*writing|marketing.*content/,
      /website.*content|web.*content|landing.*page/,
      /long.*form|detailed.*guide|comprehensive.*guide/,
      /creative.*writing|storytelling|narrative/
    ];
    
    // Research query patterns (use Perplexity)
    const researchPatterns = [
      /research.*trends|analyze.*market|current.*data/,
      /latest.*developments|recent.*news|trending.*topics/,
      /industry.*insights|market.*analysis|competitive.*research/,
      /statistics|data.*analysis|survey.*results/,
      /government.*data|academic.*research|scientific.*study/,
      /seo.*research|keyword.*research|search.*trends/
    ];

    // Complex analysis patterns (use Anthropic)
    const complexPatterns = [
      /multiple|several|various|different/,
      /step by step|guide|tutorial|framework/,
      /optimization|strategy|methodology|approach/,
      /comprehensive|detailed|thorough|in-depth/,
      /grant.*proposal|business.*plan|technical.*document/
    ];

    // Country detection
    const countryMatch = query.match(/\b(usa|us|america|uk|canada|australia|germany|france|spain|italy)\b/i);
    const targetCountry = countryMatch ? countryMatch[1].toLowerCase() : 'usa';

    // Determine complexity and provider
    let complexity: QueryAnalysis['complexity'] = 'simple';
    let provider: QueryAnalysis['provider'] = 'groq';
    let requiresCraft = false;
    let requiresKeywordResearch = false;

    // Priority routing: Blog/Content Creation first (most common use case)
    if (blogContentPatterns.some(pattern => pattern.test(lowercaseQuery))) {
      complexity = 'complex';
      provider = 'anthropic';
      requiresCraft = true;
      requiresKeywordResearch = false; // Don't show keyword research for blog posts
    } 
    // Research queries for data-heavy content
    else if (researchPatterns.some(pattern => pattern.test(lowercaseQuery))) {
      complexity = 'research';
      provider = 'perplexity';
      requiresCraft = true;
      requiresKeywordResearch = true;
    } 
    // Complex analysis and strategies
    else if (complexPatterns.some(pattern => pattern.test(lowercaseQuery))) {
      complexity = 'complex';
      provider = 'anthropic';
      requiresCraft = true;
    } 
    // Simple questions and quick responses
    else if (simplePatterns.some(pattern => pattern.test(lowercaseQuery))) {
      complexity = 'simple';
      provider = 'groq';
    } 
    // Long queries default to Anthropic
    else if (query.length > 100) {
      complexity = 'complex';
      provider = 'anthropic';
      requiresCraft = true;
    }
    // Default for medium queries
    else {
      complexity = 'complex';
      provider = 'anthropic';
      requiresCraft = true;
    }

    // Check for C.R.A.F.T or SEO mentions
    if (/craft|c\.r\.a\.f\.t|seo|content optimization|keyword/i.test(lowercaseQuery)) {
      requiresCraft = true;
      requiresKeywordResearch = true;
    }

    // Special handling for research-heavy content creation
    if (/research.*blog|research.*article|trending.*topics|current.*news/i.test(lowercaseQuery)) {
      provider = 'perplexity';
      complexity = 'research';
      requiresKeywordResearch = true;
    }

    console.log(`AI Router Decision: "${query}" -> Provider: ${provider}, Complexity: ${complexity}`);

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
