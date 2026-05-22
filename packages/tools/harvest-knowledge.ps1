# Script para migrar contenido a sitios Docusaurus
Write-Host "Migrando contenido a sitios Docusaurus..." -ForegroundColor Green

# Configuracion de migracion
$migrationMap = @{
    "docs/" = "docusaurus-docs/docs/"
    "docs/architecture/" = "docusaurus-dev/docs/architecture/"
    "docs/development/" = "docusaurus-dev/docs/development/"
    "docs/integrations/" = "docusaurus-api/docs/integrations/"
    "docs/methodologies/VThink-1.0/" = "docusaurus-vthink/docs/"
    "docs/projects/" = "docusaurus-archives/docs/projects/"
}

# Función para copiar archivos
function Copy-Documentation {
    param(
        [string]$Source,
        [string]$Destination
    )
    
    if (Test-Path $Source) {
        if (!(Test-Path $Destination)) {
            New-Item -ItemType Directory -Path $Destination -Force | Out-Null
        }
        
        Copy-Item -Path "$Source*" -Destination $Destination -Recurse -Force
        Write-Host "  ✅ Copiado: $Source -> $Destination" -ForegroundColor Green
        return $true
    } else {
        Write-Host "  ❌ No existe: $Source" -ForegroundColor Red
        return $false
    }
}

# Función para convertir markdown
function Convert-Markdown {
    param([string]$FilePath)
    
    if (Test-Path $FilePath) {
        $content = Get-Content $FilePath -Raw
        $content = $content -replace "\[\[", "[" -replace "\]\]", "]"
        $content = $content -replace "!\[.*?\]\(.*?\)", "![image]()"
        Set-Content $FilePath $content
    }
}

Write-Host "Iniciando migracion de contenido..." -ForegroundColor Yellow

$successCount = 0
$totalCount = $migrationMap.Count

foreach ($mapping in $migrationMap.GetEnumerator()) {
    Write-Host "Migrando: $($mapping.Key) -> $($mapping.Value)" -ForegroundColor Cyan
    
    if (Copy-Documentation -Source $mapping.Key -Destination $mapping.Value) {
        $successCount++
        
        # Convertir archivos markdown
        if (Test-Path $mapping.Value) {
            Get-ChildItem -Path $mapping.Value -Filter "*.md" -Recurse | ForEach-Object {
                Convert-Markdown -FilePath $_.FullName
            }
        }
    }
}

Write-Host "`nResumen de migracion:" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host "Migraciones exitosas: $successCount/$totalCount" -ForegroundColor White

if ($successCount -eq $totalCount) {
    Write-Host "🎉 Migracion completada exitosamente!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Algunas migraciones fallaron" -ForegroundColor Yellow
}

Write-Host "`nPróximos pasos:" -ForegroundColor Yellow
Write-Host "1. Revisar contenido migrado" -ForegroundColor White
Write-Host "2. Actualizar enlaces rotos" -ForegroundColor White
Write-Host "3. Configurar sidebars" -ForegroundColor White
Write-Host "4. Validar sitios" -ForegroundColor White 