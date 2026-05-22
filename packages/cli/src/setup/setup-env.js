/**
 * Setup Environment Variables Automatically
 *
 * Este script configura automáticamente las variables de entorno
 * para evitar la configuración manual repetitiva
 *
 * @author AI Pair Platform - Backend Team
 * @version 1.0.0
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENV_TEMPLATE = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://pikywaoqlekupfynnclg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_API_KEY_HERE

# Development Configuration
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_APP_VERSION=2.1.0

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_CHAT=true
NEXT_PUBLIC_ENABLE_VOICE_INTEGRATION=false
NEXT_PUBLIC_ENABLE_MEETING_PROCESSOR=true

# Support Configuration
NEXT_PUBLIC_SUPPORT_EMAIL=support@VibeThink.co
NEXT_PUBLIC_SUPPORT_PHONE=+1234567890

# Security Configuration
NEXT_PUBLIC_ENABLE_RLS=false
NEXT_PUBLIC_ENABLE_AUDIT_LOGS=true

# AI Configuration (opcional)
# NEXT_PUBLIC_OPENAI_API_KEY=sk-your-openai-key
# NEXT_PUBLIC_ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
`;

function setupEnvironment() {
  // TODO: log '🔧 Configurando variables de entorno...\n'

  const envPath = path.join(__dirname, ".env.local");

  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, ENV_TEMPLATE);
    // TODO: log '✅ .env.local creado automáticamente'
    // TODO: log '⚠️  IMPORTANTE: Reemplaza YOUR_API_KEY_HERE con tu API key real'
    // TODO: log '   API Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpa3l3YW9xbGVrdXBmeW5uY2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTE3NTgsImV4cCI6MjA2NTUyNzc1OH0.jt_uLXm-Gh'
  } else {
    // TODO: log '✅ .env.local ya existe'

    // Verificar si tiene la API key correcta
    const content = fs.readFileSync(envPath, "utf8");
    if (content.includes("YOUR_API_KEY_HERE")) {
      // TODO: log '⚠️  Reemplaza YOUR_API_KEY_HERE con tu API key real'
      // TODO: log '   API Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpa3l3YW9xbGVrdXBmeW5uY2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTE3NTgsImV4cCI6MjA2NTUyNzc1OH0.jt_uLXm-Gh'
    } else {
      // TODO: log '✅ API key ya configurada'
    }
  }

  // TODO: log '\n📋 Archivos de configuración:'
  // TODO: log '   - .env.local (variables locales)'
  // TODO: log '   - .env.production (variables de producción)'
  // TODO: log '   - .env.example (ejemplo de configuración)'

  // TODO: log '\n�� Próximos pasos:'
  // TODO: log '   1. Reemplaza YOUR_API_KEY_HERE con tu API key'
  // TODO: log '   2. Ejecuta: npm run test:supabase'
  // TODO: log '   3. Ejecuta: npm run dev'
}

setupEnvironment();
