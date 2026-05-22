const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Error: Variables de entorno no configuradas");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanOldData() {
  console.log("🧹 Limpiando datos antiguos...\n");

  // Limpiar tabla companies (estructura antigua)
  try {
    const { error } = await supabase
      .from("companies")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (error) {
      console.log(`⚠️ Error limpiando companies: ${error.message}`);
    } else {
      console.log("✅ Tabla companies limpiada");
    }
  } catch (error) {
    console.log(`⚠️ Error con companies: ${error.message}`);
  }

  // Limpiar otras tablas que puedan tener datos de prueba
  const tablesToClean = [
    "users",
    "branding",
    "company_limits",
    "ai_usage_logs",
    "meetings",
    "audit_logs",
    "notifications",
    "analytics",
    "integrations",
  ];

  for (const table of tablesToClean) {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (error) {
        if (!error.message.includes("does not exist")) {
          console.log(`⚠️ Error limpiando ${table}: ${error.message}`);
        }
      } else {
        console.log(`✅ Tabla ${table} limpiada`);
      }
    } catch (error) {
      // Tabla no existe, continuar
    }
  }

  console.log("\n✅ Limpieza completada");
}

async function checkMigrationStatus() {
  console.log("\n🔍 Verificando estado de migraciones...\n");

  const hierarchicalTables = [
    "platforms",
    "organizations",
    "workspaces",
    "sub_organizations",
    "sub_workspaces",
    "hierarchical_users",
    "branding_configs",
  ];

  const missingTables = [];

  for (const table of hierarchicalTables) {
    try {
      const { data, error } = await supabase.from(table).select("count").limit(1);

      if (error) {
        if (error.message.includes("does not exist")) {
          missingTables.push(table);
          console.log(`❌ ${table}: No existe`);
        } else {
          console.log(`⚠️ ${table}: ${error.message}`);
        }
      } else {
        console.log(`✅ ${table}: Existe`);
      }
    } catch (error) {
      missingTables.push(table);
      console.log(`❌ ${table}: No existe`);
    }
  }

  if (missingTables.length > 0) {
    console.log("\n📋 Tablas faltantes:");
    missingTables.forEach((table) => console.log(`  - ${table}`));
    console.log("\n🚀 Necesitas aplicar las migraciones:");
    console.log("  1. Ve al panel de Supabase");
    console.log(
      "  2. Ejecuta el SQL de: supabase/migrations/20250623000000_hierarchical_organizations.sql"
    );
    console.log(
      "  3. Ejecuta el SQL de: supabase/migrations/20250623000001_update_roles_with_postfixes.sql"
    );
  } else {
    console.log("\n🎉 Todas las tablas jerárquicas existen");
  }
}

async function main() {
  console.log("🔧 Script de limpieza y verificación de base de datos\n");

  await cleanOldData();
  await checkMigrationStatus();

  console.log("\n📝 Próximos pasos:");
  console.log("1. Aplica las migraciones SQL si faltan tablas");
  console.log("2. Ejecuta: node scripts/run-hierarchical-tests.cjs");
  console.log("3. Verifica que todo funciona correctamente");
}

main().catch(console.error);
