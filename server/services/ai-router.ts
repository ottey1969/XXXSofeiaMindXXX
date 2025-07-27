import { QueryAnalysis } from "@shared/schema";

export class AIRouter {
  
  // Language detection method
  private detectLanguage(query: string): string {
    const lowercaseQuery = query.toLowerCase();
    
    // Dutch patterns - enhanced for roofing and content
    if (/\b(dakwerken|daken|dakbedekking|dakpannen|dakgoten|dakdekker|zinken|golfplaten|dakbedekkingen)\b/.test(lowercaseQuery) ||
        /\b(content plan|content cluster|zoekvolume|zoekwoord|seo|strategie)\b/.test(lowercaseQuery) ||
        /\b(voor|een|van|de|het|en|in|op|met|bij|naar|om|te|deze|die|zijn|hebben|kan|wil|mag|zal)\b/.test(lowercaseQuery)) {
      return 'nl';
    }
    
    // German patterns
    if (/\b(dacharbeiten|dächer|dachdeckung|dachziegel|dachdecker|zink|wellplatten)\b/.test(lowercaseQuery) ||
        /\b(für|ein|eine|von|der|die|das|und|in|auf|mit|bei|nach|um|zu|diese|sind|haben|kann|will|soll)\b/.test(lowercaseQuery)) {
      return 'de';
    }
    
    // French patterns
    if (/\b(toiture|tuile|ardoise|couvreur|zinc|tôle)\b/.test(lowercaseQuery) ||
        /\b(pour|une|un|de|le|la|les|et|en|sur|avec|chez|vers|pour|à|ces|sont|avoir|peut|veut|doit)\b/.test(lowercaseQuery)) {
      return 'fr';
    }
    
    // Spanish patterns  
    if (/\b(techado|tejas|pizarra|techador|zinc|chapa)\b/.test(lowercaseQuery) ||
        /\b(para|una|un|de|el|la|los|las|y|en|sobre|con|en|hacia|para|a|estos|son|tener|puede|quiere|debe)\b/.test(lowercaseQuery)) {
      return 'es';
    }
    
    // Italian patterns
    if (/\b(coperture|tegole|ardesia|impresa|zinco|lamiera)\b/.test(lowercaseQuery) ||
        /\b(per|una|un|di|il|la|i|le|e|in|su|con|presso|verso|per|a|questi|sono|avere|può|vuole|deve)\b/.test(lowercaseQuery)) {
      return 'it';
    }
    
    // Default to English
    return 'en';
  }

  private getCountryFromLanguage(language: string, query: string): string {
    // Explicit country detection first
    const countryMatch = query.match(/\b(usa|us|america|uk|canada|australia|germany|france|spain|italy|netherlands|nederland|belgië|belgium)\b/i);
    if (countryMatch) {
      const country = countryMatch[1].toLowerCase();
      if (country === 'nederland' || country === 'netherlands') return 'netherlands';
      if (country === 'belgië' || country === 'belgium') return 'belgium';
      return country;
    }
    
    // Language-based country mapping
    const languageCountryMap: { [key: string]: string } = {
      'nl': 'netherlands',
      'de': 'germany', 
      'fr': 'france',
      'es': 'spain',
      'it': 'italy',
      'en': 'usa'
    };
    
    return languageCountryMap[language] || 'usa';
  }
  
