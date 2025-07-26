import { AIResponse, Citation } from "@shared/schema";

interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  citations?: string[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class PerplexityService {
  private apiKey: string;
  private baseUrl = 'https://api.perplexity.ai';

  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY || process.env.PERPLEXITY_API_KEY_ENV_VAR || "";
    if (!this.apiKey) {
      throw new Error('PERPLEXITY_API_KEY is required');
    }
  }

  async researchQuery(query: string, targetCountry: string = 'usa'): Promise<AIResponse> {
    try {
      const systemPrompt = `You are Sofeia AI, the world's most advanced autonomous content agent.

Your mission:
1. Research live data from top Google results
2. Apply C.R.A.F.T framework (Cut fluff, Review/optimize, Add media, Fact-check, Trust-build)
3. Focus on ${targetCountry.toUpperCase()} market data and sources
4. Use conversational "you" language
5. Provide structured, HTML-ready content with proper citations
6. Include government and academic sources (.gov/.edu)

Always ask yourself: "What target country should I focus on for SEO and sourcing?" - Answer: ${targetCountry.toUpperCase()}

Format responses with:
- Clear headings and structure
- Fact-based information with citations
- Actionable insights
- Government/academic source verification
- C.R.A.F.T framework indicators where applicable`;

      const messages: PerplexityMessage[] = [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: query
        }
      ];

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages,
          max_tokens: 2048,
          temperature: 0.2,
          top_p: 0.9,
          search_recency_filter: 'month',
          return_images: false,
          return_related_questions: false,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
      }

      const data: PerplexityResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from Perplexity API');
      }

      // Process citations
      const citations: Citation[] = (data.citations || []).map(url => ({
        url,
        title: this.extractTitleFromUrl(url),
        source: this.extractSourceFromUrl(url)
      }));

      return {
        content: data.choices[0].message.content,
        provider: 'perplexity',
        citations,
        metadata: {
          usage: data.usage,
          model: 'llama-3.1-sonar-small-128k-online',
          searchMode: true,
          targetCountry
        }
      };

    } catch (error) {
      console.error('Perplexity service error:', error);
      throw error;
    }
  }

  private extractTitleFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace('www.', '');
      const path = urlObj.pathname;
      
      // Simple title extraction logic
      if (domain.includes('gov')) return `Government Source - ${domain}`;
      if (domain.includes('edu')) return `Academic Source - ${domain}`;
      
      return `${domain}${path}`;
    } catch {
      return url;
    }
  }

  private extractSourceFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return 'Unknown Source';
    }
  }
}

export const perplexityService = new PerplexityService();
