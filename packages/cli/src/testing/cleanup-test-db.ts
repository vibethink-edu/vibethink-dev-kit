#!/usr/bin/env tsx

/**
 * Test Database Cleanup Script
 *
 * Limpia la base de datos de test removiendo:
 * - Datos de prueba
 * - Usuarios de test
 * - Configuraciones temporales
 *
 * @author AI Pair Platform - Testing Team
 * @version 1.0.0
 */

import { createClient } from "@supabase/supabase-js";

async function main() {
  // TODO: log '🧹 Cleaning up test database...'

  // Verificar variables de entorno
  const supabaseUrl = process.env.TEST_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.TEST_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // TODO: log '❌ Missing Supabase credentials'
    // TODO: log 'Please set TEST_SUPABASE_URL and TEST_SUPABASE_ANON_KEY'
    process.exit(1);
  }

  // Inicializar cliente Supabase
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Verificar conexión
    const { data: healthCheck, error: healthError } = await supabase
      .from("companies")
      .select("count")
      .limit(1);

    if (healthError) {
      // TODO: log '❌ Database connection failed:' healthError.message
      process.exit(1);
    }

    // TODO: log '✅ Database connection successful'

    // Cleanup test data
    await cleanupTestData(supabase);

    // TODO: log '✅ Test database cleanup completed successfully'
  } catch (error) {
    // TODO: log '❌ Test database cleanup failed:' error
    process.exit(1);
  }
}

async function cleanupTestData(supabase: any) {
  // TODO: log '🗑️ Removing test data...'

  // Cleanup usage tracking
  // TODO: log '📊 Cleaning up usage tracking...'
  const { error: usageError } = await supabase
    .from("usage_tracking")
    .delete()
    .like("company_id", "test-%");

  if (usageError) {
    // TODO: log '⚠️ Warning: Could not cleanup usage data:' usageError.message
  } else {
    // TODO: log '✅ Usage tracking cleaned up'
  }

  // Cleanup monthly billing
  // TODO: log '💰 Cleaning up monthly billing...'
  const { error: billingError } = await supabase
    .from("monthly_billing")
    .delete()
    .like("company_id", "test-%");

  if (billingError) {
    // TODO: log '⚠️ Warning: Could not cleanup billing data:' billingError.message
  } else {
    // TODO: log '✅ Monthly billing cleaned up'
  }

  // Cleanup configuration overrides
  // TODO: log '⚙️ Cleaning up configuration overrides...'
  const { error: configError } = await supabase
    .from("company_configuration_overrides")
    .delete()
    .like("company_id", "test-%");

  if (configError) {
    // TODO: log '⚠️ Warning: Could not cleanup configuration overrides:' configError.message
  } else {
    // TODO: log '✅ Configuration overrides cleaned up'
  }

  // Cleanup audit logs
  // TODO: log '📝 Cleaning up audit logs...'
  const { error: auditError } = await supabase
    .from("configuration_audit_log")
    .delete()
    .like("company_id", "test-%");

  if (auditError) {
    // TODO: log '⚠️ Warning: Could not cleanup audit logs:' auditError.message
  } else {
    // TODO: log '✅ Audit logs cleaned up'
  }

  // Cleanup users
  // TODO: log '👥 Cleaning up test users...'
  const testUserIds = [
    "test-admin-user",
    "test-employee-user",
    "test-manager-user",
    "test-owner-user",
    "test-super-admin",
  ];

  for (const userId of testUserIds) {
    const { error } = await supabase.from("user_profiles").delete().eq("id", userId);

    if (error) {
      // TODO: log `⚠️ Warning: Could not cleanup user ${userId}:` error.message
    } else {
      // TODO: log `✅ Cleaned up user: ${userId}`
    }
  }

  // Cleanup companies
  // TODO: log '🏢 Cleaning up test companies...'
  const testCompanySlugs = ["test-company-a", "test-company-b", "test-company-c"];

  for (const slug of testCompanySlugs) {
    const { error } = await supabase.from("companies").delete().eq("slug", slug);

    if (error) {
      // TODO: log `⚠️ Warning: Could not cleanup company ${slug}:` error.message
    } else {
      // TODO: log `✅ Cleaned up company: ${slug}`
    }
  }

  // Cleanup test configurations
  // TODO: log '🔧 Cleaning up test configurations...'
  const testConfigKeys = [
    "test_openai_models",
    "test_google_workspace",
    "test_password_policy",
    "test_subscription_plans",
  ];

  for (const configKey of testConfigKeys) {
    const { error } = await supabase
      .from("platform_configurations")
      .delete()
      .eq("config_key", configKey);

    if (error) {
      // TODO: log `⚠️ Warning: Could not cleanup configuration ${configKey}:` error.message
    } else {
      // TODO: log `✅ Cleaned up configuration: ${configKey}`
    }
  }

  // Cleanup any remaining test data
  // TODO: log '🧹 Cleaning up any remaining test data...'

  // Cleanup any data with test prefixes
  const tablesToClean = ["usage_tracking", "monthly_billing", "user_profiles", "companies"];

  for (const table of tablesToClean) {
    try {
      // Get all records with test prefixes
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .or("id.like.test-%,company_id.like.test-%,email.like.test%@%");

      if (error) {
        // TODO: log `⚠️ Warning: Could not query ${table}:` error.message
        continue;
      }

      if (data && data.length > 0) {
        // TODO: log `Found ${data.length} test records in ${table}`

        // Delete test records
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .or("id.like.test-%,company_id.like.test-%,email.like.test%@%");

        if (deleteError) {
          // TODO: log `⚠️ Warning: Could not cleanup ${table}:` deleteError.message
        } else {
          // TODO: log `✅ Cleaned up ${data.length} records from ${table}`
        }
      }
    } catch (error) {
      // TODO: log `⚠️ Warning: Error cleaning up ${table}:` error
    }
  }

  // TODO: log '✅ All test data cleanup completed'
}

