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

CRITICAL: Provide PLAIN TEXT output - NO HTML, NO MARKDOWN
Format Requirements:
- NO HTML tags (no <h1>, <p>, <ul>, <li>, etc.)
- NO Markdown formatting (no #, **, [], etc.)
- Use simple plain text formatting:
  * MAIN HEADINGS IN ALL CAPS
  * Subheadings in Title Case
  * Use dashes (-) for bullet points
  * Use numbers (1., 2., 3.) for ordered lists
  * Separate sections with blank lines

Content Requirements:
- Use conversational "you" language
- Provide direct, practical answers
- Include real statistics when available (NO DUMMY DATA)
- Include authoritative sources naturally in text
- Focus on actionable insights
- Build trust through expertise

Example PLAIN TEXT format:
MAIN TOPIC HEADING

Key Points:
- First important point with specific details
- Second point with actionable advice
- Third point with expert insight

Important Statistics:
- Market size: $18.6B (Source: Industry Report)
- Growth rate: 4.2% annually (Source: Government Data)
- Average cost: $15,000 (Source: Research Study)

Next Steps:
1. First action to take
2. Second consideration
3. Third recommendation`
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
          max_tokens: 1024,
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
