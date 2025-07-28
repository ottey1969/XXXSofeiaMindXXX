// Test AI Routing Logic
import { AIRouter } from './server/services/ai-router.js';

const router = new AIRouter();

const testQueries = [
  "write a blog post about AI",
  "create an article about technology trends", 
  "generate content for my website",
  "blog post about digital marketing",
  "write content about SEO strategies",
  "create a comprehensive guide",
  "research AI trends for 2025",
  "what is machine learning?",
  "hello how are you?",
  "analyze market trends and create detailed report"
];

console.log("AI Provider Routing Test Results:");
console.log("=====================================");

testQueries.forEach(query => {
  const analysis = router.analyzeQuery(query);
  console.log(`Query: "${query}"`);
  console.log(`→ Provider: ${analysis.provider}`);
  console.log(`→ Complexity: ${analysis.complexity}`);
  console.log(`→ CRAFT: ${analysis.requiresCraft}`);
  console.log(`→ Keywords: ${analysis.requiresKeywordResearch}`);
  console.log("---");
});