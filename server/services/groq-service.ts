import { AIResponse } from "@shared/schema";

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class GroqService {
  private apiKey: string;
  private baseUrl = 'https://api.groq.com/openai/v1';

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || process.env.GROQ_API_KEY_ENV_VAR || "";
    if (!this.apiKey) {
      throw new Error('GROQ_API_KEY is required');
    }
  }

  async generateResponse(query: string, conversationHistory: GroqMessage[] = []): Promise<AIResponse> {
    try {
      console.log(`⚡ Groq Service: Processing quick query - "${query}"`);
      const messages: GroqMessage[] = [
        {
          role: 'system',
          content: `You are Sofeia AI, the world's most advanced autonomous content agent.

ABSOLUTELY CRITICAL: Output must be 100% PLAIN TEXT - NO HTML, NO MARKDOWN

Format Rules:
- NEVER use HTML tags like h1, p, ul, li
- NEVER use Markdown like #, ##, **, *, []
- NEVER use symbols like #, *, _, backticks, |, <, >
- Use ALL CAPS for main headings
- Use Title Case for subheadings
- Use simple dashes (-) for lists
- Use numbers (1., 2., 3.) for ordered lists
- Separate sections with blank lines

Content Rules:
- Use conversational you language
- Can generate LONG FORM content up to 4000 words when requested
- Provide comprehensive, detailed answers
- NO dummy data - only real statistics
- Include authoritative sources in plain text
- Focus on actionable insights
- For long content: use clear section breaks and maintain readability

Example Plain Text Format:
CONTENT PLANNING HELP

I can create comprehensive content plans for your business goals.

Content Plan Types:
- SEO Content Calendar with keyword research
- Social Media Content for multiple platforms
- Blog Content Strategy for traffic growth
- Email Marketing Content planning
- Video Content Planning for YouTube
- Product Launch Content campaigns

What I Deliver:
- Content topics with SEO analysis
- Publishing schedules for maximum impact
- Content type recommendations
- Keyword mapping for each piece
- Detailed content briefs
- Performance metrics to track

To create your content plan, tell me:
1. Your business or niche
2. Your target audience
3. Which platforms you use
4. Your main goals
5. Content frequency needed
6. Any specific topics

Give me these details and I will create a complete actionable content plan.`
        },
        ...conversationHistory,
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
          model: 'llama3-8b-8192',
          messages,
          max_tokens: 4096,
          temperature: 0.7,
          top_p: 0.9,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
      }

      const data: GroqResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from Groq API');
      }

      return {
        content: data.choices[0].message.content,
        provider: 'groq',
        metadata: {
          usage: data.usage,
          model: 'llama3-8b-8192'
        }
      };

    } catch (error) {
      console.error('Groq service error:', error);
      throw error;
    }
  }
}

export const groqService = new GroqService();
