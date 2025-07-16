// Script pour vérifier quels fichiers existent
const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification des fichiers...\n');

// Fichiers essentiels à vérifier
const filesToCheck = [
  'src/App.tsx',
  'src/components/claims/ClaimsUnderwriting.tsx',
  'src/components/Header.tsx',
  'src/components/Sidebar.tsx',
  'src/pages/Home.tsx',
  'src/i18n/config.ts',
  'src/providers/I18nProvider.tsx'
];

// Vérifier chaque fichier
filesToCheck.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - EXISTE`);
  } else {
    console.log(`❌ ${file} - MANQUANT`);
  }
});

// Vérifier si le dossier claims existe
const claimsDir = path.join(process.cwd(), 'src/components/claims');
console.log('\n📁 Dossiers :');
if (fs.existsSync(claimsDir)) {
  console.log(`✅ src/components/claims - EXISTE`);
  // Lister les fichiers dans le dossier
  const files = fs.readdirSync(claimsDir);
  if (files.length > 0) {
    console.log('   Contient :');
    files.forEach(file => {
      console.log(`   - ${file}`);
    });
  }
} else {
  console.log(`❌ src/components/claims - MANQUANT`);
}

console.log('\n💡 Si ClaimsUnderwriting.tsx est manquant, exécutez : node fix-claims.js');