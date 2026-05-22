const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Error: Variables de entorno de Supabase no configuradas");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Lista de todas las tablas a eliminar (en orden de dependencias)
const tablesToDrop = [
  // Tablas de branding y configuración
  "branding_configs",
  "hierarchical_users",

  // Tablas de sub-workspaces y sub-organizations
  "sub_workspaces",
  "sub_organizations",

  // Tablas de workspaces y organizations
  "workspaces",
  "organizations",

  // Tabla de plataforma
  "platforms",

  // Otras tablas que puedan existir
  "companies",
  "users",
  "branding",
  "company_limits",
  "ai_usage_logs",
  "meetings",
  "audit_logs",
  "notifications",
  "analytics",
  "integrations",
  "compliance_records",
  "billing_records",
  "accounting_records",
  "department_permissions",
  "support_tickets",
  "test_data",
];

// Función para limpiar la base de datos
async function resetDatabase() {
  console.log("🧹 Iniciando limpieza completa de la base de datos...\n");

  try {
    // 1. Eliminar todas las tablas existentes
    console.log("📋 Eliminando tablas existentes...");

    for (const table of tablesToDrop) {
      try {
        const { error } = await supabase.rpc("drop_table_if_exists", { table_name: table });

        if (error) {
          // Si no existe la función, intentar con SQL directo
          const { error: sqlError } = await supabase
            .from(table)
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000"); // Eliminar todos los registros

          if (sqlError) {
            console.log(`⚠️ No se pudo limpiar ${table}: ${sqlError.message}`);
          } else {
            console.log(`✅ Tabla ${table} limpiada`);
          }
        } else {
          console.log(`✅ Tabla ${table} eliminada`);
        }
      } catch (error) {
        console.log(`⚠️ Error con tabla ${table}: ${error.message}`);
      }
    }

    console.log("\n✅ Limpieza de tablas completada");

    // 2. Verificar que las tablas principales no existen
    console.log("\n🔍 Verificando que las tablas fueron eliminadas...");

    const testTables = ["platforms", "organizations", "workspaces"];
    for (const table of testTables) {
      try {
        const { data, error } = await supabase.from(table).select("count").limit(1);

        if (error && error.message.includes("does not exist")) {
          console.log(`✅ Tabla ${table} no existe (correcto)`);
        } else {
          console.log(`⚠️ Tabla ${table} aún existe`);
        }
      } catch (error) {
        console.log(`✅ Tabla ${table} no existe (correcto)`);
      }
    }

    console.log("\n🎉 Base de datos limpiada exitosamente");
    console.log("\n📝 Próximos pasos:");
    console.log("1. Ejecuta las migraciones de Supabase");
    console.log("2. Ejecuta el script de pruebas jerárquicas");
    console.log("3. Verifica que todo funciona correctamente");
  } catch (error) {
    console.error("❌ Error durante la limpieza:", error.message);
  }
}

// Función para verificar el estado actual
async function checkCurrentState() {
  console.log("🔍 Verificando estado actual de la base de datos...\n");

  const tablesToCheck = [
    "platforms",
    "organizations",
    "workspaces",
    "sub_organizations",
    "sub_workspaces",
    "hierarchical_users",
    "branding_configs",
  ];

  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase.from(table).select("count").limit(1);

      if (error) {
        if (error.message.includes("does not exist")) {
          console.log(`❌ Tabla ${table}: No existe`);
        } else {
          console.log(`⚠️ Tabla ${table}: Error - ${error.message}`);
        }
      } else {
        console.log(`✅ Tabla ${table}: Existe`);
      }
    } catch (error) {
      console.log(`❌ Tabla ${table}: No existe`);
    }
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--check")) {
    await checkCurrentState();
  } else if (args.includes("--reset")) {
    await resetDatabase();
  } else {
    console.log("🔧 Script de gestión de base de datos");
    console.log("\nUso:");
    console.log("  node scripts/reset-database.cjs --check  # Verificar estado actual");
    console.log("  node scripts/reset-database.cjs --reset  # Limpiar base de datos");
    console.log("\n⚠️  ADVERTENCIA: --reset eliminará TODOS los datos");
  }
}

// Ejecutar
main().catch(console.error);
