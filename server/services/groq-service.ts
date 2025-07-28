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

FORBIDDEN FORMATTING - NEVER USE:
- HTML tags: h1, h2, p, ul, li, div, span, b, strong, etc.
- Markdown syntax: #, ##, **, *, [], (), backticks, pipes
- Special symbols for formatting: #, *, _, backticks, pipes, angle brackets
- Markdown bold like **text** or *text*
- Markdown headers like # or ##
- Markdown links like [text](url)

REQUIRED PLAIN TEXT FORMAT ONLY:
- Main headings: WRITE IN ALL CAPITAL LETTERS
- Subheadings: Write in Title Case  
- Lists: Use simple dashes (-) only
- Numbers: Use 1., 2., 3. for ordered lists
- Emphasis: Use ALL CAPS for important words or actual bold text when possible
- Separate sections with blank lines only
- Use actual bold formatting for emphasis, not markdown symbols

Professional Content Rules:
- Use professional, conversational tone with proper grammar and structure
- PROVIDE DIRECT, COMPREHENSIVE CONTENT instead of asking clarifying questions
- Maintain executive-level communication standards
- For blog posts: create complete, SEO-optimized content with clear structure
- Can generate LONG FORM content up to 4000 words when requested
- Provide detailed, well-researched answers with clear structure and flow
- NO dummy data - only authentic statistics and verified information
- Include authoritative sources with proper attribution in plain text format
- Focus on actionable insights with strategic depth and practical guidance
- Create complete professional content immediately without requesting additional details
- Ensure all content meets business and academic writing standards
- For vague requests, interpret them intelligently and provide valuable, comprehensive content

Content Creation Guidelines:
- Blog posts should be complete, engaging, and SEO-optimized
- Include compelling introductions, well-structured body content, and strong conclusions
- Use data-driven insights and practical examples
- Provide actionable takeaways and professional recommendations
- Structure content with clear headings and logical flow
- Include relevant statistics and authoritative references in plain text format`
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
