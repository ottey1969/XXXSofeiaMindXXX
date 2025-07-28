/**
 * Enhanced Multilingual Keyword Research System
 * Inspired by Ultimate Keyword AI System - adapted for TypeScript/Node.js
 * Features: Language-pure outputs, difficulty ratings, opportunity analysis
 */

interface KeywordMetrics {
  volume: number;
  difficulty: number;
  cpc: number;
  opportunity: number;
}

interface KeywordCluster {
  mainKeyword: string;
  relatedKeywords: string[];
  metrics: KeywordMetrics;
  geoTargets: string[];
}

interface LanguageFormatting {
  decimal: string;
  thousands: string;
  toc: string;
  currency: string;
}

// Enhanced multilingual keyword database
const KEYWORD_MASTER_DB = {
  nl: {
    dakwerken: {
      volume_data: {
        "dakreparatie": { volume: 12100, difficulty: 42, cpc: 6.75 },
        "dakisolatie": { volume: 8900, difficulty: 38, cpc: 9.20 },
        "plat dak": { volume: 14200, difficulty: 45, cpc: 8.30 },
        "dakbedekking": { volume: 6800, difficulty: 35, cpc: 7.85 },
        "dakgoot reparatie": { volume: 4200, difficulty: 28, cpc: 5.90 }
      },
      clusters: [
        ["daklek reparatie", "dak stormschade", "spoeddakreparatie"],
        ["plat dak isolatie", "dakisolatie prijzen", "spouwmuur isolatie"],
        ["zinken dakgoot", "aluminium dakgoot", "kunststof dakgoot"]
      ],
      geo_targets: ["Amsterdam", "Rotterdam", "Utrecht", "Den Haag", "Eindhoven"]
    },
    loodgieterwerk: {
      volume_data: {
        "loodgieter spoed": { volume: 18500, difficulty: 48, cpc: 12.40 },
        "cv ketel onderhoud": { volume: 9200, difficulty: 32, cpc: 8.75 },
        "lekkage reparatie": { volume: 11300, difficulty: 41, cpc: 9.50 }
      },
      clusters: [
        ["loodgieter Amsterdam", "noodloodgieter", "24 uurs loodgieter"],
        ["cv ketel storing", "ketel reparatie", "verwarmingsketel"]
      ],
      geo_targets: ["Amsterdam", "Rotterdam", "Utrecht", "Groningen", "Tilburg"]
    }
  },
  en: {
    roofing: {
      volume_data: {
        "roof repair": { volume: 135000, difficulty: 65, cpc: 8.42 },
        "metal roofing": { volume: 74000, difficulty: 58, cpc: 12.31 },
        "roof replacement": { volume: 98000, difficulty: 72, cpc: 15.20 },
        "shingle repair": { volume: 45000, difficulty: 52, cpc: 7.85 }
      },
      clusters: [
        ["emergency roof repair", "roof leak fix", "storm damage repair"],
        ["metal roofing cost", "standing seam roof", "commercial metal roofing"]
      ],
      geo_targets: ["Miami", "Houston", "Phoenix", "Atlanta", "Dallas"]
    },
    plumbing: {
      volume_data: {
        "emergency plumber": { volume: 201000, difficulty: 68, cpc: 18.50 },
        "drain cleaning": { volume: 89000, difficulty: 45, cpc: 12.30 },
        "water heater repair": { volume: 67000, difficulty: 52, cpc: 14.75 }
      },
      clusters: [
        ["24 hour plumber", "emergency plumbing", "plumber near me"],
        ["clogged drain", "drain snake", "hydro jetting"]
      ],
      geo_targets: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"]
    }
  }
};

const LANGUAGE_FORMATTING: Record<string, LanguageFormatting> = {
  nl: {
    decimal: ",",
    thousands: ".",
    toc: "📊 Zoekwoordonderzoek Rapport",
    currency: "€"
  },
  en: {
    decimal: ".",
    thousands: ",",
    toc: "📊 Keyword Analysis Report", 
    currency: "$"
  },
  fr: {
    decimal: ",",
    thousands: " ",
    toc: "📊 Rapport d'Analyse des Mots-clés",
    currency: "€"
  },
  de: {
    decimal: ",",
    thousands: ".",
    toc: "📊 Keyword-Analyse Bericht",
    currency: "€"
  }
};

export class EnhancedKeywordResearchService {
  
  /**
   * Detects language and returns appropriate formatting
   */
  private detectLanguageSettings(text: string): [string, LanguageFormatting] {
    const dutch = /\b(dakwerken|loodgieter|isolatie|reparatie|onderhoud)\b/i;
    const english = /\b(roofing|plumbing|repair|contractor|installation)\b/i;
    const french = /\b(couverture|plomberie|réparation|entrepreneur|installation)\b/i;
    const german = /\b(dacharbeiten|klempner|reparatur|unternehmer|installation)\b/i;
    
    let detectedLang = 'en'; // default
    
    if (dutch.test(text)) detectedLang = 'nl';
    else if (french.test(text)) detectedLang = 'fr';
    else if (german.test(text)) detectedLang = 'de';
    else if (english.test(text)) detectedLang = 'en';
    
    return [detectedLang, LANGUAGE_FORMATTING[detectedLang]];
  }

  /**
   * Generates difficulty emoji based on score
   */
  private getDifficultyEmoji(score: number): string {
    if (score <= 30) return "🟢"; // Easy
    if (score <= 60) return "🟡"; // Medium
    return "🔴"; // Hard
  }

  /**
   * Generates opportunity stars based on volume/difficulty ratio
   */
  private getOpportunityStars(volume: number, difficulty: number): string {
    const ratio = volume / Math.max(difficulty, 1);
    if (ratio > 500) return "⭐⭐⭐"; // Excellent
    if (ratio > 200) return "⭐⭐"; // Good
    return "⭐"; // Fair
  }

