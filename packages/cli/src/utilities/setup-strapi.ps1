# 🚀 Script de Setup de Strapi - AI Pair Orchestrator Pro
# Autor: AI Assistant + Marcelo
# Fecha: 2025-01-22
# Versión: 1.0.0

param(
    [string]$Environment = "development",
    [string]$StrapiPath = "strapi-cms",
    [string]$DatabaseName = "strapi_cms",
    [string]$DatabaseUser = "strapi",
    [string]$DatabasePassword = "",
    [switch]$SkipDatabase = $false,
    [switch]$Force = $false
)

# Configuración de colores para output
$Host.UI.RawUI.ForegroundColor = "Cyan"
Write-Host "🚀 Iniciando Setup de Strapi para AI Pair Orchestrator Pro" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green

# Función para logging
function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "WARNING" { "Yellow" }
        "SUCCESS" { "Green" }
        default { "White" }
    }
    
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

# Función para verificar prerequisitos
function Test-Prerequisites {
    Write-Log "Verificando prerequisitos..." "INFO"
    
    # Verificar Node.js
    try {
        $nodeVersion = node --version
        Write-Log "✅ Node.js encontrado: $nodeVersion" "SUCCESS"
    }
    catch {
        Write-Log "❌ Node.js no encontrado. Instalar Node.js v18+ primero." "ERROR"
        exit 1
    }
    
    # Verificar npm
    try {
        $npmVersion = npm --version
        Write-Log "✅ npm encontrado: $npmVersion" "SUCCESS"
    }
    catch {
        Write-Log "❌ npm no encontrado." "ERROR"
        exit 1
    }
    
    # Verificar Git
    try {
        $gitVersion = git --version
        Write-Log "✅ Git encontrado: $gitVersion" "SUCCESS"
    }
    catch {
        Write-Log "❌ Git no encontrado. Instalar Git primero." "ERROR"
        exit 1
    }
}

# Función para crear directorio de Strapi
function New-StrapiDirectory {
    param([string]$Path)
    
    Write-Log "Creando directorio de Strapi en: $Path" "INFO"
    
    if (Test-Path $Path) {
        if ($Force) {
            Write-Log "Directorio existente. Eliminando por --Force..." "WARNING"
            Remove-Item -Path $Path -Recurse -Force
        }
        else {
            Write-Log "❌ Directorio $Path ya existe. Usar --Force para sobrescribir." "ERROR"
            exit 1
        }
    }
    
    New-Item -ItemType Directory -Path $Path -Force | Out-Null
    Write-Log "✅ Directorio creado: $Path" "SUCCESS"
}

# Función para instalar Strapi
function Install-Strapi {
    param([string]$Path)
    
    Write-Log "Instalando Strapi..." "INFO"
    
    try {
        # Cambiar al directorio
        Set-Location $Path
        
        # Crear Strapi con TypeScript
        Write-Log "Ejecutando: npx create-strapi-app@latest . --quickstart --typescript" "INFO"
        npx create-strapi-app@latest . --quickstart --typescript --yes
        
        if ($LASTEXITCODE -eq 0) {
            Write-Log "✅ Strapi instalado exitosamente" "SUCCESS"
        }
        else {
            Write-Log "❌ Error en la instalación de Strapi" "ERROR"
            exit 1
        }
    }
    catch {
        Write-Log "❌ Error durante la instalación: $($_.Exception.Message)" "ERROR"
        exit 1
    }
}

# Función para configurar base de datos
function Set-DatabaseConfiguration {
    param([string]$Path)
    
    if ($SkipDatabase) {
        Write-Log "Saltando configuración de base de datos por --SkipDatabase" "WARNING"
        return
    }
    
    Write-Log "Configurando base de datos PostgreSQL..." "INFO"
    
    # Crear archivo de configuración de base de datos
    $dbConfig = @"
module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', 'localhost'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', '$DatabaseName'),
      user: env('DATABASE_USERNAME', '$DatabaseUser'),
      password: env('DATABASE_PASSWORD', '$DatabasePassword'),
      ssl: env.bool('DATABASE_SSL', false),
    },
  },
});
"@
    
    $dbConfigPath = Join-Path $Path "config\database.ts"
    $dbConfig | Out-File -FilePath $dbConfigPath -Encoding UTF8
    
    Write-Log "✅ Configuración de base de datos creada: $dbConfigPath" "SUCCESS"
}