// Función para verificar si hay datos de test
export async function checkTestData(supabase: any): Promise<boolean> {
  try {
    // Check for test companies
    const { data: companies, error: companiesError } = await supabase
      .from("companies")
      .select("count")
      .like("slug", "test-%");

    if (companiesError) {
      // TODO: log 'Warning: Could not check for test companies:' companiesError.message
    } else if (companies && companies.length > 0) {
      // TODO: log `Found ${companies.length} test companies`
      return true;
    }

    // Check for test users
    const { data: users, error: usersError } = await supabase
      .from("user_profiles")
      .select("count")
      .like("id", "test-%");

    if (usersError) {
      // TODO: log 'Warning: Could not check for test users:' usersError.message
    } else if (users && users.length > 0) {
      // TODO: log `Found ${users.length} test users`
      return true;
    }

    // Check for test usage data
    const { data: usage, error: usageError } = await supabase
      .from("usage_tracking")
      .select("count")
      .like("company_id", "test-%");

    if (usageError) {
      // TODO: log 'Warning: Could not check for test usage data:' usageError.message
    } else if (usage && usage.length > 0) {
      // TODO: log `Found ${usage.length} test usage records`
      return true;
    }

    return false;
  } catch (error) {
    // TODO: log 'Error checking for test data:' error
    return false;
  }
}

// Función para listar datos de test
export async function listTestData(supabase: any) {
  // TODO: log '📋 Listing test data...'

  try {
    // List test companies
    const { data: companies, error: companiesError } = await supabase
      .from("companies")
      .select("*")
      .like("slug", "test-%");

    if (companiesError) {
      // TODO: log 'Warning: Could not list test companies:' companiesError.message
    } else {
      // TODO: log `\n🏢 Test Companies (${companies?.length || 0}):`
      // companies?.forEach(company => {
      //   console.log(`  - ${company.name} (${company.slug}) - ${company.status}`);
      // });
    }

    // List test users
    const { data: users, error: usersError } = await supabase
      .from("user_profiles")
      .select("*")
      .like("id", "test-%");

    if (usersError) {
      // TODO: log 'Warning: Could not list test users:' usersError.message
    } else {
      // TODO: log `\n👥 Test Users (${users?.length || 0}):`
      // users?.forEach(user => {
      //   console.log(`  - ${user.full_name} (${user.email}) - ${user.role}`);
      // });
    }

    // List test usage data
    const { data: usage, error: usageError } = await supabase
      .from("usage_tracking")
      .select("*")
      .like("company_id", "test-%");

    if (usageError) {
      // TODO: log 'Warning: Could not list test usage data:' usageError.message
    } else {
      // TODO: log `\n📊 Test Usage Data (${usage?.length || 0}):`
      // usage?.forEach(record => {
      //   console.log(`  - ${record.service_name}: ${record.amount} ($${record.cost_usd})`);
      // });
    }
  } catch (error) {
    // TODO: log 'Error listing test data:' error
  }
}

// Ejecutar el script
if (require.main === module) {
  main().catch(console.error);
}
