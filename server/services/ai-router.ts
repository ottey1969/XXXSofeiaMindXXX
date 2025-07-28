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

  // Enhanced multilingual keyword extraction for better context understanding
  private extractMainKeywords(query: string): string[] {
    const lowercaseQuery = query.toLowerCase();
    const keywords = [];
    
    // Extract quoted terms first (highest priority - universal)
    const quotedMatches = query.match(/"([^"]+)"/g);
    if (quotedMatches) {
      keywords.push(...quotedMatches.map(match => match.replace(/"/g, '')));
    }
    
    // Remove ALL request phrases to focus on actual topics
    const cleanedQuery = lowercaseQuery
      .replace(/geef me een|maak een|creëer een|schrijf een|genereer een|cluster voor|plan voor/g, '') // Dutch
      .replace(/give me a|make a|create a|write a|generate a|cluster for|plan for/g, '') // English
      .replace(/gib mir ein|mach ein|erstelle ein|schreibe ein|cluster für|plan für/g, '') // German
      .replace(/donne-moi un|fais un|crée un|écris un|cluster pour|plan pour/g, '') // French
      .replace(/dame un|haz un|crea un|escribe un|cluster para|plan para/g, '') // Spanish
      .replace(/dammi un|fai un|crea un|scrivi un|cluster per|piano per/g, '') // Italian
      .replace(/content plan|content cluster|cluster|plan|guide|tips|how to|best|2025/g, '') // Remove ALL format words
      .replace(/voor|for|für|pour|para|per/g, '') // Remove prepositions
      .replace(/\s+/g, ' ') // Clean multiple spaces
      .trim();
      
    // If we found a clean topic word, use it
    if (cleanedQuery && cleanedQuery.length > 2) {
      keywords.push(cleanedQuery);
    }
    
    // Multilingual keyword extraction patterns
    const keywordPatterns = {
      // Dutch patterns
      dutch: [
        /voor\s+"?([^".\s,]+)"?/g,
        /van\s+"?([^".\s,]+)"?/g,
        /over\s+"?([^".\s,]+)"?/g,
        /cluster\s+voor\s+"?([^".\s,]+)"?/g,
        /content\s+voor\s+"?([^".\s,]+)"?/g,
        /\b(dakwerken|dakbedekking|dakpannen|golfplaten|zinken|dakisolatie|dakrenovatie|dakonderhoud|bouw|constructie|renovatie|installatie|onderhoud|reparatie|tuinonderhoud|elektricien|schilder|loodgieter)\b/g
      ],
      // German patterns
      german: [
        /für\s+"?([^".\s,]+)"?/g,
        /von\s+"?([^".\s,]+)"?/g,
        /über\s+"?([^".\s,]+)"?/g,
        /\b(dacharbeiten|dachdeckung|dachziegel|dachdecker|zink|wellplatten|bau|konstruktion|renovierung|installation|wartung|reparatur)\b/g
      ],
      // French patterns
      french: [
        /pour\s+"?([^".\s,]+)"?/g,
        /de\s+"?([^".\s,]+)"?/g,
        /sur\s+"?([^".\s,]+)"?/g,
        /\b(toiture|tuile|ardoise|couvreur|zinc|tôle|construction|rénovation|installation|entretien|réparation)\b/g
      ],
      // Spanish patterns
      spanish: [
        /para\s+"?([^".\s,]+)"?/g,
        /de\s+"?([^".\s,]+)"?/g,
        /sobre\s+"?([^".\s,]+)"?/g,
        /\b(techado|tejas|pizarra|techador|zinc|chapa|construcción|renovación|instalación|mantenimiento|reparación)\b/g
      ],
      // Italian patterns
      italian: [
        /per\s+"?([^".\s,]+)"?/g,
        /di\s+"?([^".\s,]+)"?/g,
        /su\s+"?([^".\s,]+)"?/g,
        /\b(coperture|tegole|ardesia|impresa|zinco|lamiera|costruzione|ristrutturazione|installazione|manutenzione|riparazione)\b/g
      ],
      // English patterns
      english: [
        /for\s+"?([^".\s,]+)"?/g,
        /about\s+"?([^".\s,]+)"?/g,
        /on\s+"?([^".\s,]+)"?/g,
        /\b(roofing|roof|tiles|slate|roofer|zinc|metal|construction|renovation|installation|maintenance|repair)\b/g
      ]
    };
    
    // Apply all patterns
    Object.values(keywordPatterns).flat().forEach(pattern => {
      const matches = lowercaseQuery.match(pattern);
      if (matches) {
        keywords.push(...matches.map(match => 
          match.replace(/voor\s+|van\s+|over\s+|für\s+|von\s+|über\s+|pour\s+|de\s+|sur\s+|para\s+|sobre\s+|per\s+|di\s+|su\s+|for\s+|about\s+|on\s+|"/g, '').trim()
        ));
      }
    });
    
    return Array.from(new Set(keywords)).filter(k => k && k.length > 2);
  }

  // Comprehensive request analysis to understand all user requirements
  private analyzeUserRequest(query: string) {
    const lowercaseQuery = query.toLowerCase();
    
    // Extract main keywords for better context understanding
    const mainKeywords = this.extractMainKeywords(query);
    
    // Detect multiple requests or requirements
    const hasMultipleRequests = /\band\b|\bplus\b|\balso\b|\badditionally\b|\bfurthermore\b|\bmoreover\b|,|;/.test(lowercaseQuery) ||
                               /\ben\b|\btevens\b|\book\b|\bdarnaast\b|\bbovendien\b/.test(lowercaseQuery) || // Dutch
                               /\bund\b|\bauch\b|\bzusätzlich\b|\baußerdem\b|\bferner\b/.test(lowercaseQuery) || // German
                               /\bet\b|\baussi\b|\ben plus\b|\bde plus\b|\bpar ailleurs\b/.test(lowercaseQuery) || // French
                               /\by\b|\btambién\b|\badicionalmente\b|\bademás\b|\baparte\b/.test(lowercaseQuery) || // Spanish
                               /\be\b|\binoltre\b|\baggiungere\b|\boltre\b|\binfatti\b/.test(lowercaseQuery); // Italian
    
    // Identify request types
    const requestTypes = [];
    if (/create|make|generate|build|develop|design|write|produce/.test(lowercaseQuery) ||
        /maak|genereer|bouw|ontwikkel|ontwerp|schrijf|produceer/.test(lowercaseQuery) ||
        /erstellen|machen|generieren|bauen|entwickeln|entwerfen|schreiben/.test(lowercaseQuery) ||
        /créer|faire|générer|construire|développer|concevoir|écrire/.test(lowercaseQuery) ||
        /crear|hacer|generar|construir|desarrollar|diseñar|escribir/.test(lowercaseQuery) ||
        /creare|fare|generare|costruire|sviluppare|progettare|scrivere/.test(lowercaseQuery)) {
      requestTypes.push('create');
    }
    
    if (/analyze|research|investigate|study|examine|compare/.test(lowercaseQuery) ||
        /analyseer|onderzoek|bestudeer|vergelijk/.test(lowercaseQuery) ||
        /analysieren|forschen|untersuchen|studieren|vergleichen/.test(lowercaseQuery) ||
        /analyser|rechercher|étudier|examiner|comparer/.test(lowercaseQuery) ||
        /analizar|investigar|estudiar|examinar|comparar/.test(lowercaseQuery) ||
        /analizzare|ricercare|studiare|esaminare|confrontare/.test(lowercaseQuery)) {
      requestTypes.push('analyze');
    }
    
    if (/explain|describe|define|clarify|elaborate/.test(lowercaseQuery) ||
        /uitleggen|beschrijven|definiëren|verduidelijken/.test(lowercaseQuery) ||
        /erklären|beschreiben|definieren|klären/.test(lowercaseQuery) ||
        /expliquer|décrire|définir|clarifier/.test(lowercaseQuery) ||
        /explicar|describir|definir|aclarar/.test(lowercaseQuery) ||
        /spiegare|descrivere|definire|chiarire/.test(lowercaseQuery)) {
      requestTypes.push('explain');
    }
    
    if (/optimize|improve|enhance|upgrade|refine/.test(lowercaseQuery) ||
        /optimaliseer|verbeter|verfijn/.test(lowercaseQuery) ||
        /optimieren|verbessern|verfeinern/.test(lowercaseQuery) ||
        /optimiser|améliorer|affiner/.test(lowercaseQuery) ||
        /optimizar|mejorar|refinar/.test(lowercaseQuery) ||
        /ottimizzare|migliorare|raffinare/.test(lowercaseQuery)) {
      requestTypes.push('optimize');
    }
    
    // Check for step-by-step requirements
    const requiresSteps = /step|steps|guide|tutorial|process|procedure|method|how to/.test(lowercaseQuery) ||
                         /stap|stappen|gids|proces|procedure|methode|hoe/.test(lowercaseQuery) ||
                         /schritt|schritte|anleitung|prozess|verfahren|methode|wie/.test(lowercaseQuery) ||
                         /étape|étapes|guide|processus|procédure|méthode|comment/.test(lowercaseQuery) ||
                         /paso|pasos|guía|proceso|procedimiento|método|cómo/.test(lowercaseQuery) ||
                         /passo|passi|guida|processo|procedura|metodo|come/.test(lowercaseQuery);
    
    // Check for constraints or specific requirements
    const hasConstraints = /must|should|need|require|important|essential|critical/.test(lowercaseQuery) ||
                          /moet|hoort|nodig|vereist|belangrijk|essentieel|kritiek/.test(lowercaseQuery) ||
                          /muss|sollte|braucht|erfordert|wichtig|wesentlich|kritisch/.test(lowercaseQuery) ||
                          /doit|devrait|besoin|exiger|important|essentiel|critique/.test(lowercaseQuery) ||
                          /debe|debería|necesita|requiere|importante|esencial|crítico/.test(lowercaseQuery) ||
                          /deve|dovrebbe|bisogno|richiede|importante|essenziale|critico/.test(lowercaseQuery);
    
    // Check for comprehensive answer needs
    const needsComprehensiveAnswer = /comprehensive|complete|detailed|thorough|extensive|all/.test(lowercaseQuery) ||
                                   /uitgebreid|compleet|gedetailleerd|grondig|alles/.test(lowercaseQuery) ||
                                   /umfassend|vollständig|detailliert|gründlich|alle/.test(lowercaseQuery) ||
                                   /complet|détaillé|approfondi|extensif|tout/.test(lowercaseQuery) ||
                                   /completo|detallado|exhaustivo|extenso|todo/.test(lowercaseQuery) ||
                                   /completo|dettagliato|approfondito|estensivo|tutto/.test(lowercaseQuery);
    
    // Better focus keyword detection - extract the actual topic, not the request format
    let focusKeyword = null;
    let actualTopic = null;
    
    if (mainKeywords.length > 0) {
      // Filter out request-related words and keep only topic words
      const topicKeywords = mainKeywords.filter(keyword => 
        !keyword.match(/content|cluster|plan|geef|me|een|give|create|make|write|guide|tips|how|to|best|2025/i)
      );
      focusKeyword = topicKeywords.length > 0 ? topicKeywords[0] : mainKeywords[0];
      actualTopic = focusKeyword;
    }
    
    // Enhanced context understanding for Dutch business terms
    const isBusinessClusterRequest = /cluster voor|bedrijvencluster|industrieel district|geografische concentratie/i.test(query);
    const isContentRequest = /content|artikel|blog|tekst|schrijf/i.test(query);
    
    // Determine request intent
    let requestIntent = 'general';
    if (isBusinessClusterRequest && !isContentRequest) {
      requestIntent = 'business_cluster_info';
    } else if (isContentRequest || /content|plan|cluster/i.test(query)) {
      requestIntent = 'content_creation';
    }
    
    return {
      hasMultipleRequests,
      requestTypes,
      requiresSteps,
      hasConstraints,
      needsComprehensiveAnswer,
      mainKeywords,
      focusKeyword,
      actualTopic,
      requestIntent,
      isBusinessClusterRequest,
      isContentRequest
    };
  }
  
  analyzeQuery(query: string): QueryAnalysis {
    const lowercaseQuery = query.toLowerCase();
    
    // Language detection
    const detectedLanguage = this.detectLanguage(query);
    const targetCountry = this.getCountryFromLanguage(detectedLanguage, query);
    
    // Comprehensive request analysis
    const requestAnalysis = this.analyzeUserRequest(query);
    
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
      /statistics|data|trends|industry report|market research/,
      /grant|proposal|framework|methodology|business plan/,
      /c\.r\.a\.f\.t|craft framework|e-e-a-t|competitive analysis/,
      /content plan|content cluster|search volume|keyword analysis/,
      /feasibility study|market study|industry analysis/,
      // Dutch
      /onderzoek|analyseer|vergelijk|uitgebreide analyse/,
      /seo|zoekwoordonderzoek|contentstrategie|marktanalyse/,
      /statistieken|data|trends|brancherapport|marktonderzoek/,
      /content plan|content cluster|zoekvolume|cluster voor/,
      /dakwerken|bouw|constructie|zoekwoord|maandelijks zoekvolume/,
      /moeilijkheidsgraad|ranking mogelijkheden|keyword research/,
      /subsidie|aanvraag|voorstel|businessplan|haalbaarheidsstudie/,
      // German
      /forschung|analysieren|vergleichen|umfassende analyse/,
      /seo|keyword-recherche|content-strategie|marktanalyse/,
      /statistiken|daten|trends|branchenbericht|marktforschung/,
      /content plan|content cluster|suchvolumen|zuschuss|antrag/,
      // French
      /recherche|analyser|comparer|analyse détaillée/,
      /seo|recherche de mots-clés|stratégie de contenu|analyse de marché/,
      /statistiques|données|tendances|rapport de l'industrie|étude de marché/,
      /plan de contenu|cluster de contenu|volume de recherche|subvention|proposition/,
      // Spanish
      /investigación|analizar|comparar|análisis detallado/,
      /seo|investigación de palabras clave|estrategia de contenido|análisis de mercado/,
      /estadísticas|datos|tendencias|informe de la industria|estudio de mercado/,
      /plan de contenido|cluster de contenido|volumen de búsqueda|subvención|propuesta/
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
      detectedLanguage,
      requestAnalysis
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