  /**
   * Formats numbers according to language conventions
   */
  private formatNumber(num: number, fmt: LanguageFormatting): string {
    return num.toLocaleString().replace(/,/g, fmt.thousands).replace(/\./g, fmt.decimal);
  }

  /**
   * Generates comprehensive keyword research table
   */
  private generateKeywordTable(data: any, fmt: LanguageFormatting, lang: string): string {
    const headers = {
      nl: {
        keyword: "Zoekwoord",
        volume: "Zoekvolume",
        difficulty: "Moeilijkheid", 
        opportunity: "Kans",
        cpc: "CPC"
      },
      en: {
        keyword: "Keyword",
        volume: "Search Volume",
        difficulty: "Difficulty",
        opportunity: "Opportunity", 
        cpc: "CPC"
      },
      fr: {
        keyword: "Mot-clé",
        volume: "Volume de recherche",
        difficulty: "Difficulté",
        opportunity: "Opportunité",
        cpc: "CPC"
      }
    };

    const h = headers[lang as keyof typeof headers] || headers.en;
    
    let table = `
<table>
<thead>
<tr>
<th>${h.keyword}</th>
<th>${h.volume}</th>
<th>${h.difficulty}</th>
<th>${h.opportunity}</th>
<th>${h.cpc}</th>
</tr>
</thead>
<tbody>`;

    for (const [keyword, metrics] of Object.entries(data.volume_data)) {
      const m = metrics as any;
      const volume = this.formatNumber(m.volume, fmt);
      const difficulty = `${this.getDifficultyEmoji(m.difficulty)} ${m.difficulty}`;
      const opportunity = this.getOpportunityStars(m.volume, m.difficulty);
      const cpc = `${fmt.currency}${m.cpc.toFixed(2).replace('.', fmt.decimal)}`;
      
      table += `
<tr>
<td><strong>${keyword}</strong></td>
<td>${volume}</td>
<td>${difficulty}</td>
<td>${opportunity}</td>
<td>${cpc}</td>
</tr>`;
    }

    table += `
</tbody>
</table>`;

    return table;
  }

  /**
   * Generates keyword clusters section
   */
  private generateKeywordClusters(clusters: string[][], lang: string): string {
    const titles = {
      nl: "🎯 Gerelateerde Zoekwoord Clusters",
      en: "🎯 Related Keyword Clusters", 
      fr: "🎯 Groupes de Mots-clés Associés"
    };

    const title = titles[lang as keyof typeof titles] || titles.en;
    
    let clusterHtml = `<h2>${title}</h2>`;
    
    clusters.forEach((cluster, index) => {
      clusterHtml += `
<h3>Cluster ${index + 1}</h3>
<ul>`;
      cluster.forEach(keyword => {
        clusterHtml += `<li>${keyword}</li>`;
      });
      clusterHtml += `</ul>`;
    });

    return clusterHtml;
  }

  /**
   * Main research function that generates comprehensive keyword report
   */
  async generateKeywordReport(query: string): Promise<string> {
    const [lang, fmt] = this.detectLanguageSettings(query);
    
    // Find matching industry data
    const dbData = KEYWORD_MASTER_DB[lang as keyof typeof KEYWORD_MASTER_DB];
    if (!dbData) {
      return `❌ No keyword data available for language: ${lang.toUpperCase()}`;
    }

    // Find matching keyword category
    const matchingCategory = Object.keys(dbData).find(category => 
      query.toLowerCase().includes(category) || 
      Object.keys((dbData as any)[category].volume_data).some(kw => 
        query.toLowerCase().includes(kw)
      )
    );

    if (!matchingCategory) {
      return `❌ No matching keyword data found for: "${query}"`;
    }

    const categoryData = (dbData as any)[matchingCategory];
    
    // Generate comprehensive report
    const report = `
<h1>${fmt.toc}: ${matchingCategory.toUpperCase()}</h1>

${this.generateKeywordTable(categoryData, fmt, lang)}

${this.generateKeywordClusters(categoryData.clusters, lang)}

<h2>${lang === 'nl' ? '📍 Geografische Doelgroepen' : lang === 'fr' ? '📍 Cibles Géographiques' : '📍 Geographic Targets'}</h2>
<ul>
${categoryData.geo_targets.map((target: string) => `<li>${target}</li>`).join('')}
</ul>

<h2>${lang === 'nl' ? '💡 Strategische Aanbevelingen' : lang === 'fr' ? '💡 Recommandations Stratégiques' : '💡 Strategic Recommendations'}</h2>
<ul>
<li>${lang === 'nl' ? 'Focus op zoekwoorden met 🟢 lage moeilijkheidsgraad voor snelle resultaten' : lang === 'fr' ? 'Concentrez-vous sur les mots-clés 🟢 à faible difficulté pour des résultats rapides' : 'Focus on 🟢 low-difficulty keywords for quick wins'}</li>
<li>${lang === 'nl' ? 'Combineer ⭐⭐⭐ hoge kans zoekwoorden met lokale geografische targeting' : lang === 'fr' ? 'Combinez les mots-clés ⭐⭐⭐ à forte opportunité avec le ciblage géographique local' : 'Combine ⭐⭐⭐ high-opportunity keywords with local geographic targeting'}</li>
<li>${lang === 'nl' ? 'Ontwikkel content clusters rond gerelateerde zoekwoorden voor topische autoriteit' : lang === 'fr' ? 'Développez des groupes de contenu autour de mots-clés associés pour l\'autorité thématique' : 'Develop content clusters around related keywords for topical authority'}</li>
</ul>`;

    return report;
  }
}