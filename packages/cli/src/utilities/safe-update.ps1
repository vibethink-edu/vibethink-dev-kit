# safe-update.ps1 - Script de Actualización Segura para Windows PowerShell
# Actualiza dependencias de forma segura con rollback automático

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("react19", "typescript", "vite", "tailwind", "all")]
    [string]$UpdateType,
    
    [switch]$SkipBackup,
    [switch]$Force
)

Write-Host "🚀 Iniciando actualización segura: $UpdateType" -ForegroundColor Cyan

# Función para verificar estado
function Test-ProjectState {
    Write-Host "🔍 Verificando estado del proyecto..." -ForegroundColor Yellow
    
    # TypeScript check
    try {
        npm run type-check | Out-Null
        Write-Host "✅ TypeScript check pasado" -ForegroundColor Green
    } catch {
        Write-Host "❌ TypeScript check falló" -ForegroundColor Red
        return $false
    }
    
    # Build check
    try {
        npm run build | Out-Null
        Write-Host "✅ Build exitoso" -ForegroundColor Green
    } catch {
        Write-Host "❌ Build falló" -ForegroundColor Red
        return $false
    }
    
    return $true
}

# Función para rollback automático
function Invoke-Rollback {
    Write-Host "🔄 Rollback automático iniciado..." -ForegroundColor Red
    & ".\scripts\rollback.ps1"
    exit 1
}

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ No se encontró package.json. Asegúrate de estar en el directorio del proyecto." -ForegroundColor Red
    exit 1
}

# Crear backup si no se omite
if (-not $SkipBackup) {
    Write-Host "💾 Creando backup antes de la actualización..." -ForegroundColor Yellow
    & ".\scripts\backup.ps1"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Backup falló. Abortando actualización." -ForegroundColor Red
        exit 1
    }
}

# Verificar estado inicial
Write-Host "`n🔍 Verificando estado inicial..." -ForegroundColor Yellow
if (-not (Test-ProjectState)) {
    Write-Host "❌ Estado inicial no válido. Abortando actualización." -ForegroundColor Red
    exit 1
}

# Definir actualizaciones según el tipo
$updates = @()

switch ($UpdateType) {
    "react19" {
        $updates = @(
            @{ Package = "react"; Version = "rc"; Description = "React 19 RC" },
            @{ Package = "react-dom"; Version = "rc"; Description = "React DOM 19 RC" }
        )
    }
    "typescript" {
        $updates = @(
            @{ Package = "typescript"; Version = "latest"; Description = "TypeScript Latest" }
        )
    }
    "vite" {
        $updates = @(
            @{ Package = "vite"; Version = "latest"; Description = "Vite Latest" }
        )
    }
    "tailwind" {
        $updates = @(
            @{ Package = "tailwindcss"; Version = "next"; Description = "Tailwind CSS v4" }
        )
    }
    "all" {
        $updates = @(
            @{ Package = "react"; Version = "rc"; Description = "React 19 RC" },
            @{ Package = "react-dom"; Version = "rc"; Description = "React DOM 19 RC" },
            @{ Package = "typescript"; Version = "latest"; Description = "TypeScript Latest" },
            @{ Package = "vite"; Version = "latest"; Description = "Vite Latest" }
        )
    }
}

# Procesar actualizaciones
foreach ($update in $updates) {
    Write-Host "`n📦 Actualizando $($update.Package) a $($update.Version)..." -ForegroundColor Yellow
    
    try {
        $installCommand = "npm install $($update.Package)@$($update.Version)"
        Write-Host "Ejecutando: $installCommand" -ForegroundColor Gray
        
        Invoke-Expression $installCommand
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $($update.Description) actualizado exitosamente" -ForegroundColor Green
        } else {
            Write-Host "❌ Error al actualizar $($update.Package)" -ForegroundColor Red
            if (-not $Force) {
                Invoke-Rollback
            }
        }
    } catch {
        Write-Host "❌ Error al actualizar $($update.Package): $_" -ForegroundColor Red
        if (-not $Force) {
            Invoke-Rollback
        }
    }
}

# Verificar estado después de la actualización
Write-Host "`n🔍 Verificando estado después de la actualización..." -ForegroundColor Yellow

# TypeScript check
try {
    npm run type-check | Out-Null
    Write-Host "✅ TypeScript check pasado" -ForegroundColor Green
} catch {
    Write-Host "❌ TypeScript check falló después de la actualización" -ForegroundColor Red
    if (-not $Force) {
        Invoke-Rollback
    }
}

# Build check
try {
    npm run build | Out-Null
    Write-Host "✅ Build exitoso" -ForegroundColor Green
} catch {
    Write-Host "❌ Build falló después de la actualización" -ForegroundColor Red
    if (-not $Force) {
        Invoke-Rollback
    }
}

# Test dev server
Write-Host "`n🚀 Probando servidor de desarrollo..." -ForegroundColor Yellow
try {
    $devProcess = Start-Process npm -ArgumentList "run", "dev" -PassThru -WindowStyle Hidden
    
    # Esperar un poco para que el servidor inicie
    Start-Sleep -Seconds 5
    
    if ($devProcess.HasExited -and $devProcess.ExitCode -ne 0) {
        Write-Host "❌ Servidor de desarrollo falló" -ForegroundColor Red
        if (-not $Force) {
            Invoke-Rollback
        }
    } else {
        Write-Host "✅ Servidor de desarrollo iniciado correctamente" -ForegroundColor Green
        # Terminar el proceso para continuar
        Stop-Process -Id $devProcess.Id -Force -ErrorAction SilentlyContinue
    }
} catch {
    Write-Host "⚠️  No se pudo probar el servidor de desarrollo: $_" -ForegroundColor Yellow
}

Write-Host "`n🎉 Actualización completada exitosamente!" -ForegroundColor Green
Write-Host "📝 Tipo de actualización: $UpdateType" -ForegroundColor Cyan
Write-Host "📦 Paquetes actualizados: $($updates.Count)" -ForegroundColor Cyan

if (-not $SkipBackup) {
    Write-Host "💾 Backup disponible para rollback si es necesario" -ForegroundColor Yellow
    Write-Host "🔄 Para rollback: .\scripts\rollback.ps1" -ForegroundColor Yellow
}

Write-Host "`n🚀 Ejecutando: npm run dev" -ForegroundColor Cyan
npm run dev 