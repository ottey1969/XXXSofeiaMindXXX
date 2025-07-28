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

  private generateBaseKeywords(query: string): string[] {
    console.log(`🔍 Keyword Research: Extracting keywords from query: "${query}"`);
    
    // Extract the actual topic from user requests like "write a blog post about X"
    const extractedTopic = this.extractMainTopic(query);
    console.log(`📝 Extracted topic: "${extractedTopic}"`);
    
    const keywords: string[] = [];
    
    // Primary keyword (the extracted topic)
    keywords.push(extractedTopic);
    
    // Long-tail variations based on extracted topic
    keywords.push(`best ${extractedTopic}`);
    keywords.push(`${extractedTopic} guide`);
    keywords.push(`${extractedTopic} tips`);
    keywords.push(`how to ${extractedTopic}`);
    keywords.push(`${extractedTopic} 2025`);
    
    // Industry-specific keywords based on detected topic
    this.addIndustryKeywords(extractedTopic, keywords);
    
    return Array.from(new Set(keywords)).slice(0, 10); // Remove duplicates and limit
  }

  private extractMainTopic(query: string): string {
    // Remove common request phrases to extract the actual topic
    let topic = query.toLowerCase()
      .replace(/please\s+/g, '')
      .replace(/write\s+(me\s+)?(a\s+)?blog\s*post\s+(about\s+)?/g, '')
      .replace(/create\s+(an?\s+)?article\s+(about\s+)?/g, '')
      .replace(/generate\s+content\s+(for\s+|about\s+)?/g, '')
      .replace(/company\s+[^,]+,?\s*/g, '') // Remove company names
      .replace(/https?:\/\/[^\s,]+/g, '') // Remove URLs
      .replace(/[,]+/g, ' ') // Replace commas with spaces
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();

    // If topic is too short or empty, try to extract key business terms
    if (topic.length < 3) {
      const businessTerms = query.match(/\b(roofing|repair|SEO|marketing|AI|technology|business|services?|solutions?)\b/gi);
      topic = businessTerms ? businessTerms[0].toLowerCase() : 'business services';
    }

    // Clean up and format
    topic = topic.replace(/\s+near\s+me$/i, '').trim();
    
    return topic || 'business services';
  }

  private addIndustryKeywords(topic: string, keywords: string[]): void {
    const topicLower = topic.toLowerCase();
    
    if (topicLower.includes('roof')) {
      keywords.push('roof repair', 'roofing services', 'roof installation', 'roof contractors', 'residential roofing');
    }
    
    if (topicLower.includes('repair')) {
      keywords.push('home repair', 'repair services', 'emergency repair', 'professional repair');
    }
    
    if (topicLower.includes('energy')) {
      keywords.push('renewable energy solutions', 'clean energy benefits', 'sustainable energy trends');
    }
    
    if (topicLower.includes('ai') || topicLower.includes('artificial intelligence')) {
      keywords.push('AI tools', 'artificial intelligence applications', 'machine learning');
    }
    
    if (topicLower.includes('seo')) {
      keywords.push('SEO optimization', 'search engine ranking', 'keyword research');
    }
    
    if (topicLower.includes('marketing')) {
      keywords.push('digital marketing', 'content marketing', 'marketing strategy');
    }
    
    if (topicLower.includes('business')) {
      keywords.push('business services', 'local business', 'business solutions');
    }
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
