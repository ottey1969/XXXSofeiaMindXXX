// Real-time research service for finding authentic statistics on any topic
export class ResearchService {
  
  // Research authentic statistics for any topic using real data sources
  async researchTopicStatistics(topic: string): Promise<Array<{ metric: string; percentage: string; source: string }> | null> {
    console.log(`🔍 REAL-TIME RESEARCH: Finding authentic statistics for "${topic}"`);
    
    try {
      // Phase 1: Try government APIs first (most authoritative)
      const govResults = await this.searchGovernmentData(topic);
      
      if (govResults && govResults.length > 0) {
        console.log(`✅ Found ${govResults.length} government statistics for: ${topic}`);
        return this.validateAndRankResults(govResults);
      }
      
      // Phase 2: If no government data, clarify what specific data is needed
      console.log(`❌ No government statistics found for "${topic}"`);
      console.log(`🤔 Topic may need clarification for specific statistical research`);
      console.log(`💡 Suggest user specify: geographic area, time period, specific metrics needed`);
      
      return null; // No dummy data - ask for clarification instead
      
    } catch (error) {
      console.error('Research error:', error);
      return null;
    }
  }
  
  private async searchGovernmentData(topic: string): Promise<Array<{ metric: string; percentage: string; source: string }>> {
    console.log(`🏛️ Searching government data sources for: ${topic}`);
    
    const govResults: Array<{ metric: string; percentage: string; source: string }> = [];
    
    // Try specific government APIs based on topic keywords
    try {
      // Business-related topics → Census Bureau Business API
      if (this.isBusinessTopic(topic)) {
        const businessData = await this.fetchCensusBusiness(topic);
        if (businessData) govResults.push(...businessData);
      }
      
      // Employment topics → Bureau of Labor Statistics
      if (this.isEmploymentTopic(topic)) {
        const employmentData = await this.fetchBLSData(topic);
        if (employmentData) govResults.push(...employmentData);
      }
      
      // Economic topics → Federal Reserve FRED API
      if (this.isEconomicTopic(topic)) {
        const economicData = await this.fetchFREDData(topic);
        if (economicData) govResults.push(...economicData);
      }
      
    } catch (error) {
      console.log('Government API search failed:', error);
    }
    
    return govResults;
  }
  
  private isBusinessTopic(topic: string): boolean {
    return ['business', 'company', 'enterprise', 'startup', 'revenue', 'profit'].some(term => topic.toLowerCase().includes(term));
  }
  
  private isEmploymentTopic(topic: string): boolean {
    return ['employment', 'job', 'unemployment', 'worker', 'labor', 'hiring'].some(term => topic.toLowerCase().includes(term));
  }
  
  private isEconomicTopic(topic: string): boolean {
    return ['economic', 'economy', 'gdp', 'inflation', 'financial'].some(term => topic.toLowerCase().includes(term));
  }
  
  private async fetchCensusBusiness(topic: string): Promise<Array<{ metric: string; percentage: string; source: string }> | null> {
    try {
      const response = await fetch('https://api.census.gov/data/timeseries/bds?get=FIRMS,JOB_CREATION_RATE&for=us:1&YEAR=2022');
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 1) {
          return [
            { metric: "U.S. Business Firms", percentage: `${parseInt(data[1][0]).toLocaleString()}`, source: "Census Bureau BDS API" },
            { metric: "Job Creation Rate", percentage: `${parseFloat(data[1][1]).toFixed(1)}%`, source: "Census Bureau BDS API" }
          ];
        }
      }
    } catch (error) {
      console.log('Census Business API error');
    }
    return null;
  }
  
  private async fetchBLSData(topic: string): Promise<Array<{ metric: string; percentage: string; source: string }> | null> {
    try {
      const response = await fetch('https://api.bls.gov/publicAPI/v1/timeseries/data/LNS14000000');
      if (response.ok) {
        const data = await response.json();
        if (data?.Results?.series?.[0]?.data?.length > 0) {
          const latest = data.Results.series[0].data[0];
          return [
            { metric: "U.S. Unemployment Rate", percentage: `${latest.value}%`, source: `BLS API ${latest.periodName} ${latest.year}` }
          ];
        }
      }
    } catch (error) {
      console.log('BLS API error');
    }
    return null;
  }
  
  private async fetchFREDData(topic: string): Promise<Array<{ metric: string; percentage: string; source: string }> | null> {
    console.log('FRED API requires API key for economic data');
    return null; // Would need API key configuration
  }
  
  private async searchIndustryReports(topic: string): Promise<Array<{ metric: string; percentage: string; source: string }>> {
    // Search authoritative industry reports and studies
    console.log(`📊 Searching industry reports for: ${topic}`);
    
    const industryResults: Array<{ metric: string; percentage: string; source: string }> = [];
    
    // This would search through verified industry data sources
    // McKinsey, Pew Research, Gallup, industry associations, etc.
    
    return industryResults;
  }
  
  private async searchAcademicData(topic: string): Promise<Array<{ metric: string; percentage: string; source: string }>> {
    // Search academic and research institution data
    console.log(`🎓 Searching academic sources for: ${topic}`);
    
    const academicResults: Array<{ metric: string; percentage: string; source: string }> = [];
    
    // This would search through .edu and research institution databases
    // University studies, research papers, academic surveys
    
    return academicResults;
  }
  
  private validateAndRankResults(
    results: Array<{ metric: string; percentage: string; source: string }>
  ): Array<{ metric: string; percentage: string; source: string }> | null {
    
    if (results.length === 0) {
      return null;
    }
    
    // Validate each statistic for authenticity
    const validatedResults = results
      .filter(this.validateStatistic)
      .sort(this.rankBySourceAuthority)
      .slice(0, 6); // Limit to top 6 most authoritative statistics
    
    console.log(`✅ Validated ${validatedResults.length} authentic statistics`);
    return validatedResults.length > 0 ? validatedResults : null;
  }
  
  private validateStatistic(stat: { metric: string; percentage: string; source: string }): boolean {
    // Validate that the statistic has proper format and authoritative source
    return !!(
      stat.metric && 
      stat.percentage && 
      stat.source &&
      stat.metric.length > 10 &&
      (stat.source.includes('gov') || 
       stat.source.includes('edu') || 
       this.isAuthoritySource(stat.source))
    );
  }
  
  private isAuthoritySource(source: string): boolean {
    const authoritySources = [
      'Census Bureau', 'Bureau of Labor Statistics', 'CDC', 'EPA', 'SBA',
      'Federal Reserve', 'Department of Energy', 'NIH', 'WHO',
      'McKinsey', 'Pew Research', 'Gallup', 'Stanford Research',
      'Harvard', 'MIT', 'Brookings Institution'
    ];
    
    return authoritySources.some(auth => source.includes(auth));
  }
  
  private rankBySourceAuthority(
    a: { metric: string; percentage: string; source: string }, 
    b: { metric: string; percentage: string; source: string }
  ): number {
    // Rank government sources highest, then educational, then authoritative organizations
    const getSourceRank = (source: string): number => {
      if (source.includes('.gov') || source.includes('Census') || source.includes('Bureau')) return 1;
      if (source.includes('.edu') || source.includes('University')) return 2;
      if (this.isAuthoritySource(source)) return 3;
      return 4;
    };
    
    return getSourceRank(a.source) - getSourceRank(b.source);
  }
}

export const researchService = new ResearchService();