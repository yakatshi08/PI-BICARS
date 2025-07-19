import { OPENAI_CONFIG, ChatMessage, OpenAIResponse } from '../config/openai';

export class OpenAIService {
  private static instance: OpenAIService;
  private apiKey: string;
  private baseURL = 'https://api.openai.com/v1';

  private constructor() {
    this.apiKey = OPENAI_CONFIG.apiKey;
  }

  static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  async sendMessage(
    messages: ChatMessage[], 
    context?: {
      sector?: 'banking' | 'insurance';
      currentData?: any;
    }
  ): Promise<string> {
    try {
      // Mode demo si pas de clé API
      if (!this.apiKey || this.apiKey === 'demo') {
        return this.getMockResponse(
          messages[messages.length - 1].content, 
          context
        );
      }

      // Enrichir avec le contexte sectoriel
      const contextMessage = context ? this.buildContextMessage(context) : '';
      
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: OPENAI_CONFIG.model,
          messages: [
            { role: 'system', content: OPENAI_CONFIG.systemPrompt },
            ...(contextMessage ? [{ role: 'system', content: contextMessage }] : []),
            ...messages
          ],
          max_tokens: OPENAI_CONFIG.maxTokens,
          temperature: OPENAI_CONFIG.temperature
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur API OpenAI: ${response.statusText}`);
      }

      const data: OpenAIResponse = await response.json();
      return data.choices[0].message.content;

    } catch (error) {
      console.error('Erreur OpenAI:', error);
      // Fallback vers mock en cas d'erreur
      return this.getMockResponse(
        messages[messages.length - 1].content,
        context
      );
    }
  }

  private buildContextMessage(context: any): string {
    let message = "Contexte actuel:\n";
    
    if (context.sector) {
      message += `- Secteur: ${context.sector === 'banking' ? 'Finance Bancaire' : 'Assurance'}\n`;
    }
    
    if (context.currentData) {
      message += `- Données disponibles:\n${JSON.stringify(context.currentData, null, 2)}`;
    }
    
    return message;
  }

  // Réponses mockées intelligentes pour mode demo
  getMockResponse(query: string, context?: any): string {
    const lowerQuery = query.toLowerCase();
    const sector = context?.sector || 'both';

    // Banking - Ratio CET1
    if (lowerQuery.includes('cet1') || lowerQuery.includes('tier 1')) {
      return `📊 **Analyse du ratio CET1**

**Valeur actuelle**: 14.8%
**Seuil réglementaire**: 10.5% (Bâle III)
**Marge de sécurité**: +4.3 points

✅ **Statut**: Excellent

**Évolution trimestrielle**:
- Q4 2024: 14.5% 
- Q1 2025: 14.8% (+0.3 pts) 📈

**Décomposition**:
- Fonds propres CET1: 2.96 Mds €
- RWA (Risk Weighted Assets): 20 Mds €

💡 **Recommandations**:
- Maintenir le ratio au-dessus de 14% pour conserver la notation AA
- Optimiser les RWA via titrisation ou cession d'actifs non stratégiques
- Renforcer la génération organique de capital`;
    }

    // Insurance - SCR
    if (lowerQuery.includes('scr') || lowerQuery.includes('solvency')) {
      return `🛡️ **Analyse Solvency II - SCR Coverage**

**Ratio de couverture SCR**: 185%
**Seuil minimum**: 100%
**Target interne**: 150%

✅ **Statut**: Très solide

**Décomposition du SCR** (450M€):
- Market Risk: 180M€ (40%)
- Underwriting Risk: 150M€ (33%)
  • Life: 70M€
  • Non-Life: 60M€
  • Health: 20M€
- Credit Risk: 120M€ (27%)

**Fonds propres éligibles**: 832M€
- Tier 1: 750M€ (90%)
- Tier 2: 82M€ (10%)

💡 **Actions recommandées**:
- Réviser l'allocation d'actifs pour réduire le Market Risk
- Envisager de la réassurance pour optimiser l'Underwriting Risk
- Le buffer de 85% offre une flexibilité pour la croissance`;
    }

    // Combined Ratio
    if (lowerQuery.includes('combined ratio') || lowerQuery.includes('ratio combiné')) {
      return `📈 **Analyse du Combined Ratio**

**Combined Ratio Global**: 94.2%
✅ Rentabilité technique confirmée (< 100%)

**Décomposition**:
📊 **Loss Ratio**: 62.5%
- Sinistres payés: 1,250M€
- Variation provisions: +75M€
- Primes acquises: 2,120M€

📊 **Expense Ratio**: 31.7%
- Frais d'acquisition: 420M€ (19.8%)
- Frais d'administration: 252M€ (11.9%)

**Par branche d'activité**:
- 🚗 Motor: 93% ✅
- 🏠 Property: 90% ✅
- 🏥 Health: 95% ✅
- 👤 Life: 80% ⭐
- ⚖️ Liability: 102% ⚠️

💡 **Plan d'action**:
1. Surveiller la branche Liability (dégradation de 5 pts)
2. Maintenir l'excellence en Property/Life
3. Objectif global: maintenir < 95%`;
    }

    // Aide générale
    if (lowerQuery.includes('aide') || lowerQuery.includes('help') || query.length < 10) {
      const sectorSpecific = sector === 'banking' ? 
        `**🏦 Spécifique Banking**:
- Ratios prudentiels: CET1, LCR, NSFR, Leverage
- Rentabilité: ROE, ROA, Cost/Income
- Qualité d'actifs: NPL ratio, Coverage ratio
- Rapports réglementaires: COREP, FINREP` :
        sector === 'insurance' ?
        `**🛡️ Spécifique Insurance**:
- Solvabilité: SCR, MCR, Own Funds
- Rentabilité: Combined Ratio, ROE
- Provisions techniques et réserves
- Rapports Solvency II: QRT, ORSA` :
        `**🏦 Banking & 🛡️ Insurance**:
- Tous les ratios prudentiels
- Analyses de rentabilité
- Stress tests et projections
- Rapports réglementaires`;

      return `👋 **Bienvenue dans PI BICARS Assistant!**

Je suis votre expert IA en finance et assurance. Je peux vous aider avec:

${sectorSpecific}

**📊 Analyses disponibles**:
- Calculs de ratios avec benchmarks
- Génération de rapports automatiques
- Détection d'anomalies et alertes
- Projections et stress tests
- Tableaux de bord personnalisés

**💬 Exemples de questions**:
- "Quel est mon ratio CET1?"
- "Analyse le Combined Ratio par branche"
- "Génère un rapport Solvency II"
- "Projette le SCR sur 3 ans"

Comment puis-je vous aider aujourd'hui?`;
    }

    // Réponse par défaut contextuelle
    return `Je comprends votre demande concernant "${query}". 

Pour vous fournir une analyse précise, j'aurais besoin de quelques informations supplémentaires ou vous pouvez reformuler votre question.

Vous pouvez me demander des analyses sur:
- Les ratios réglementaires ${sector === 'banking' ? '(CET1, LCR, NSFR)' : sector === 'insurance' ? '(SCR, MCR)' : ''}
- La rentabilité et performance
- Les projections et stress tests
- La génération de rapports

Que souhaitez-vous analyser spécifiquement?`;
  }
}