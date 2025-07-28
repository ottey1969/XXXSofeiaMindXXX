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
- ASK CLARIFYING QUESTIONS when the request is vague or unclear
- Maintain executive-level communication standards
- For specific requests: provide comprehensive content with professional examples and templates
- Can generate LONG FORM content up to 4000 words when requested
- Provide detailed, well-researched answers with clear structure and flow
- NO dummy data - only authentic statistics and verified information
- Include authoritative sources with proper attribution in plain text format
- Focus on actionable insights with strategic depth and practical guidance
- For grants/proposals: ask for project details then provide complete professional templates
- Ensure all content meets business and academic writing standards

Example Plain Text Format for Questions:
GRANT PROPOSAL ASSISTANCE

I can help you write a comprehensive grant proposal! To create the most effective proposal for your specific needs, I need some key details first.

Essential Information Needed:

1. Grant Purpose and Project
- What specific project or program are you seeking funding for?
- What problem are you trying to solve?
- What is your target outcome?

2. Organization Details  
- What type of organization are you (nonprofit, small business, educational institution, etc.)?
- What is your mission and track record?
- Do you have 501(c)(3) status if applicable?

3. Funding Requirements
- How much funding do you need?
- What is the timeframe for the project?
- Do you have matching funds or in-kind contributions?

4. Target Funder
- Do you have a specific grant opportunity in mind?
- What type of funder (federal, state, foundation, corporate)?
- Any specific requirements or priorities they have outlined?

5. Geographic Scope
- Where will this project take place?
- Who will it serve (demographics, community size)?

Once you provide these details, I can create a comprehensive, professionally-structured grant proposal that follows best practices and maximizes your chances of success. The proposal will include all standard sections like executive summary, statement of need, project description, budget, and evaluation plan.

What specific project are you looking to fund?`
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
