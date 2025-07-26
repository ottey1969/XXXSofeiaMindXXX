import { KeywordData } from "@shared/schema";

export class KeywordResearchService {
  
  async researchKeywords(topic: string, targetCountry: string = 'usa'): Promise<KeywordData[]> {
    // In a real implementation, you would integrate with SEMrush/Ahrefs APIs
    // or scrape their public data. For now, we'll simulate keyword research
    // based on common patterns and topic analysis.
    
    const baseKeywords = this.generateBaseKeywords(topic);
    const keywords: KeywordData[] = [];
    
    for (const keyword of baseKeywords) {
      const data = await this.analyzeKeyword(keyword, targetCountry);
      keywords.push(data);
    }
    
    return keywords.sort((a, b) => this.parseVolume(b.volume) - this.parseVolume(a.volume));
  }

  private generateBaseKeywords(topic: string): string[] {
    const words = topic.toLowerCase().split(' ').filter(w => w.length > 2);
    const keywords: string[] = [];
    
    // Primary keyword
    keywords.push(topic.toLowerCase());
    
    // Long-tail variations
    keywords.push(`best ${topic.toLowerCase()}`);
    keywords.push(`${topic.toLowerCase()} guide`);
    keywords.push(`${topic.toLowerCase()} tips`);
    keywords.push(`how to ${topic.toLowerCase()}`);
    keywords.push(`${topic.toLowerCase()} 2025`);
    
    // Related terms based on common patterns
    if (topic.includes('energy')) {
      keywords.push('renewable energy solutions', 'clean energy benefits', 'sustainable energy trends');
    }
    
    if (topic.includes('AI') || topic.includes('artificial intelligence')) {
      keywords.push('AI tools', 'artificial intelligence applications', 'machine learning');
    }
    
    if (topic.includes('SEO')) {
      keywords.push('SEO optimization', 'search engine ranking', 'keyword research');
    }
    
    if (topic.includes('content')) {
      keywords.push('content marketing', 'content strategy', 'content creation');
    }
    
    return [...new Set(keywords)].slice(0, 10); // Remove duplicates and limit
  }

  private async analyzeKeyword(keyword: string, targetCountry: string): Promise<KeywordData> {
    // Simulate keyword analysis based on patterns
    // In production, this would call real APIs
    
    const volume = this.estimateSearchVolume(keyword, targetCountry);
    const difficulty = this.estimateDifficulty(keyword);
    const intent = this.determineIntent(keyword);
    
    return {
      keyword,
      volume,
      difficulty,
      intent
    };
  }

  private estimateSearchVolume(keyword: string, targetCountry: string): string {
    // Simulate search volume based on keyword characteristics
    const baseVolume = Math.floor(Math.random() * 50000) + 1000;
    
    // Adjust for country
    const countryMultiplier = {
      'usa': 1.0,
      'uk': 0.3,
      'canada': 0.15,
      'australia': 0.1
    }[targetCountry.toLowerCase()] || 0.5;
    
    // Adjust for keyword length (longer = less volume)
    const lengthMultiplier = keyword.length > 30 ? 0.3 : keyword.length > 20 ? 0.6 : 1.0;
    
    // Adjust for common terms
    const popularTerms = ['AI', 'SEO', 'marketing', 'business', 'how to', 'best'];
    const popularityBoost = popularTerms.some(term => 
      keyword.toLowerCase().includes(term.toLowerCase())
    ) ? 2.0 : 1.0;
    
    const finalVolume = Math.floor(baseVolume * countryMultiplier * lengthMultiplier * popularityBoost);
    
    if (finalVolume >= 10000) return `${Math.floor(finalVolume / 1000)}k/mo`;
    return `${finalVolume.toLocaleString()}/mo`;
  }

  private estimateDifficulty(keyword: string): string {
    // Estimate difficulty based on keyword characteristics
    const competitiveTerms = ['best', 'top', 'review', 'vs', 'comparison', 'buy'];
    const isCompetitive = competitiveTerms.some(term => 
      keyword.toLowerCase().includes(term)
    );
    
    const isLongTail = keyword.split(' ').length >= 4;
    const hasNumbers = /\d/.test(keyword);
    
    if (isCompetitive && !isLongTail) return 'High';
    if (isLongTail || hasNumbers) return 'Low';
    return 'Medium';
  }

  private determineIntent(keyword: string): string {
    const intentPatterns = {
      'Commercial': ['buy', 'price', 'cost', 'cheap', 'discount', 'deal', 'review', 'best'],
      'Navigational': ['login', 'website', 'official', 'contact', 'support'],
      'Transactional': ['download', 'free', 'trial', 'signup', 'register'],
      'Research': ['what is', 'how to', 'guide', 'tutorial', 'learn', 'study'],
      'Comparison': ['vs', 'versus', 'compare', 'difference', 'alternative']
    };
    
    for (const [intent, patterns] of Object.entries(intentPatterns)) {
      if (patterns.some(pattern => keyword.toLowerCase().includes(pattern))) {
        return intent;
      }
    }
    
    return 'Informational';
  }

  private parseVolume(volume: string): number {
    const match = volume.match(/^([\d,]+)([km]?)/);
    if (!match) return 0;
    
    let num = parseInt(match[1].replace(/,/g, ''));
    const multiplier = match[2];
    
    if (multiplier === 'k') num *= 1000;
    if (multiplier === 'm') num *= 1000000;
    
    return num;
  }
}

export const keywordResearchService = new KeywordResearchService();
