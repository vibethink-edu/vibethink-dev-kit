const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Error: Variables de entorno no configuradas");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function disableRLSTemporarily() {
  console.log("🔧 Deshabilitando RLS temporalmente para pruebas...\n");

  const tables = [
    "platforms",
    "organizations",
    "workspaces",
    "sub_organizations",
    "sub_workspaces",
    "hierarchical_users",
    "branding_configs",
  ];

  for (const table of tables) {
    try {
      // Deshabilitar RLS temporalmente
      const { error } = await supabase.rpc("exec_sql", {
        sql: `ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;`,
      });

      if (error) {
        console.log(`⚠️ Error deshabilitando RLS en ${table}: ${error.message}`);
      } else {
        console.log(`✅ RLS deshabilitado en ${table}`);
      }
    } catch (error) {
      console.log(`⚠️ Error con ${table}: ${error.message}`);
    }
  }

  console.log("\n✅ RLS deshabilitado temporalmente");
  console.log("📝 Ahora puedes ejecutar las pruebas");
  console.log("⚠️  Recuerda habilitar RLS después de las pruebas");
}

async function enableRLS() {
  console.log("🔒 Habilitando RLS nuevamente...\n");

  const tables = [
    "platforms",
    "organizations",
    "workspaces",
    "sub_organizations",
    "sub_workspaces",
    "hierarchical_users",
    "branding_configs",
  ];

  for (const table of tables) {
    try {
      const { error } = await supabase.rpc("exec_sql", {
        sql: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`,
      });

      if (error) {
        console.log(`⚠️ Error habilitando RLS en ${table}: ${error.message}`);
      } else {
        console.log(`✅ RLS habilitado en ${table}`);
      }
    } catch (error) {
      console.log(`⚠️ Error con ${table}: ${error.message}`);
    }
  }

  console.log("\n✅ RLS habilitado nuevamente");
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--disable")) {
    await disableRLSTemporarily();
  } else if (args.includes("--enable")) {
    await enableRLS();
  } else {
    console.log("🔧 Script de gestión de RLS");
    console.log("\nUso:");
    console.log("  node scripts/disable-rls-temporarily.cjs --disable  # Deshabilitar RLS");
    console.log("  node scripts/disable-rls-temporarily.cjs --enable   # Habilitar RLS");
    console.log("\n⚠️  Deshabilita RLS solo para pruebas, luego habilítalo nuevamente");
  }
}

main().catch(console.error);
