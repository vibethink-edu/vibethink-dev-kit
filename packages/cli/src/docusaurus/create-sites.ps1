# Script para crear sitios Docusaurus gradualmente
# VThink 1.0 - Documentación Multi-sitio

param(
    [string]$SiteName = "",
    [switch]$All = $false,
    [switch]$Validate = $false,
    [switch]$Next = $false
)

Write-Host "🚀 VThink 1.0 - Creación de Sitios Docusaurus" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Configuración de sitios en orden de prioridad
$sites = @(
    @{
        Name = "docusaurus-api"
        Description = "Documentación de API"
        Template = "classic"
        Features = @("API Reference", "Swagger Integration", "Code Examples")
        Priority = 1
        Status = "pending"
    },
    @{
        Name = "docusaurus-vthink"
        Description = "Documentación de Metodología VThink"
        Template = "classic"
        Features = @("Methodology", "Best Practices", "Templates")
        Priority = 2
        Status = "pending"
    },
    @{
        Name = "docusaurus-archives"
        Description = "Documentación Histórica"
        Template = "classic"
        Features = @("Legacy Docs", "Migration History", "Archives")
        Priority = 3
        Status = "pending"
    }
)

# Verificar sitios existentes
$existingSites = @("docusaurus-docs", "docusaurus-dev")
foreach ($site in $existingSites) {
    if (Test-Path $site) {
        $sites | Where-Object { $_.Name -eq $site } | ForEach-Object { $_.Status = "completed" }
    }
}

# Función para crear un sitio
function Create-DocusaurusSite {
    param(
        [string]$SiteName,
        [string]$Description,
        [string]$Template,
        [string[]]$Features
    )
    
    Write-Host "📁 Creando sitio: $SiteName" -ForegroundColor Yellow
    
    if (Test-Path $SiteName) {
        Write-Host "⚠️  El sitio $SiteName ya existe. Saltando..." -ForegroundColor Yellow
        return
    }
    
    try {
        # Crear sitio con Docusaurus
        Write-Host "  🔧 Ejecutando: npx create-docusaurus@latest $SiteName $Template --typescript" -ForegroundColor Gray
        npx create-docusaurus@latest $SiteName $Template --typescript
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Sitio $SiteName creado exitosamente" -ForegroundColor Green
            
            # Configurar características específicas
            Configure-SiteFeatures -SiteName $SiteName -Features $Features
            
            # Crear estructura de documentación
            Create-SiteStructure -SiteName $SiteName -Description $Description
            
            # Actualizar estado
            $sites | Where-Object { $_.Name -eq $SiteName } | ForEach-Object { $_.Status = "completed" }
            
        } else {
            Write-Host "❌ Error al crear sitio $SiteName" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "❌ Error: $_" -ForegroundColor Red
    }
}

