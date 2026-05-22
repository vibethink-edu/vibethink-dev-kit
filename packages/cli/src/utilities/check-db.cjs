const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Error: Variables de entorno no configuradas");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabase() {
  console.log("🔍 Verificando estado de la base de datos...\n");

  const tables = [
    "platforms",
    "organizations",
    "workspaces",
    "sub_organizations",
    "sub_workspaces",
    "hierarchical_users",
    "branding_configs",
    "companies",
    "users",
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select("count").limit(1);

      if (error) {
        if (error.message.includes("does not exist")) {
          console.log(`❌ ${table}: No existe`);
        } else {
          console.log(`⚠️ ${table}: ${error.message}`);
        }
      } else {
        console.log(`✅ ${table}: Existe`);
      }
    } catch (error) {
      console.log(`❌ ${table}: No existe`);
    }
  }

  console.log("\n📊 Resumen:");
  console.log('- Si ves "No existe" en las tablas jerárquicas, necesitas aplicar las migraciones');
  console.log('- Si ves "Existe" en tablas antiguas, puedes limpiarlas');
}

checkDatabase().catch(console.error);
