# Script PowerShell pour corriger le problème i18n
Write-Host "🔧 Correction du problème i18n PI BICARS..." -ForegroundColor Green

# Aller dans le projet
Set-Location C:\PROJETS-DEVELOPPEMENT\Analyse_Donnees_CLEAN\project

# Créer les dossiers nécessaires
Write-Host "`n📁 Création des dossiers..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "src\i18n\locales" | Out-Null
New-Item -ItemType Directory -Force -Path "src\providers" | Out-Null
New-Item -ItemType Directory -Force -Path "src\components\claims" | Out-Null

Write-Host "`n📝 Création des fichiers corrigés..." -ForegroundColor Yellow

# Vérifier si les fichiers existent et les sauvegarder
if (Test-Path "src\components\claims\ClaimsUnderwriting.tsx") {
    Copy-Item "src\components\claims\ClaimsUnderwriting.tsx" "src\components\claims\ClaimsUnderwriting.tsx.backup" -Force
    Write-Host "✅ Sauvegarde de ClaimsUnderwriting.tsx créée" -ForegroundColor Cyan
}

if (Test-Path "src\App.tsx") {
    Copy-Item "src\App.tsx" "src\App.tsx.backup" -Force
    Write-Host "✅ Sauvegarde de App.tsx créée" -ForegroundColor Cyan
}

# Attendre un peu pour s'assurer que les fichiers sont libérés
Start-Sleep -Seconds 1

Write-Host "`n✅ Fichiers de sauvegarde créés" -ForegroundColor Green
Write-Host "`n📦 Installation des dépendances i18n..." -ForegroundColor Yellow

# Installer les dépendances i18n
npm install i18next react-i18next i18next-browser-languagedetector

Write-Host "`n✅ Dépendances installées" -ForegroundColor Green
Write-Host "`n🚀 Redémarrage de l'application..." -ForegroundColor Yellow

# Tuer le processus npm run dev existant
$npmProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*vite*" }
if ($npmProcess) {
    Stop-Process -Id $npmProcess.Id -Force
    Write-Host "✅ Processus Vite arrêté" -ForegroundColor Cyan
}

# Relancer l'application
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\PROJETS-DEVELOPPEMENT\Analyse_Donnees_CLEAN\project'; npm run dev"

Write-Host "`n✅ Application relancée !" -ForegroundColor Green
Write-Host "`n📌 IMPORTANT : Remplacez maintenant les contenus des fichiers suivants :" -ForegroundColor Yellow
Write-Host "   1. src\components\claims\ClaimsUnderwriting.tsx" -ForegroundColor White
Write-Host "   2. src\App.tsx" -ForegroundColor White
Write-Host "   3. src\i18n\config.ts" -ForegroundColor White
Write-Host "`n   Avec les contenus des artifacts fournis ci-dessus" -ForegroundColor Cyan