# Función para configurar características del sitio
function Configure-SiteFeatures {
    param(
        [string]$SiteName,
        [string[]]$Features
    )
    
    Write-Host "🔧 Configurando características para $SiteName..." -ForegroundColor Blue
    
    # Crear archivo de configuración específico
    $configContent = @"
// Configuración específica para $SiteName
// VThink 1.0 - Documentación Multi-sitio

import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: '$SiteName',
  tagline: 'Documentación especializada',
  favicon: 'img/favicon.ico',
  url: 'https://your-domain.com',
  baseUrl: '/$SiteName/',
  organizationName: 'vthink',
  projectName: '$SiteName',
  
  // Características específicas
  features: $($Features | ConvertTo-Json),
  
  // Configuración de i18n
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
  },
  
  // Configuración de plugins
  plugins: [
    // Plugins específicos según el tipo de sitio
  ],
  
  // Configuración de temas
  themes: ['@docusaurus/theme-classic'],
  
  // Configuración de presets
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/your-org/your-repo/edit/main/',
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/your-org/your-repo/edit/main/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
  ],
  
  themeConfig: {
    navbar: {
      title: '$SiteName',
      logo: {
        alt: '$SiteName Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentación',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/your-org/your-repo',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentación',
          items: [
            {
              label: 'Inicio',
              to: '/',
            },
          ],
        },
      ],
      copyright: `Copyright © \${new Date().getFullYear()} VThink. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  },
};

export default config;
"@
    
    Set-Content -Path "$SiteName/docusaurus.config.ts" -Value $configContent
    Write-Host "✅ Configuración creada para $SiteName" -ForegroundColor Green
}

# Función para crear estructura de documentación
function Create-SiteStructure {
    param(
        [string]$SiteName,
        [string]$Description
    )
    
    Write-Host "📚 Creando estructura de documentación para $SiteName..." -ForegroundColor Blue
    
    # Crear directorios básicos
    $directories = @(
        "docs/roadmap",
        "docs/architecture", 
        "docs/decisions",
        "docs/templates",
        "docs/examples",
        "src/components",
        "src/css",
        "static/img"
    )
    
    foreach ($dir in $directories) {
        $fullPath = "$SiteName/$dir"
        if (!(Test-Path $fullPath)) {
            New-Item -ItemType Directory -Path $fullPath -Force
            Write-Host "  📁 Creado: $dir" -ForegroundColor Gray
        }
    }
    
    # Crear archivos básicos
    $basicFiles = @(
        @{ Path = "docs/README.md"; Content = "# Bienvenido a $SiteName`n`n$Description`n`n## Características`n`n- Documentación especializada`n- Soporte multi-idioma`n- Navegación intuitiva`n`n## Empezar`n`nConsulta la documentación en el menú lateral." },
        @{ Path = "docs/roadmap/README.md"; Content = "# Roadmap de $SiteName`n`nPlan de desarrollo y funcionalidades futuras.`n`n## Funcionalidades Planificadas`n`n- [ ] Migración de documentación existente`n- [ ] Configuración de autenticación`n- [ ] Integración con otros sitios`n- [ ] Optimización de rendimiento" },
        @{ Path = "docs/architecture/README.md"; Content = "# Arquitectura de $SiteName`n`nDocumentación de arquitectura y decisiones técnicas.`n`n## Componentes Principales`n`n- **Docusaurus**: Framework de documentación`n- **TypeScript**: Tipado estático`n- **React**: Interfaz de usuario`n- **i18n**: Soporte multi-idioma`n`n## Decisiones Técnicas`n`n- Uso de Docusaurus v3`n- Configuración TypeScript`n- Estructura modular`n- Separación de responsabilidades" },
        @{ Path = "docs/decisions/README.md"; Content = "# Decisiones de Arquitectura`n`nRegistro de decisiones técnicas importantes.`n`n## ADR-001: Migración Gradual`n`n**Fecha**: $(Get-Date -Format 'yyyy-MM-dd')`n**Estado**: Aceptado`n`n### Contexto`n`nNecesitamos migrar documentación existente a múltiples sitios Docusaurus.`n`n### Decisión`n`nImplementar migración gradual, sitio por sitio, para mantener control de calidad.`n`n### Consecuencias`n`n- Mejor control de calidad`n- Aprendizaje incremental`n- Gestión de errores más fácil`n- Documentación completa por sitio" }
    )
    
    foreach ($file in $basicFiles) {
        $fullPath = "$SiteName/$($file.Path)"
        if (!(Test-Path $fullPath)) {
            Set-Content -Path $fullPath -Value $file.Content
            Write-Host "  📄 Creado: $($file.Path)" -ForegroundColor Gray
        }
    }
    
    Write-Host "✅ Estructura creada para $SiteName" -ForegroundColor Green
}

