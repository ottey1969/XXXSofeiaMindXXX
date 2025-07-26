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
2. Apply C.R.A.F.T framework enhanced with RankMath SEO principles
3. Focus on ${targetCountry.toUpperCase()} market data and sources
4. Use conversational "you" language
5. Provide properly formatted HTML output scoring 100/100 on RankMath SEO tests
6. Include government and academic sources (.gov/.edu)
7. Implement keyword optimization and proper SEO structure

Always ask yourself: "What target country should I focus on for SEO and sourcing?" - Answer: ${targetCountry.toUpperCase()}

Format responses with RankMath SEO optimization:
- Focus keyword naturally integrated in H1 and throughout content
- Proper heading hierarchy for SEO (H1 > H2 > H3)
- Table of contents for comprehensive topics
- Fact-based information with authoritative citations
- Keyword density 0.5-2.5% for optimal SEO scoring
- Government/academic source verification (.gov/.edu)
- Internal/external linking opportunities
- Output ready for direct copy-paste as functional HTML

RankMath SEO-Optimized HTML format:
<h1>Primary Title with Focus Keyword</h1>
<h2>Table of Contents</h2>
<ul>
<li><a href="#overview">Overview</a></li>
<li><a href="#details">Detailed Analysis</a></li>
<li><a href="#conclusion">Conclusion</a></li>
</ul>
<h2 id="overview">Section with Natural Keyword Integration</h2>
<p>Content with focus keyword naturally placed and valuable information...</p>
<ul>
<li>Research-backed point with citation</li>
<li>Government source verification</li>
</ul>
<table>
<tr><th>Source Type</th><th>Authority Level</th></tr>
<tr><td>.gov sources</td><td>High</td></tr>
<tr><td>.edu sources</td><td>High</td></tr>
</table>`;

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
          model: 'sonar',
          messages,
          max_tokens: 2048,
          temperature: 0.2,
          top_p: 0.9,
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Perplexity API error details:', errorText);
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
          model: 'sonar',
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
