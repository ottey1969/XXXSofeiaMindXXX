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

  async researchQuery(query: string, targetCountry: string = 'usa', detectedLanguage: string = 'en', analysis?: any): Promise<AIResponse> {
    try {
      // Language-specific instructions
      const languageInstructions = this.getLanguageInstructions(detectedLanguage, targetCountry);
      
      // Build comprehensive system prompt based on request analysis
      let systemPrompt = `You are Sofeia AI, the world's most advanced autonomous content agent.

${languageInstructions}

CRITICAL INSTRUCTION: Follow ALL user requests comprehensively. Analyze every part of the user's message and ensure you address EVERY requirement, question, and instruction they provide.`;

      // Add specific instructions based on request analysis
      if (analysis?.requestAnalysis) {
        const reqAnalysis = analysis.requestAnalysis;
        
        if (reqAnalysis.hasMultipleRequests) {
          systemPrompt += `\n\nMULTIPLE REQUESTS DETECTED: The user has multiple requirements. Address EACH ONE systematically and comprehensively. Do not skip any part of their request.`;
        }
        
        if (reqAnalysis.requiresSteps) {
          systemPrompt += `\n\nSTEP-BY-STEP REQUIRED: Provide clear, numbered steps or structured guidance as requested.`;
        }
        
        if (reqAnalysis.hasConstraints) {
          systemPrompt += `\n\nIMPORTANT CONSTRAINTS: Pay attention to specific requirements, constraints, or conditions mentioned by the user.`;
        }
        
        if (reqAnalysis.needsComprehensiveAnswer) {
          systemPrompt += `\n\nCOMPREHENSIVE RESPONSE NEEDED: Provide detailed, thorough, and complete information covering all aspects of the request.`;
        }
        
        if (reqAnalysis.requestTypes.length > 0) {
          systemPrompt += `\n\nREQUEST TYPES IDENTIFIED: ${reqAnalysis.requestTypes.join(', ')}. Ensure you fulfill each type of request appropriately.`;
        }
        
        if (reqAnalysis.focusKeyword) {
          const isBusinessClusterRequest = /bedrijvencluster|geografische concentratie|michael porter|industrieel district/i.test(query);
          const isContentClusterRequest = /content cluster|zoekwoord|keyword|seo/i.test(query);
          
          if (isBusinessClusterRequest && !isContentClusterRequest) {
            systemPrompt += `\n\nBUSINESS CLUSTER REQUEST: User wants information about geographic concentration of ${reqAnalysis.focusKeyword} businesses (Michael Porter's cluster concept).`;
          } else if (isContentClusterRequest || /cluster voor/i.test(query)) {
            systemPrompt += `\n\nCONTENT CLUSTER REQUEST: User wants SEO keyword research ONLY for "${reqAnalysis.focusKeyword}" industry keywords.

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
            systemPrompt += `\n\nTOPIC: "${reqAnalysis.focusKeyword}" - User wants information about ${reqAnalysis.focusKeyword}.`;
          }
        }
        
        if (reqAnalysis.mainKeywords.length > 0) {
          systemPrompt += `\n\nMAIN KEYWORDS: ${reqAnalysis.mainKeywords.join(', ')} - These are the core topics to focus on in your response.`;
        }
        
        // Add anti-duplication rules specifically for Dutch content
        if (detectedLanguage === 'nl') {
          systemPrompt += `\n\nSTRIKTE NEDERLANDSE TAALREGELS - ALLE TEKST MOET NEDERLANDS ZIJN:
- ANTWOORD VOLLEDIG IN HET NEDERLANDS - geen Engels toegestaan
- VERBODEN ENGELSE ZINNEN: "Here's what you need to know", "Table of Contents", "Keyword Research"
- VERBODEN: "Table of Contents" - gebruik dit NOOIT, ook niet samen met "Inhoudsopgave"
- VERPLICHT: Gebruik ALLEEN "Inhoudsopgave" als titel voor de inhoudsopgave
- VERBODEN: Dubbele koppen - maak GEEN tweede inhoudsopgave
- VERBODEN: Alle Engelse woorden en zinnen in de hele tekst
- VERPLICHT: Nederlandse alternatieven voor alle termen
- CONTROLE: Scan je hele antwoord - bevat het ENIG Engels woord? Dan herschrijf volledig in Nederlands
- RESULTAAT: 100% Nederlandse tekst zonder enig Engels woord`;
        }
      }

      systemPrompt += `\n\nYour mission:
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

  private getLanguageInstructions(language: string, targetCountry: string): string {
    const countryName = targetCountry.charAt(0).toUpperCase() + targetCountry.slice(1);
    
    switch (language) {
      case 'nl':
        return `KRITIEK: Beantwoord ALTIJD in het Nederlands en focus op de Nederlandse markt. Alle research, content, zoekwoorden, tabellen en koppen moeten in het Nederlands zijn. Gebruik ALLEEN Nederlandse bronnen, voorbeelden en terminologie. GEEN Engelse woorden in zoekwoordonderzoek of tabellen. Vermijd dubbele inhoudsopgaves. Land focus: ${countryName}.`;
      case 'de':
        return `KRITISCH: Antworten Sie IMMER auf Deutsch und konzentrieren Sie sich auf den deutschen Markt. Alle Recherchen, Inhalte, Keywords, Tabellen und Überschriften müssen auf Deutsch sein. Verwenden Sie NUR deutsche Quellen, Beispiele und Terminologie. Landerfokus: ${countryName}.`;
      case 'fr':
        return `CRITIQUE: Répondez TOUJOURS en français et concentrez-vous sur le marché français. Toutes les recherches, contenus, mots-clés, tableaux et titres doivent être en français. Utilisez UNIQUEMENT des sources, exemples et terminologie français. Focus pays: ${countryName}.`;
      case 'es':
        return `CRÍTICO: Responda SIEMPRE en español y enfóquese en el mercado español. Toda la investigación, contenido, palabras clave, tablas y títulos debe estar en español. Use SOLO fuentes, ejemplos y terminología españoles. Enfoque del país: ${countryName}.`;
      case 'it':
        return `CRITICO: Rispondi SEMPRE in italiano e concentrati sul mercato italiano. Tutte le ricerche, contenuti, parole chiave, tabelle e titoli devono essere in italiano. Usa SOLO fonti, esempi e terminologia italiane. Focus paese: ${countryName}.`;
      default:
        return `CRITICAL: Always respond in English and focus on international/US markets. All research and content should be in English. Use authoritative English sources. Country focus: ${countryName}.`;
    }
  }
}

export const perplexityService = new PerplexityService();
