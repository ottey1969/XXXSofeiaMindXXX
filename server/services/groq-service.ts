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
        
        if (reqAnalysis.focusKeyword) {
          const isBusinessClusterRequest = /bedrijvencluster|geografische concentratie|michael porter|industrieel district/i.test(query);
          const isContentClusterRequest = /content cluster|zoekwoord|keyword|seo/i.test(query);
          
          if (isBusinessClusterRequest && !isContentClusterRequest) {
            systemContent += `\n\nBUSINESS CLUSTER REQUEST: User wants information about geographic concentration of ${reqAnalysis.focusKeyword} businesses (Michael Porter's cluster concept).`;
          } else if (isContentClusterRequest || /cluster voor/i.test(query)) {
            systemContent += `\n\nCONTENT CLUSTER REQUEST: User wants SEO keyword research ONLY for "${reqAnalysis.focusKeyword}" industry keywords.

CRITICAL RULES:
- Research keywords ABOUT ${reqAnalysis.focusKeyword} (the industry/topic)
- DO NOT use the user's query as a keyword
- DO NOT include phrases like "geef me een cluster voor"
- ONLY provide ${reqAnalysis.focusKeyword}-related industry keywords
- Focus on ${reqAnalysis.focusKeyword} services, products, and related terms

Provide table format:
Content Cluster | Zoekwoord | Maandelijks Zoekvolume (NL)
[Topic Group] | [actual ${reqAnalysis.focusKeyword} keyword] | [volume]

Example for dakwerken:
Dakbedekking | dakbedekking | 1.900
Dakrenovatie | dakrenovatie | 1.300`;
          } else {
            systemContent += `\n\nTOPIC: "${reqAnalysis.focusKeyword}" - User wants information about ${reqAnalysis.focusKeyword}.`;
          }
        }
        
        if (reqAnalysis.mainKeywords.length > 0) {
          systemContent += `\n\nMAIN KEYWORDS: ${reqAnalysis.mainKeywords.join(', ')} - These are the core topics to focus on in your response.`;
        }
        
        // Add specific anti-duplication rules for Dutch content
        if (detectedLanguage === 'nl') {
          systemContent += `\n\nSTRIKTE NEDERLANDSE CONTENT REGELS - GEEN UITZONDERINGEN:
- Schrijf ALLES in het Nederlands - GEEN Engels
- Maak precies ÉÉN inhoudsopgave met ALLEEN de titel "Inhoudsopgave"
- VERBODEN WOORDEN: "Table of Contents", "Keyword Research", "Volume", "Difficulty", "Intent"
- Gebruik Nederlandse alternatieven: "Zoekwoordonderzoek", "Zoekvolume", "Moeilijkheidsgraad", "Intentie"
- VERBODEN: Elke vorm van Engels in koppen, tabellen of tekst
- VERBODEN: Dubbele inhoudsopgave of herhaling van secties
- VERBODEN: Citation markers [1], [2], [1][3]
- Controleer je antwoord: bevat het ENIG Engels woord? Dan herschrijf volledig in Nederlands.`;
        }
      }

      systemContent += `\n\nProvide direct, practical answers using proper HTML formatting. Use conversational tone with "you" language. Format your output with real HTML tags like <h1>, <h2>, <h3>, <ul>, <li>, <table>, <tr>, <td> etc. Output should be ready for direct copy-paste into web pages or documents as functional HTML.

IMPORTANT FORMATTING RULES:
- Create ONLY ONE table of contents (inhoudsopgave) at the beginning
- Do NOT duplicate tables, headings, or content sections
- Each section should appear only ONCE in your response
- Use clear, unique section headers without repetition

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
        return 'KRITIEK: Beantwoord ALTIJD in het Nederlands. Alle content, voorbeelden, zoekwoorden, tabellen en uitleg moeten in het Nederlands zijn. Focus op Nederlandse markten en gebruikers. Gebruik ALLEEN Nederlandse zoekwoorden en terminologie. GEEN Engelse termen in inhoudsopgave of tabellen.';
      case 'de':
        return 'KRITISCH: Antworten Sie IMMER auf Deutsch. Alle Inhalte, Beispiele, Keywords, Tabellen und Erklärungen müssen auf Deutsch sein. Fokussieren Sie sich auf deutsche Märkte und Benutzer. Verwenden Sie NUR deutsche Keywords und Terminologie.';
      case 'fr':
        return 'CRITIQUE: Répondez TOUJOURS en français. Tout le contenu, exemples, mots-clés, tableaux et explications doivent être en français. Concentrez-vous sur les marchés et utilisateurs français. Utilisez UNIQUEMENT des mots-clés et terminologie français.';
      case 'es':
        return 'CRÍTICO: Responda SIEMPRE en español. Todo el contenido, ejemplos, palabras clave, tablas y explicaciones deben estar en español. Enfóquese en mercados y usuarios españoles. Use SOLO palabras clave y terminología en español.';
      case 'it':
        return 'CRITICO: Rispondi SEMPRE in italiano. Tutti i contenuti, esempi, parole chiave, tabelle e spiegazioni devono essere in italiano. Concentrati sui mercati e utenti italiani. Usa SOLO parole chiave e terminologia italiane.';
      default:
        return 'Respond in English with focus on international markets and users. Use conversation context to provide relevant follow-ups and maintain topic continuity.';
    }
  }
}

export const groqService = new GroqService();
