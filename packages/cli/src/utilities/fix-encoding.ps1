# Script para limpiar problemas de encoding en archivos TypeScript/React
# XTP v4.6 - Encoding Fix Script

param(
    [string]$Path = "src",
    [switch]$Backup = $true,
    [switch]$Verbose = $false
)

Write-Host "XTP v4.6 - Encoding Fix Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Crear backup si se solicita
if ($Backup) {
    $backupPath = "backups/encoding-fix-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Write-Host "Creando backup en: $backupPath" -ForegroundColor Yellow
    
    if (!(Test-Path "backups")) {
        New-Item -ItemType Directory -Path "backups" -Force | Out-Null
    }
    
    Copy-Item -Path $Path -Destination $backupPath -Recurse -Force
    Write-Host "Backup creado exitosamente" -ForegroundColor Green
}

# Función para limpiar archivo
function Fix-FileEncoding {
    param([string]$FilePath)
    
    try {
        # Leer el archivo como bytes
        $bytes = [System.IO.File]::ReadAllBytes($FilePath)
        
        # Detectar y remover BOM UTF-8
        if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
            $bytes = $bytes[3..($bytes.Length-1)]
            if ($Verbose) { Write-Host "  Removido BOM UTF-8" -ForegroundColor Yellow }
        }
        
        # Filtrar caracteres de control problemáticos (mantener tab, newline, carriage return)
        $cleanBytes = @()
        for ($i = 0; $i -lt $bytes.Length; $i++) {
            $byte = $bytes[$i]
            # Mantener caracteres válidos: 0x09 (tab), 0x0A (newline), 0x0D (carriage return), 0x20-0x7E (printable ASCII)
            if ($byte -eq 0x09 -or $byte -eq 0x0A -or $byte -eq 0x0D -or ($byte -ge 0x20 -and $byte -le 0x7E)) {
                $cleanBytes += $byte
            } elseif ($Verbose) {
                Write-Host "  Removido carácter inválido: 0x$($byte.ToString('X2'))" -ForegroundColor Red
            }
        }
        
        # Escribir archivo limpio con encoding UTF-8 sin BOM
        [System.IO.File]::WriteAllBytes($FilePath, $cleanBytes)
        
        return $true
    }
    catch {
        Write-Host "  Error procesando $FilePath : $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Procesar archivos TypeScript/React
$extensions = @("*.ts", "*.tsx", "*.js", "*.jsx")
$totalFiles = 0
$fixedFiles = 0
$errorFiles = 0

foreach ($ext in $extensions) {
    $files = Get-ChildItem -Path $Path -Filter $ext -Recurse -ErrorAction SilentlyContinue
    
    foreach ($file in $files) {
        $totalFiles++
        Write-Host "Procesando: $($file.FullName)" -ForegroundColor Blue
        
        if (Fix-FileEncoding -FilePath $file.FullName) {
            $fixedFiles++
            Write-Host "  Archivo limpiado" -ForegroundColor Green
        } else {
            $errorFiles++
        }
    }
}

# Resumen
Write-Host "`nResumen de la limpieza:" -ForegroundColor Cyan
Write-Host "   Total de archivos procesados: $totalFiles" -ForegroundColor White
Write-Host "   Archivos limpiados exitosamente: $fixedFiles" -ForegroundColor Green
Write-Host "   Archivos con errores: $errorFiles" -ForegroundColor Red

if ($errorFiles -eq 0) {
    Write-Host "`nLimpieza completada exitosamente!" -ForegroundColor Green
    Write-Host "Recomendación: Ejecuta 'npm run build' para verificar que todo funciona correctamente" -ForegroundColor Yellow
} else {
    Write-Host "`nAlgunos archivos tuvieron problemas. Revisa los errores arriba." -ForegroundColor Yellow
} 