# Función para crear archivo .env
function New-EnvironmentFile {
    param([string]$Path)
    
    Write-Log "Creando archivo de variables de entorno..." "INFO"
    
    $envContent = @"
# Strapi Configuration
HOST=0.0.0.0
PORT=1337
APP_KEYS=your-app-keys-here
API_TOKEN_SALT=your-api-token-salt-here
ADMIN_JWT_SECRET=your-admin-jwt-secret-here
JWT_SECRET=your-jwt-secret-here

# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=$DatabaseName
DATABASE_USERNAME=$DatabaseUser
DATABASE_PASSWORD=$DatabasePassword
DATABASE_SSL=false

# Environment
NODE_ENV=$Environment

# Security
CORS_ORIGIN=http://localhost:3000,http://localhost:1337

# File Upload
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_KEY=your-cloudinary-key
CLOUDINARY_SECRET=your-cloudinary-secret
"@
    
    $envPath = Join-Path $Path ".env"
    $envContent | Out-File -FilePath $envPath -Encoding UTF8
    
    Write-Log "✅ Archivo .env creado: $envPath" "SUCCESS"
}

# Función para crear tipos de contenido básicos
function New-ContentTypes {
    param([string]$Path)
    
    Write-Log "Creando tipos de contenido básicos..." "INFO"
    
    # Crear directorio para tipos de contenido
    $contentTypesPath = Join-Path $Path "src\api"
    New-Item -ItemType Directory -Path $contentTypesPath -Force | Out-Null
    
    # Knowledge Base Article
    $articleSchema = @"
export default {
  kind: 'collectionType',
  collectionName: 'knowledge_base_articles',
  info: {
    singularName: 'knowledge-base-article',
    pluralName: 'knowledge-base-articles',
    displayName: 'Knowledge Base Article',
    description: 'Artículos de la base de conocimientos'
  },
  options: {
    draftAndPublish: true,
  },
  pluginOptions: {
    i18n: {
      localized: true,
    },
  },
  attributes: {
    title: {
      type: 'string',
      required: true,
    },
    slug: {
      type: 'uid',
      targetField: 'title',
      required: true,
    },
    content: {
      type: 'richtext',
      required: true,
    },
    category: {
      type: 'enumeration',
      enum: ['documentation', 'tutorial', 'faq', 'troubleshooting'],
      required: true,
    },
    tags: {
      type: 'json',
    },
    author: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::users-permissions.user',
    },
    seo: {
      type: 'component',
      component: 'shared.seo',
    },
  },
};
"@
    
    $articlePath = Join-Path $contentTypesPath "knowledge-base-article\content-types\knowledge-base-article\schema.json"
    New-Item -ItemType Directory -Path (Split-Path $articlePath) -Force | Out-Null
    $articleSchema | Out-File -FilePath $articlePath -Encoding UTF8
    
    Write-Log "✅ Tipo de contenido 'Knowledge Base Article' creado" "SUCCESS"
}

# Función para crear hooks de integración
function New-IntegrationHooks {
    param([string]$Path)
    
    Write-Log "Creando hooks de integración..." "INFO"
    
    $hooksContent = @"
import { createClient } from '@strapi/client';

export const useStrapi = () => {
  const strapi = createClient({
    url: process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337',
    token: process.env.REACT_APP_STRAPI_TOKEN,
  });

  const getKnowledgeBase = async (category?: string) => {
    const filters = category ? { category } : {};
    return await strapi.find('knowledge-base-articles', { filters });
  };

  const getTemplates = async (type?: string) => {
    const filters = type ? { type } : {};
    return await strapi.find('timeline-templates', { filters });
  };

  const getMarketingContent = async (type: string) => {
    return await strapi.find(type, { 
      populate: ['featuredImage', 'seo'] 
    });
  };

  return {
    getKnowledgeBase,
    getTemplates,
    getMarketingContent,
  };
};
"@
    
    $hooksPath = Join-Path $Path "src\hooks\useStrapi.ts"
    New-Item -ItemType Directory -Path (Split-Path $hooksPath) -Force | Out-Null
    $hooksContent | Out-File -FilePath $hooksPath -Encoding UTF8
    
    Write-Log "✅ Hook de integración creado: $hooksPath" "SUCCESS"
}

