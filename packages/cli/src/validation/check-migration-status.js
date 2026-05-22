/**
 * Check Migration Status
 *
 * Script simple para verificar si las tablas del sistema de permisos existen
 */

const { createClient } = require("@supabase/supabase-js");

// Configuración básica - usar variables de entorno del navegador
const supabaseUrl = "https://pikywaoqlekupfynnclg.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpa3l3YW9xbGVrdXBmeW5ubGNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI4NzQsImV4cCI6MjA1MDU0ODg3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkMigrationStatus() {
  // TODO: log '🔍 Verificando estado de la migración...\n'

  try {
    // Verificar conexión básica
    // TODO: log '1️⃣ Verificando conexión...'
    const { data: testData, error: testError } = await supabase
      .from("companies")
      .select("count")
      .limit(1);

    if (testError) {
      // TODO: log '❌ Error de conexión:' testError.message
      return;
    }
    // TODO: log '✅ Conexión exitosa\n'

    // Verificar tablas del sistema
    // TODO: log '2️⃣ Verificando tablas del sistema...'

    const tables = [
      "departments",
      "department_permissions",
      "department_data_access",
      "user_department_memberships",
      "permission_logs",
      "data_access_logs",
    ];

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select("count").limit(1);

        if (error) {
          // TODO: log `❌ ${table}: ${error.message}`
        } else {
          // TODO: log `✅ ${table}: Existe`
        }
      } catch (err) {
        // TODO: log `❌ ${table}: No existe`
      }
    }

    // TODO: log '\n📊 RESUMEN:'
    // TODO: log 'Si ves ❌ en las tablas, la migración no se aplicó correctamente.'
    // TODO: log 'Si ves ✅ en las tablas, la migración está funcionando.'
    // TODO: log '\n💡 Para aplicar la migración manualmente:'
    // TODO: log '1. Ve a Supabase Dashboard'
    // TODO: log '2. SQL Editor'
    // TODO: log '3. Copia y pega el contenido de: supabase/migrations/20250618130000_create_departmental_permission_system.sql'
  } catch (error) {
    // TODO: log '❌ Error:' error.message
  }
}

checkMigrationStatus();
