// Script de diagnostic pour identifier les fichiers manquants
// Exécutez : node diagnostic.js

const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnostic de votre projet PI BICARS\n');
console.log('=' .repeat(50));

// Fichiers requis par App.tsx
const requiredFiles = [
  'src/App.tsx',
  'src/components/Header.tsx',
  'src/components/Sidebar.tsx',
  'src/components/claims/ClaimsUnderwriting.tsx',
  'src/pages/Home.tsx',
  'src/pages/Dashboard.tsx',
  'src/pages/ImportData.tsx',
  'src/pages/Settings.tsx',
  'src/pages/banking/BankingModule.tsx',
  'src/pages/banking/CreditRisk.tsx',
  'src/pages/banking/LiquidityALM.tsx',
  'src/pages/banking/MarketRisk.tsx',
  'src/pages/insurance/InsuranceModule.tsx',
  'src/pages/insurance/ActuarialAnalytics.tsx',
  'src/pages/CoPilotAI.tsx',
  'src/pages/AnalyticsML.tsx',
  'src/pages/RiskManagement.tsx',
  'src/pages/Reports.tsx',
  'src/i18n/config.ts',
  'src/providers/I18nProvider.tsx'
];

let missingFiles = [];
let existingFiles = [];

// Vérifier chaque fichier
requiredFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    existingFiles.push(file);
    console.log(`✅ ${file}`);
  } else {
    missingFiles.push(file);
    console.log(`❌ ${file} - MANQUANT`);
  }
});

console.log('\n' + '=' .repeat(50));
console.log(`\n📊 Résumé :`);
console.log(`   ✅ Fichiers existants : ${existingFiles.length}/${requiredFiles.length}`);
console.log(`   ❌ Fichiers manquants : ${missingFiles.length}/${requiredFiles.length}`);

if (missingFiles.length > 0) {
  console.log('\n⚠️  Action requise :');
  console.log('   1. Exécutez le script fix-imports.js pour créer les fichiers manquants');
  console.log('   2. OU utilisez App.tsx d\'urgence (sans imports)');
  
  console.log('\n📝 Fichiers manquants :');
  missingFiles.forEach(file => {
    console.log(`   - ${file}`);
  });
} else {
  console.log('\n✅ Tous les fichiers sont présents !');
  console.log('   Votre application devrait fonctionner.');
}

// Vérifier les dépendances npm
console.log('\n' + '=' .repeat(50));
console.log('\n📦 Vérification des dépendances i18n :');

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const i18nDeps = ['i18next', 'react-i18next', 'i18next-browser-languagedetector'];
  
  i18nDeps.forEach(dep => {
    if (deps[dep]) {
      console.log(`   ✅ ${dep} : ${deps[dep]}`);
    } else {
      console.log(`   ❌ ${dep} : NON INSTALLÉ`);
    }
  });
  
  const hasAllDeps = i18nDeps.every(dep => deps[dep]);
  
  if (!hasAllDeps) {
    console.log('\n⚠️  Installez les dépendances i18n :');
    console.log('   npm install i18next react-i18next i18next-browser-languagedetector');
  }
} catch (error) {
  console.log('   ❌ Impossible de lire package.json');
}

console.log('\n' + '=' .repeat(50));
console.log('\n💡 Solutions recommandées :');
console.log('   1. Si des fichiers manquent : node fix-imports.js');
console.log('   2. Si les dépendances manquent : npm install i18next react-i18next');
console.log('   3. Pour tester rapidement : utilisez App.tsx d\'urgence\n');