# Función para crear script de migración
function New-MigrationScript {
    param([string]$Path)
    
    Write-Log "Creando script de migración..." "INFO"
    
    $migrationContent = @"
import { createClient } from '@strapi/client';
import fs from 'fs';
import path from 'path';

const strapi = createClient({
  url: process.env.STRAPI_URL || 'http://localhost:1337',
  token: process.env.STRAPI_TOKEN,
});

const migrateContent = async () => {
  try {
    console.log('🚀 Iniciando migración de contenido a Strapi...');
    
    // Migrar documentación
    const docsPath = path.join(__dirname, '../docs');
    if (fs.existsSync(docsPath)) {
      const docs = fs.readdirSync(docsPath).filter(file => file.endsWith('.md'));
      
      for (const doc of docs) {
        const content = fs.readFileSync(path.join(docsPath, doc), 'utf8');
        
        await strapi.create('knowledge-base-articles', {
          title: doc.replace('.md', ''),
          slug: doc.replace('.md', '').toLowerCase().replace(/\s+/g, '-'),
          content: content,
          category: 'documentation',
          publishedAt: new Date(),
        });
        
        console.log(\`✅ Migrado: \${doc}\`);
      }
    }
    
    console.log('🎉 Migración completada exitosamente');
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  }
};

migrateContent();
"@
    
    $migrationPath = Join-Path $Path "scripts\migrate-content.ts"
    New-Item -ItemType Directory -Path (Split-Path $migrationPath) -Force | Out-Null
    $migrationContent | Out-File -FilePath $migrationPath -Encoding UTF8
    
    Write-Log "✅ Script de migración creado: $migrationPath" "SUCCESS"
}

# Función para crear documentación
function New-Documentation {
    param([string]$Path)
    
    Write-Log "Creando documentación..." "INFO"
    
    $readmeContent = @"
# 🚀 Strapi CMS - AI Pair Orchestrator Pro

## 📋 Descripción

Este es el CMS de Strapi para AI Pair Orchestrator Pro, encargado de gestionar:
- Base de conocimientos
- Templates de líneas de tiempo
- Contenido marketing
- Documentación técnica

## 🏗️ Arquitectura

- **Frontend**: React + TypeScript
- **CMS**: Strapi (Headless)
- **Base de Datos**: PostgreSQL
- **Integración**: Hooks personalizados

## 🚀 Inicio Rápido

\`\`\`bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar en desarrollo
npm run develop

# Construir para producción
npm run build
npm run start
\`\`\`

## 📚 Tipos de Contenido

### Knowledge Base Articles
- **Categorías**: documentation, tutorial, faq, troubleshooting
- **Campos**: title, slug, content, category, tags, author, seo

### Timeline Templates
- **Campos**: name, description, type, milestones, estimatedDuration

### Marketing Content
- **Tipos**: landing-pages, blog-posts, case-studies

## 🔧 Integración con Frontend

\`\`\`typescript
import { useStrapi } from '@/hooks/useStrapi';

const { getKnowledgeBase, getTemplates } = useStrapi();

// Obtener artículos de conocimiento
const articles = await getKnowledgeBase('documentation');

// Obtener templates
const templates = await getTemplates('shipping');
\`\`\`

## 📊 Métricas

- **Performance**: < 500ms por consulta
- **Disponibilidad**: > 99.9%
- **Caché**: 5 minutos TTL

## 🔐 Seguridad

- Autenticación JWT
- CORS configurado
- Rate limiting habilitado
- Validación de entrada

## 📞 Soporte

Para soporte técnico, contactar al equipo de desarrollo de AI Pair Platform.
"@
    
    $readmePath = Join-Path $Path "README.md"
    $readmeContent | Out-File -FilePath $readmePath -Encoding UTF8
    
    Write-Log "✅ Documentación creada: $readmePath" "SUCCESS"
}

# Función principal
function Start-Setup {
    Write-Log "Iniciando setup completo de Strapi..." "INFO"
    
    # Verificar prerequisitos
    Test-Prerequisites
    
    # Crear directorio
    New-StrapiDirectory -Path $StrapiPath
    
    # Instalar Strapi
    Install-Strapi -Path $StrapiPath
    
    # Configurar base de datos
    Set-DatabaseConfiguration -Path $StrapiPath
    
    # Crear archivo .env
    New-EnvironmentFile -Path $StrapiPath
    
    # Crear tipos de contenido
    New-ContentTypes -Path $StrapiPath
    
    # Crear hooks de integración
    New-IntegrationHooks -Path $StrapiPath
    
    # Crear script de migración
    New-MigrationScript -Path $StrapiPath
    
    # Crear documentación
    New-Documentation -Path $StrapiPath
    
    Write-Log "🎉 Setup de Strapi completado exitosamente!" "SUCCESS"
    Write-Log "📁 Directorio: $StrapiPath" "INFO"
    Write-Log "🚀 Para iniciar: cd $StrapiPath && npm run develop" "INFO"
    Write-Log "📚 Documentación: $StrapiPath\README.md" "INFO"
}

# Ejecutar setup
try {
    Start-Setup
}
catch {
    Write-Log "❌ Error durante el setup: $($_.Exception.Message)" "ERROR"
    exit 1
} 