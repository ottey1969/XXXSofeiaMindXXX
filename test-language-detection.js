// Test script to verify language detection is working
import { AIRouter } from './server/services/ai-router.js';

const router = new AIRouter();

// Test queries in different languages
const testQueries = [
  'dakwerken voor mijn huis in Nederland',
  'Was sind die besten Dachdeckungsoptionen?',
  'Comment réparer une toiture en France?',
  'Como arreglar el tejado de mi casa?',
  'Come riparare il tetto della mia casa?',
  'What are the best roofing options for my house?'
];

console.log('Testing Language Detection:\n');

testQueries.forEach(query => {
  const analysis = router.analyzeQuery(query);
  console.log(`Query: "${query}"`);
  console.log(`Detected Language: ${analysis.detectedLanguage}`);
  console.log(`Target Country: ${analysis.targetCountry}`);
  console.log(`Provider: ${analysis.provider}`);
  console.log('---');
});