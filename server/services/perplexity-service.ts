import { AIResponse, Citation } from "@shared/schema";
import { externalLinksService } from './external-links-service';
import { statisticsService } from './statistics-service';

interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
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

  async researchQuery(query: string, targetCountry: string = 'usa', conversationHistory: ConversationMessage[] = []): Promise<AIResponse> {
    try {
      console.log(`🔍 Perplexity Service: Researching query - "${query}" for ${targetCountry}`);
      
      // Get authoritative external links for the topic
      const authorityLinks = externalLinksService.getAuthorityLinks(query);
      const linksContext = authorityLinks.length > 0 
        ? `\n\nInclude these authoritative external links naturally in your content:\n${authorityLinks.map(link => `- ${link.anchor}: ${link.url}`).join('\n')}`
        : '';
      
      // Get relevant statistics table for the topic
      const statsTable = await statisticsService.getStatisticsTable(query);
      const statsContext = statsTable 
        ? `\n\nInclude this statistics table in your content where it adds value:\n${statsTable.htmlTable}`
        : '';
      
      const systemPrompt = `You are Sofeia AI, the world's most advanced autonomous content agent.

Your mission:
1. Research live data from top Google results
2. Apply C.R.A.F.T framework enhanced with RankMath SEO principles
3. Focus on ${targetCountry.toUpperCase()} market data and sources
4. Use conversational "you" language
5. Provide properly formatted HTML output scoring 100/100 on RankMath SEO tests
6. Include government and academic sources (.gov/.edu)
7. Implement keyword optimization and proper SEO structure
8. Can generate COMPREHENSIVE long-form content up to 5500 words when requested
9. Break long content into clear sections with proper headings and structure

CONVERSATION MEMORY RULES:
- ALWAYS reference and build upon previous messages in this conversation
- Acknowledge what was discussed before and how it relates to current request
- Continue topics, themes, and context from earlier in the chat
- If user asks follow-up questions, refer back to previous responses
- Maintain consistency with previous advice and information given
- Build progressive understanding throughout the conversation

Always ask yourself: "What target country should I focus on for SEO and sourcing?" - Answer: ${targetCountry.toUpperCase()}

Format responses with RankMath SEO optimization:
- Focus keyword naturally integrated in H1 and throughout content
- Proper heading hierarchy for SEO (H1 > H2 > H3)
- Table of contents for comprehensive topics
- Fact-based information with authoritative citations (NO DUMMY DATA)
- Keyword density 0.5-2.5% for optimal SEO scoring
- Government/academic source verification (.gov/.edu)

RESEARCH REQUIREMENT: Use only authentic, verifiable data sources. If specific statistics cannot be found from authoritative sources, ask for clarification on:
- Geographic scope needed
- Time period requirements  
- Specific metrics or data points required
- External anchor text links to high DR authoritative sources:
  * Government agencies (.gov) for official statistics and regulations
  * Educational institutions (.edu) for research and academic studies
  * Industry authorities and professional organizations
  * Medical institutions for health-related topics
  * Use natural anchor text that enhances readability${linksContext}${statsContext}
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
        ...conversationHistory.map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' as const : 'user' as const,
          content: msg.content
        })),
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
          max_tokens: 8192,
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
