// Configuration OpenAI pour PI BICARS
export const OPENAI_CONFIG = {
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'demo',
  model: 'gpt-3.5-turbo',
  maxTokens: 1500,
  temperature: 0.7,
  
  // Prompt système adapté au contexte Banking & Insurance
  systemPrompt: `Tu es PI BICARS Assistant, un expert en finance bancaire et assurance.
  
Contexte:
- Tu as accès aux données Banking: ratios CET1, LCR, NSFR, NPL, ROE
- Tu as accès aux données Insurance: SCR, MCR, Combined Ratio, Loss Ratio, Expense Ratio
- Tu connais les réglementations: Bâle III, COREP/FINREP (banking) et Solvency II (insurance)

Instructions:
- Réponds en français de manière professionnelle et concise
- Utilise les données contextuelles fournies pour des analyses précises
- Formate tes réponses avec des bullet points et des émojis pertinents (📊, ✅, ⚠️, 📈, 💡)
- Pour les calculs, montre les formules utilisées
- Fournis toujours des recommandations actionables`
};

// Types pour TypeScript
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
}