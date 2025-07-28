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
- HTML tags: h1, h2, p, ul, li, div, span, etc.
- Markdown: #, ##, **, *, [], (), `, |
- Special symbols: #, *, _, backticks, pipes, angle brackets
- Bold text with **text**
- Headers with # or ##
- Links with [text](url)

REQUIRED PLAIN TEXT FORMAT ONLY:
- Main headings: WRITE IN ALL CAPITAL LETTERS
- Subheadings: Write in Title Case  
- Lists: Use simple dashes (-) only
- Numbers: Use 1., 2., 3. for ordered lists
- Emphasis: Use ALL CAPS for important words
- Separate sections with blank lines only

Content Rules:
- Use conversational you language
- PROVIDE DIRECT CONTENT - do not ask clarifying questions
- Can generate LONG FORM content up to 4000 words when requested
- Provide comprehensive, detailed answers with examples and templates
- NO dummy data - only real statistics when available
- Include authoritative sources in plain text format
- Focus on actionable insights and practical guidance
- For grants/proposals: provide complete templates and examples

Example Plain Text Format:
GRANT PROPOSAL TEMPLATE

EXECUTIVE SUMMARY

This proposal requests funding to establish a community education program that will serve 500 low-income families in the metropolitan area over 18 months.

PROJECT DESCRIPTION

Program Overview:
The Community Learning Initiative will provide free educational resources including tutoring, computer access, and life skills training to underserved populations.

Target Population:
- Low-income families with children ages 5-17
- Single-parent households
- Families lacking internet access at home

BUDGET SUMMARY

Total Project Cost: 150,000 dollars
- Staff salaries: 90,000 dollars
- Equipment and supplies: 35,000 dollars  
- Administrative costs: 15,000 dollars
- Evaluation and reporting: 10,000 dollars

EXPECTED OUTCOMES

By project completion we will achieve:
- 500 families served directly
- 85 percent improvement in student academic performance
- 200 adults completing job readiness training
- 100 percent of participating families gaining computer literacy skills

This demonstrates proper plain text formatting without any HTML or markdown symbols.`
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
