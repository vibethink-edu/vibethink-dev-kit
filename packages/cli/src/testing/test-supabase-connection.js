/**
 * Test Supabase Connection Script
 *
 * Script para verificar la conexión a Supabase Cloud
 *
 * @author AI Pair Platform - Backend Team
 * @version 1.0.0
 */

import { createClient } from "@supabase/supabase-js";

// Configuración de Supabase
const SUPABASE_URL = "https://pikywaoqlekupfynnclg.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpa3l3YW9xbGVrdXBmeW5uY2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI4MDAsImV4cCI6MjA1MDU0ODgwMH0.placeholder_key_for_development";

// Crear cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Test completo de conexión a Supabase
 */
async function testSupabaseConnection() {
  console.log("🔗 Testing Supabase Cloud connection...\n");

  const results = {
    database: false,
    auth: false,
    storage: false,
    realtime: false,
    errors: [],
  };

  try {
    // Test 1: Database connection
    console.log("📊 Testing Database connection...");
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("count")
        .limit(1)
        .maybeSingle();

      if (!error) {
        results.database = true;
        console.log("✅ Database: CONNECTED");
      } else {
        results.errors.push(`Database error: ${error.message}`);
        console.log("❌ Database: FAILED -", error.message);
      }
    } catch (dbError) {
      results.errors.push(`Database connection failed: ${dbError}`);
      console.log("❌ Database: FAILED -", dbError);
    }

    // Test 2: Auth service
    console.log("\n🔐 Testing Auth service...");
    try {
      const { data: session } = await supabase.auth.getSession();
      results.auth = true;
      console.log("✅ Auth: CONNECTED", session ? "(authenticated)" : "(not authenticated)");
    } catch (authError) {
      results.errors.push(`Auth service error: ${authError}`);
      console.log("❌ Auth: FAILED -", authError);
    }

    // Test 3: Storage service
    console.log("\n📁 Testing Storage service...");
    try {
      const { data, error } = await supabase.storage.listBuckets();
      if (!error) {
        results.storage = true;
        console.log("✅ Storage: CONNECTED");
        console.log(`   Buckets found: ${data?.length || 0}`);
      } else {
        results.errors.push(`Storage error: ${error.message}`);
        console.log("❌ Storage: FAILED -", error.message);
      }
    } catch (storageError) {
      results.errors.push(`Storage service error: ${storageError}`);
      console.log("❌ Storage: FAILED -", storageError);
    }

    // Test 4: Realtime service
    console.log("\n⚡ Testing Realtime service...");
    try {
      const channel = supabase.channel("connection-test");
      await channel.subscribe();
      results.realtime = true;
      await channel.unsubscribe();
      console.log("✅ Realtime: CONNECTED");
    } catch (realtimeError) {
      results.errors.push(`Realtime service error: ${realtimeError}`);
      console.log("❌ Realtime: FAILED -", realtimeError);
    }

    // Test 5: Table access
    console.log("\n📋 Testing table access...");
    const tables = ["companies", "user_profiles", "ai_usage_logs", "meetings"];

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select("count").limit(1).maybeSingle();

        if (!error) {
          console.log(`✅ ${table}: ACCESSIBLE`);
        } else {
          console.log(`❌ ${table}: ${error.message}`);
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`);
      }
    }

    // Resumen final
    console.log("\n" + "=".repeat(50));
    console.log("📊 CONNECTION TEST RESULTS");
    console.log("=".repeat(50));

    const services = [
      { name: "Database", status: results.database },
      { name: "Auth", status: results.auth },
      { name: "Storage", status: results.storage },
      { name: "Realtime", status: results.realtime },
    ];

    services.forEach((service) => {
      const icon = service.status ? "✅" : "❌";
      console.log(`${icon} ${service.name}: ${service.status ? "CONNECTED" : "FAILED"}`);
    });

    if (results.errors.length > 0) {
      console.log("\n🚨 ERRORS FOUND:");
      results.errors.forEach((error) => {
        console.log(`   - ${error}`);
      });
    }

    const overallStatus = results.database && results.auth;
    console.log(`\n🎯 OVERALL STATUS: ${overallStatus ? "✅ CONNECTED" : "❌ FAILED"}`);

    if (overallStatus) {
      console.log("\n🎉 Supabase Cloud is ready to use!");
    } else {
      console.log("\n⚠️  Some services are not available. Check the errors above.");
    }

    return results;
  } catch (error) {
    console.log("❌ General connection error:", error);
    return { ...results, errors: [...results.errors, error.message] };
  }
}

// Ejecutar el test
testSupabaseConnection()
  .then(() => {
    console.log("\n✨ Test completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Test failed:", error);
    process.exit(1);
  });
