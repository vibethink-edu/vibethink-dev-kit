/**
 * Check Database Structure
 *
 * Script para verificar la estructura de la base de datos
 *
 * @author AI Pair Platform - Backend Team
 * @version 1.0.0
 */

import { createClient } from "@supabase/supabase-js";

// Configuración de Supabase
const SUPABASE_URL = "https://pikywaoqlekupfynnclg.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpa3l3YW9xbGVrdXBmeW5uY2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTE3NTgsImV4cCI6MjA2NTUyNzc1OH0.jt_uLXm-GhrcrPd4VXe4ZcEHIdKH35sj5o8aABCUutE";

// Crear cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Verificar estructura de la base de datos
 */
async function checkDatabaseStructure() {
  // TODO: log '🔍 Checking Database Structure...\n'

  const tables = [
    "companies",
    "user_profiles",
    "ai_usage_logs",
    "meetings",
    "departmental_permissions",
    "operational_repositories",
  ];

  console.log("📋 Checking tables:");
  console.log("=".repeat(50));

  for (const table of tables) {
    try {
      console.log(`\n🔍 Checking table: ${table}`);

      // Intentar hacer una consulta simple
      const { data, error, count } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });

      if (error) {
        console.log(`❌ ${table}: ${error.message}`);

        // Verificar si es un error de tabla no existente
        if (error.message.includes("relation") && error.message.includes("does not exist")) {
          console.log(`   → Table ${table} does not exist`);
        } else if (error.message.includes("Invalid API key")) {
          console.log(`   → API key issue`);
        } else {
          console.log(`   → Other error: ${error.message}`);
        }
      } else {
        console.log(`✅ ${table}: EXISTS (${count || 0} rows)`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }

  // Verificar RLS policies
  console.log("\n🔐 Checking RLS Policies:");
  console.log("=".repeat(50));

  try {
    const { data: policies, error } = await supabase.rpc("get_rls_policies");

    if (error) {
      console.log(`❌ RLS Policies: ${error.message}`);
    } else {
      console.log(`✅ RLS Policies: ${policies?.length || 0} policies found`);
    }
  } catch (err) {
    console.log(`❌ RLS Policies: ${err.message}`);
  }

  // Verificar funciones
  console.log("\n⚙️ Checking Functions:");
  console.log("=".repeat(50));

  try {
    const { data: functions, error } = await supabase.rpc("get_functions");

    if (error) {
      console.log(`❌ Functions: ${error.message}`);
    } else {
      console.log(`✅ Functions: ${functions?.length || 0} functions found`);
    }
  } catch (err) {
    console.log(`❌ Functions: ${err.message}`);
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 DATABASE STRUCTURE CHECK COMPLETED");
  console.log("=".repeat(50));
}

// Ejecutar el check
checkDatabaseStructure()
  .then(() => {
    console.log("\n✨ Check completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Check failed:", error);
    process.exit(1);
  });