# Función para validar sitios existentes
function Validate-ExistingSites {
    Write-Host "🔍 Validando sitios existentes..." -ForegroundColor Blue
    
    $allSites = @("docusaurus-docs", "docusaurus-dev") + ($sites | ForEach-Object { $_.Name })
    
    foreach ($site in $allSites) {
        if (Test-Path $site) {
            Write-Host "✅ $site existe" -ForegroundColor Green
            
            # Verificar si puede ejecutarse
            $packageJson = "$site/package.json"
            if (Test-Path $packageJson) {
                Write-Host "  📦 package.json encontrado" -ForegroundColor Gray
                
                # Verificar dependencias
                $nodeModules = "$site/node_modules"
                if (Test-Path $nodeModules) {
                    Write-Host "  📚 node_modules encontrado" -ForegroundColor Gray
                } else {
                    Write-Host "  ⚠️  node_modules no encontrado - ejecutar 'npm install'" -ForegroundColor Yellow
                }
            } else {
                Write-Host "  ❌ package.json no encontrado" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ $site no existe" -ForegroundColor Red
        }
    }
}

# Función para obtener el siguiente sitio a crear
function Get-NextSite {
    $nextSite = $sites | Where-Object { $_.Status -eq "pending" } | Sort-Object Priority | Select-Object -First 1
    return $nextSite
}

# Función principal
function Main {
    if ($Validate) {
        Validate-ExistingSites
        return
    }
    
    if ($Next) {
        $nextSite = Get-NextSite
        if ($nextSite) {
            Write-Host "🎯 Creando siguiente sitio: $($nextSite.Name)" -ForegroundColor Green
            Create-DocusaurusSite -SiteName $nextSite.Name -Description $nextSite.Description -Template $nextSite.Template -Features $nextSite.Features
        } else {
            Write-Host "🎉 ¡Todos los sitios han sido creados!" -ForegroundColor Green
        }
        return
    }
    
    if ($All) {
        Write-Host "🚀 Creando todos los sitios Docusaurus..." -ForegroundColor Green
        
        foreach ($site in $sites) {
            Create-DocusaurusSite -SiteName $site.Name -Description $site.Description -Template $site.Template -Features $site.Features
            Write-Host ""
        }
        
        Write-Host "🎉 Todos los sitios han sido creados!" -ForegroundColor Green
        Write-Host "📋 Próximos pasos:" -ForegroundColor Yellow
        Write-Host "  1. Configurar cada sitio individualmente" -ForegroundColor White
        Write-Host "  2. Migrar documentación existente" -ForegroundColor White
        Write-Host "  3. Configurar navegación entre sitios" -ForegroundColor White
        Write-Host "  4. Implementar autenticación si es necesario" -ForegroundColor White
        
    } elseif ($SiteName) {
        $site = $sites | Where-Object { $_.Name -eq $SiteName }
        if ($site) {
            Create-DocusaurusSite -SiteName $site.Name -Description $site.Description -Template $site.Template -Features $site.Features
        } else {
            Write-Host "❌ Sitio '$SiteName' no encontrado en la configuración" -ForegroundColor Red
            Write-Host "Sitios disponibles:" -ForegroundColor Yellow
            $sites | ForEach-Object { Write-Host "  - $($_.Name)" -ForegroundColor White }
        }
    } else {
        Write-Host "📋 Uso del script:" -ForegroundColor Yellow
        Write-Host "  .\create-docusaurus-sites.ps1 -All                    # Crear todos los sitios" -ForegroundColor White
        Write-Host "  .\create-docusaurus-sites.ps1 -Next                   # Crear siguiente sitio" -ForegroundColor White
        Write-Host "  .\create-docusaurus-sites.ps1 -SiteName 'docusaurus-api'  # Crear sitio específico" -ForegroundColor White
        Write-Host "  .\create-docusaurus-sites.ps1 -Validate               # Validar sitios existentes" -ForegroundColor White
        Write-Host ""
        Write-Host "Estado actual:" -ForegroundColor Yellow
        $sites | ForEach-Object { 
            $status = if ($_.Status -eq "completed") { "✅" } else { "⏳" }
            Write-Host "  $status $($_.Name): $($_.Description)" -ForegroundColor White 
        }
    }
}

# Ejecutar función principal
Main 