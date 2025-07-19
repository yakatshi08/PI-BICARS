# PI BICARS - Plateforme Intelligence Finance & Assurance

![Version](https://img.shields.io/badge/version-0.3.5-blue.svg)
![Status](https://img.shields.io/badge/status-development-orange.svg)
![License](https://img.shields.io/badge/license-proprietary-red.svg)

## 🚀 Vue d'ensemble

**PI BICARS** est une plateforme d'analyse de données nouvelle génération dédiée aux secteurs de la finance et de l'assurance. Elle intègre l'IA générative, la conformité réglementaire (Bâle III, Solvency II, IFRS 9/17) et une UX moderne pour concurrencer Power BI et Tableau.

### 🎯 Objectifs principaux
- Outil d'analyse spécialisé Finance & Assurance
- Co-Pilot IA avec NLP métier
- Conformité réglementaire native
- Performance temps réel (<100ms)
- Architecture cloud-native sécurisée

## 📊 État d'avancement : 35%

### ✅ Réalisé
- Structure de base et navigation
- Dashboard principal (Modules Sectoriels)
- Pages Insurance Core & Banking Core (structure)
- Interface Co-Pilot IA (base)
- Mode sombre/clair
- Design moderne avec palette de couleurs définie

### 🚧 En développement
- Intelligence d'import multi-format
- NLP spécialisé finance/assurance
- Modules métier complets (Banking, Insurance, Risk)
- Intégrations API (Bloomberg, Reuters, BCE)
- Sécurité RGPD/ISO 27001

## 🛠️ Technologies

### Frontend
- **React 18** + TypeScript
- **TailwindCSS** pour le styling
- **Plotly.js** & **D3.js** pour les visualisations
- **Zustand** pour la gestion d'état
- **React Router** pour la navigation

### Backend (À venir)
- FastAPI + PostgreSQL
- ClickHouse pour l'analytics
- Kafka pour le streaming
- MLflow pour le MLOps

### IA/ML (Prévu)
- XGBoost, LSTM, Prophet
- NLP spécialisé finance/assurance
- AutoML pipeline

## 📁 Structure du projet

```
PI-BICARS-CLEAN/
├── project/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── InsuranceCore.tsx
│   │   │   └── BankingCore.tsx
│   │   ├── pages/
│   │   │   ├── ModulesSectoriels.tsx
│   │   │   ├── CoPilot.tsx
│   │   │   └── DataImport.tsx
│   │   ├── store/
│   │   │   └── index.ts
│   │   └── App.tsx
│   ├── public/
│   └── package.json
└── README.md
```

## 🚀 Installation

### Prérequis
- Node.js 18+
- npm ou yarn
- Git

### Installation locale
```bash
# Cloner le repository
git clone https://github.com/yakatshi08/PI-BICARS.git

# Naviguer dans le dossier
cd PI-BICARS-CLEAN/project

# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build pour production
npm run build
```

## 📦 Modules disponibles

### 🏦 Banking
- **Banking Core** : Métriques prudentielles (CET1, LCR, NPL)
- **Credit Risk** : Analyse PD, LGD, EAD, provisions IFRS 9/17
- **Liquidity & ALM** : Gestion liquidité et actif-passif
- **Market Risk** : VaR, CVaR, stress tests

### 🛡️ Insurance
- **Insurance Core** : KPIs techniques (Combined Ratio, Loss Ratio)
- **Solvency II** : SCR, MCR, Own Funds, ORSA
- **Actuarial Analytics** : Réserves techniques, triangles
- **Claims & Underwriting** : Détection fraude, pricing IA

### 🤖 Co-Pilot IA
- Assistant conversationnel finance/assurance
- Génération automatique de rapports
- Calculs intelligents et prédictions
- Insights contextualisés

## 🎨 Design System

### Palette de couleurs
- **Fond principal** : `#0f172a` (slate-900)
- **Cartes** : `#1e293b` (slate-800)
- **Texte principal** : `#ffffff`
- **Texte secondaire** : `#94a3b8` (slate-400)
- **Positif** : `#10b981` (emerald-500)
- **Négatif** : `#ef4444` (red-500)

## 🗺️ Roadmap

### Phase 1 (Q4 2025) - Foundation ✅
- [x] Structure de base
- [x] Dashboard principal
- [x] Pages modules
- [ ] Intelligence d'import
- [ ] Co-Pilot IA basique

### Phase 2 (Q1 2026) - Core Features
- [ ] Modules Banking complets
- [ ] Modules Insurance complets
- [ ] NLP finance/assurance
- [ ] Intégrations API

### Phase 3 (Q2 2026) - Advanced
- [ ] ML/AI prédictif
- [ ] Streaming temps réel
- [ ] Mobile apps
- [ ] Certification ISO 27001

## 🤝 Contribution

Ce projet est actuellement privé. Pour toute demande de contribution ou partenariat :
- Email : contact@pi-bicars.com
- Issues : Via GitHub

### Règles de développement
1. **NE JAMAIS** modifier l'architecture du Dashboard
2. **NE JAMAIS** toucher au Header
3. Modifications autorisées **UNIQUEMENT** dans les cartes
4. **TOUJOURS** fusionner le code, ne jamais écraser
5. **TOUJOURS** indiquer le chemin exact des fichiers

## 🔒 Sécurité

- Architecture Zero Trust (en développement)
- Chiffrement AES-256/TLS 1.3
- Conformité RGPD/ISO 27001 (prévu)
- Audit blockchain (prévu)

## 📄 Licence

© 2025 PI BICARS - Tous droits réservés. Logiciel propriétaire.

## 📞 Contact

- **Repository** : https://github.com/yakatshi08/PI-BICARS
- **Local** : C:\PROJETS-DEVELOPPEMENT\PI-BICARS-CLEAN\project

---

**Note** : Ce projet est en développement actif. Les fonctionnalités et l'API peuvent changer.