  analyzeQuery(query: string): QueryAnalysis {
    const lowercaseQuery = query.toLowerCase();
    
    // Language detection
    const detectedLanguage = this.detectLanguage(query);
    const targetCountry = this.getCountryFromLanguage(detectedLanguage, query);
    
    // Multilingual patterns
    const simplePatterns = [
      // English
      /^what is|^who is|^when is|^where is|^how to/,
      /^define|^explain briefly|^summarize/,
      /^yes|^no|^thanks|^hello|^hi/,
      // Dutch
      /^wat is|^wie is|^wanneer is|^waar is|^hoe/,
      /^definieer|^leg uit|^samenvatten/,
      /^ja|^nee|^dank|^hallo|^hoi/,
      // German
      /^was ist|^wer ist|^wann ist|^wo ist|^wie/,
      /^definiere|^erkläre|^zusammenfassen/,
      /^ja|^nein|^danke|^hallo/,
      // French
      /^qu'est-ce que|^qui est|^quand est|^où est|^comment/,
      /^définir|^expliquer|^résumer/,
      /^oui|^non|^merci|^bonjour|^salut/,
      // Spanish
      /^qué es|^quién es|^cuándo es|^dónde está|^cómo/,
      /^definir|^explicar|^resumir/,
      /^sí|^no|^gracias|^hola/
    ];
    
    // Research query patterns (multilingual)
    const researchPatterns = [
      // English
      /research|analyze|compare|comprehensive|detailed analysis/,
      /seo|keyword research|content strategy|market analysis/,
      /statistics|data|trends|industry report/,
      /grant|proposal|framework|methodology/,
      /c\.r\.a\.f\.t|craft framework|e-e-a-t/,
      /content plan|content cluster|search volume/,
      // Dutch
      /onderzoek|analyseer|vergelijk|uitgebreide analyse/,
      /seo|zoekwoordonderzoek|contentstrategie|marktanalyse/,
      /statistieken|data|trends|brancherapport/,
      /content plan|content cluster|zoekvolume/,
      /dakwerken|bouw|constructie/,
      // German
      /forschung|analysieren|vergleichen|umfassende analyse/,
      /seo|keyword-recherche|content-strategie|marktanalyse/,
      /statistiken|daten|trends|branchenbericht/,
      /content plan|content cluster|suchvolumen/,
      // French
      /recherche|analyser|comparer|analyse détaillée/,
      /seo|recherche de mots-clés|stratégie de contenu|analyse de marché/,
      /statistiques|données|tendances|rapport de l'industrie/,
      /plan de contenu|cluster de contenu|volume de recherche/,
      // Spanish
      /investigación|analizar|comparar|análisis detallado/,
      /seo|investigación de palabras clave|estrategia de contenido|análisis de mercado/,
      /estadísticas|datos|tendencias|informe de la industria/,
      /plan de contenido|cluster de contenido|volumen de búsqueda/
    ];

    // Complex query patterns (multilingual)
    const complexPatterns = [
      // English
      /create content|write article|generate|optimize/,
      /multiple|several|various|different/,
      /step by step|guide|tutorial|how-to/,
      // Dutch
      /content maken|artikel schrijven|genereren|optimaliseren/,
      /meerdere|verschillende|diverse|anders/,
      /stap voor stap|gids|tutorial|hoe te/,
      // German
      /content erstellen|artikel schreiben|generieren|optimieren/,
      /mehrere|verschiedene|diverse|anders/,
      /schritt für schritt|anleitung|tutorial|wie zu/,
      // French
      /créer du contenu|écrire un article|générer|optimiser/,
      /plusieurs|divers|différents|autre/,
      /étape par étape|guide|tutoriel|comment/,
      // Spanish
      /crear contenido|escribir artículo|generar|optimizar/,
      /múltiples|varios|diversos|diferente/,
      /paso a paso|guía|tutorial|cómo/
    ];

    // Country detection with language context
    const countryMatch = query.match(/\b(usa|us|america|uk|canada|australia|germany|france|spain|italy|netherlands|nederland|belgië|belgium)\b/i);
    const finalTargetCountry = countryMatch ? countryMatch[1].toLowerCase() : targetCountry;

    // Determine complexity and provider
    let complexity: QueryAnalysis['complexity'] = 'simple';
    let provider: QueryAnalysis['provider'] = 'groq';
    let requiresCraft = false;
    let requiresKeywordResearch = false;

    if (researchPatterns.some(pattern => pattern.test(lowercaseQuery))) {
      complexity = 'research';
      provider = 'perplexity';
      requiresCraft = true;
      requiresKeywordResearch = true;
    } else if (complexPatterns.some(pattern => pattern.test(lowercaseQuery))) {
      complexity = 'complex';
      provider = 'anthropic';
      requiresCraft = true;
    } else if (simplePatterns.some(pattern => pattern.test(lowercaseQuery))) {
      complexity = 'simple';
      provider = 'groq';
    } else if (query.length > 100) {
      complexity = 'complex';
      provider = 'anthropic';
      requiresCraft = true;
    }

    // Check for C.R.A.F.T or SEO mentions
    if (/craft|c\.r\.a\.f\.t|seo|content optimization|keyword/i.test(lowercaseQuery)) {
      requiresCraft = true;
      requiresKeywordResearch = true;
    }

    return {
      complexity,
      provider,
      requiresCraft,
      requiresKeywordResearch,
      targetCountry: finalTargetCountry,
      detectedLanguage
    };
  }



  shouldFallbackToAnthropic(provider: string, error: any): boolean {
    // Fall back to Anthropic if primary provider fails
    return provider !== 'anthropic' && (
      error.code === 'RATE_LIMIT_EXCEEDED' ||
      error.code === 'SERVICE_UNAVAILABLE' ||
      error.status >= 500 ||
      error.message?.includes('400') || // Bad Request often indicates API issues
      error.message?.includes('401') || // Unauthorized
      error.message?.includes('403')    // Forbidden
    );
  }
}

export const aiRouter = new AIRouter();
