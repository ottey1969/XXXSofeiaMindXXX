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

  async generateResponse(query: string, conversationHistory: GroqMessage[] = [], analysis?: any): Promise<AIResponse> {
    try {
      // Language detection and instructions
      const detectedLanguage = analysis?.detectedLanguage || this.detectLanguageFromHistory(conversationHistory) || 'en';
      const languageInstructions = this.getLanguageInstructions(detectedLanguage);
      
      // Build comprehensive system prompt based on request analysis
      let systemContent = `You are Sofeia AI, the world's most advanced autonomous content agent. ${languageInstructions}

CRITICAL INSTRUCTION: Follow ALL user requests comprehensively. Analyze every part of the user's message and ensure you address EVERY requirement, question, and instruction they provide.

CONVERSATION CONTEXT: Maintain conversation context and continue the discussion naturally. Reference previous messages when relevant. Keep the same language throughout the entire conversation.`;

      // Add specific instructions based on request analysis
      if (analysis?.requestAnalysis) {
        const reqAnalysis = analysis.requestAnalysis;
        
        if (reqAnalysis.hasMultipleRequests) {
          systemContent += `\n\nMULTIPLE REQUESTS DETECTED: The user has multiple requirements. Address EACH ONE systematically and comprehensively. Do not skip any part of their request.`;
        }
        
        if (reqAnalysis.requiresSteps) {
          systemContent += `\n\nSTEP-BY-STEP REQUIRED: Provide clear, numbered steps or structured guidance as requested.`;
        }
        
        if (reqAnalysis.hasConstraints) {
          systemContent += `\n\nIMPORTANT CONSTRAINTS: Pay attention to specific requirements, constraints, or conditions mentioned by the user.`;
        }
        
        if (reqAnalysis.needsComprehensiveAnswer) {
          systemContent += `\n\nCOMPREHENSIVE RESPONSE NEEDED: Provide detailed, thorough, and complete information covering all aspects of the request.`;
        }
        
        if (reqAnalysis.requestTypes.length > 0) {
          systemContent += `\n\nREQUEST TYPES IDENTIFIED: ${reqAnalysis.requestTypes.join(', ')}. Ensure you fulfill each type of request appropriately.`;
        }
      }

      systemContent += `\n\nProvide direct, practical answers using proper HTML formatting. Use conversational tone with "you" language. Format your output with real HTML tags like <h1>, <h2>, <h3>, <ul>, <li>, <table>, <tr>, <td> etc. Output should be ready for direct copy-paste into web pages or documents as functional HTML.

Example format:
<h2>Answer Title</h2>
<p>Your explanation here...</p>
<ul>
<li>Point one</li>
<li>Point two</li>
</ul>`;

      const messages: GroqMessage[] = [
        {
          role: 'system',
          content: systemContent
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

  private detectLanguageFromHistory(history: GroqMessage[]): string | null {
    // Look at recent messages to detect language patterns
    const recentMessages = history.slice(-4);
    for (const msg of recentMessages) {
      if (msg.role === 'user') {
        const content = msg.content.toLowerCase();
        // Dutch detection
        if (/\b(dakwerken|het|de|een|van|voor|met|en|is|zijn|wordt|kan|mag|zal|hebben|maken)\b/.test(content)) {
          return 'nl';
        }
        // German detection
        if (/\b(der|die|das|ein|eine|und|ist|sind|wird|kann|soll|haben|machen)\b/.test(content)) {
          return 'de';
        }
        // French detection
        if (/\b(le|la|les|un|une|de|du|des|et|est|sont|peut|doit|avoir|faire)\b/.test(content)) {
          return 'fr';
        }
        // Spanish detection
        if (/\b(el|la|los|las|un|una|de|del|y|es|son|puede|debe|tener|hacer)\b/.test(content)) {
          return 'es';
        }
        // Italian detection
        if (/\b(il|la|lo|gli|le|un|una|di|del|e|è|sono|può|deve|avere|fare)\b/.test(content)) {
          return 'it';
        }
      }
    }
    return null;
  }

  private getLanguageInstructions(language: string): string {
    switch (language) {
      case 'nl':
        return 'KRITIEK: Beantwoord ALTIJD in het Nederlands. Alle content, voorbeelden en uitleg moeten in het Nederlands zijn. Focus op Nederlandse markten en gebruikers. Gebruik de context van het gesprek om relevante follow-ups te geven.';
      case 'de':
        return 'KRITISCH: Antworten Sie IMMER auf Deutsch. Alle Inhalte, Beispiele und Erklärungen müssen auf Deutsch sein. Fokussieren Sie sich auf deutsche Märkte und Benutzer. Verwenden Sie den Gesprächskontext für relevante Anschlüsse.';
      case 'fr':
        return 'CRITIQUE: Répondez TOUJOURS en français. Tout le contenu, les exemples et les explications doivent être en français. Concentrez-vous sur les marchés et utilisateurs français. Utilisez le contexte de conversation pour des suivis pertinents.';
      case 'es':
        return 'CRÍTICO: Responda SIEMPRE en español. Todo el contenido, ejemplos y explicaciones deben estar en español. Enfóquese en mercados y usuarios españoles. Use el contexto de conversación para seguimientos relevantes.';
      case 'it':
        return 'CRITICO: Rispondi SEMPRE in italiano. Tutti i contenuti, esempi e spiegazioni devono essere in italiano. Concentrati sui mercati e utenti italiani. Usa il contesto di conversazione per follow-up pertinenti.';
      default:
        return 'Respond in English with focus on international markets and users. Use conversation context to provide relevant follow-ups and maintain topic continuity.';
    }
  }
}

export const groqService = new GroqService();
