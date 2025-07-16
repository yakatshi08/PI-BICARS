# Script pour corriger le secteur d'Actuarial
$filePath = "C:\PROJETS-DEVELOPPEMENT\Analyse_Donnees_CLEAN\project\src\components\ModuleNavigation.tsx"

Write-Host "📄 Modification de : $filePath" -ForegroundColor Yellow

# Backup
Copy-Item $filePath "$filePath.backup"
Write-Host "✅ Backup créé" -ForegroundColor Green

# Lire le contenu
$content = Get-Content $filePath -Raw

# Vérifier si actuarial existe
if ($content -match "id:\s*'actuarial'") {
    Write-Host "📍 Actuarial trouvé - Ajout du secteur" -ForegroundColor Cyan
    
    # Pattern pour trouver l'entrée actuarial
    $pattern = "(id:\s*'actuarial'[^}]+)"
    
    # Vérifier si sector existe déjà
    if ($content -match "id:\s*'actuarial'[^}]+sector:") {
        Write-Host "⚠️ Sector existe déjà" -ForegroundColor Yellow
    } else {
        # Ajouter sector: 'insurance'
        $replacement = '$1,' + "`n      sector: 'insurance'"
        $content = $content -replace $pattern, $replacement
        Write-Host "✅ Sector ajouté" -ForegroundColor Green
    }
} else {
    Write-Host "❌ Actuarial non trouvé - Ajout complet nécessaire" -ForegroundColor Red
    # Chercher insurance-core et ajouter après
    $pattern = "(id:\s*'insurance-core'[^}]+})"
    $newItem = @"
$1,
    {
      id: 'actuarial',
      label: t('nav.actuarialAnalytics', 'Actuarial Analytics'),
      icon: Calculator,
      sector: 'insurance'
    }
"@
    $content = $content -replace $pattern, $newItem
    Write-Host "✅ Actuarial ajouté" -ForegroundColor Green
}

# Sauvegarder
$content | Out-File $filePath -Encoding UTF8
Write-Host "✅ Fichier sauvegardé" -ForegroundColor Green
Write-Host "🔄 Relancez l'application ou attendez le hot reload" -ForegroundColor Cyan