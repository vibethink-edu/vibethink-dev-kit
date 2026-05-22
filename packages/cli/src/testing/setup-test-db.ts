#!/usr/bin/env tsx

/**
 * Test Database Setup Script
 *
 * Configura la base de datos de test con:
 * - Datos de prueba
 * - Configuraciones de test
 * - Usuarios de prueba
 *
 * @author AI Pair Platform - Testing Team
 * @version 1.0.0
 */

import { createClient } from "@supabase/supabase-js";

interface TestData {
  companies: any[];
  users: any[];
  configurations: any[];
  usageData: any[];
  billingData: any[];
}

async function main() {
  // TODO: log '🗄️ Setting up test database...'

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

    // Setup test data
    await setupTestData(supabase);

    // TODO: log '✅ Test database setup completed successfully'
  } catch (error) {
    // TODO: log '❌ Test database setup failed:' error
    process.exit(1);
  }
}

async function setupTestData(supabase: any) {
  const testData = generateTestData();

  // Setup companies
  // TODO: log '🏢 Setting up test companies...'
  await setupCompanies(supabase, testData.companies);

  // Setup users
  // TODO: log '👥 Setting up test users...'
  await setupUsers(supabase, testData.users);

  // Setup configurations
  // TODO: log '⚙️ Setting up test configurations...'
  await setupConfigurations(supabase, testData.configurations);

  // Setup usage data
  // TODO: log '📊 Setting up test usage data...'
  await setupUsageData(supabase, testData.usageData);

  // Setup billing data
  // TODO: log '💰 Setting up test billing data...'
  await setupBillingData(supabase, testData.billingData);
}

function generateTestData(): TestData {
  return {
    companies: [
      {
        name: "Test Company A",
        slug: "test-company-a",
        status: "ACTIVE",
        subscription_plan: "PROFESSIONAL",
        max_users: 25,
        max_monthly_ai_requests: 10000,
        max_monthly_scraping_pages: 1000,
        max_storage_gb: 10,
      },
      {
        name: "Test Company B",
        slug: "test-company-b",
        status: "TRIAL",
        subscription_plan: "STARTER",
        max_users: 5,
        max_monthly_ai_requests: 1000,
        max_monthly_scraping_pages: 100,
        max_storage_gb: 1,
      },
      {
        name: "Test Company C",
        slug: "test-company-c",
        status: "ACTIVE",
        subscription_plan: "ENTERPRISE",
        max_users: 100,
        max_monthly_ai_requests: 100000,
        max_monthly_scraping_pages: 10000,
        max_storage_gb: 100,
      },
    ],
    users: [
      {
        id: "test-admin-user",
        email: "admin@testcompany.com",
        full_name: "Test Admin",
        role: "ADMIN",
        company_id: "test-company-a",
        is_active: true,
      },
      {
        id: "test-employee-user",
        email: "employee@testcompany.com",
        full_name: "Test Employee",
        role: "EMPLOYEE",
        company_id: "test-company-a",
        is_active: true,
      },
      {
        id: "test-manager-user",
        email: "manager@testcompany.com",
        full_name: "Test Manager",
        role: "MANAGER",
        company_id: "test-company-a",
        is_active: true,
      },
      {
        id: "test-owner-user",
        email: "owner@testcompany.com",
        full_name: "Test Owner",
        role: "OWNER",
        company_id: "test-company-b",
        is_active: true,
      },
      {
        id: "test-super-admin",
        email: "admin@VibeThink.co",
        full_name: "Super Admin",
        role: "SUPER_ADMIN",
        company_id: "VibeThink-platform",
        is_active: true,
      },
    ],
    configurations: [
      {
        category: "ai_models",
        config_key: "openai_models",
        config_value: {
          models: ["gpt-4", "gpt-3.5-turbo"],
          default_model: "gpt-4",
          max_tokens: 4000,
        },
        description: "Available OpenAI models",
        is_active: true,
      },
      {
        category: "integrations",
        config_key: "google_workspace",
        config_value: {
          enabled: true,
          scopes: ["drive", "docs"],
          redirect_uri: "https://app.example.com/auth/google/callback",
        },
        description: "Google Workspace integration settings",
        is_active: true,
      },
      {
        category: "security",
        config_key: "password_policy",
        config_value: {
          min_length: 8,
          require_uppercase: true,
          require_lowercase: true,
          require_numbers: true,
          require_special_chars: true,
        },
        description: "Password policy configuration",
        is_active: true,
      },
      {
        category: "billing",
        config_key: "subscription_plans",
        config_value: {
          starter: {
            price: 29,
            features: ["basic_ai", "document_processing"],
          },
          professional: {
            price: 99,
            features: ["advanced_ai", "priority_support"],
          },
          enterprise: {
            price: 299,
            features: ["custom_ai", "dedicated_support"],
          },
        },
        description: "Subscription plan configuration",
        is_active: true,
      },
    ],
    usageData: [
      {
        company_id: "test-company-a",
        user_id: "test-admin-user",
        service_name: "openai",
        usage_type: "ai_generation",
        amount: 500,
        cost_usd: 0.01,
      },
      {
        company_id: "test-company-a",
        user_id: "test-employee-user",
        service_name: "openai",
        usage_type: "ai_generation",
        amount: 200,
        cost_usd: 0.004,
      },
      {
        company_id: "test-company-a",
        user_id: "test-manager-user",
        service_name: "openai",
        usage_type: "ai_generation",
        amount: 300,
        cost_usd: 0.006,
      },
      {
        company_id: "test-company-b",
        user_id: "test-owner-user",
        service_name: "openai",
        usage_type: "ai_generation",
        amount: 100,
        cost_usd: 0.002,
      },
    ],
    billingData: [
      {
        company_id: "test-company-a",
        billing_month: "2024-01-01",
        total_cost_usd: 0.02,
        ai_tokens_used: 1000,
        scraping_pages_used: 50,
        storage_mb_used: 100,
        status: "PENDING",
      },
      {
        company_id: "test-company-b",
        billing_month: "2024-01-01",
        total_cost_usd: 0.002,
        ai_tokens_used: 100,
        scraping_pages_used: 10,
        storage_mb_used: 20,
        status: "PENDING",
      },
    ],
  };
}

async function setupCompanies(supabase: any, companies: any[]) {
  for (const company of companies) {
    const { error } = await supabase.from("companies").upsert(company, { onConflict: "slug" });

    if (error) {
      // TODO: log `⚠️ Warning: Could not setup company ${company.slug}:` error.message
    } else {
      // TODO: log `✅ Created company: ${company.name}`
    }
  }
}

async function setupUsers(supabase: any, users: any[]) {
  for (const user of users) {
    const { error } = await supabase.from("user_profiles").upsert(user, { onConflict: "id" });

    if (error) {
      // TODO: log `⚠️ Warning: Could not setup user ${user.email}:` error.message
    } else {
      // TODO: log `✅ Created user: ${user.full_name} (${user.role})`
    }
  }
}

async function setupConfigurations(supabase: any, configurations: any[]) {
  for (const config of configurations) {
    const { error } = await supabase
      .from("platform_configurations")
      .upsert(config, { onConflict: "category,config_key" });

    if (error) {
      // TODO: log `⚠️ Warning: Could not setup configuration ${config.config_key}:` error.message
    } else {
      // TODO: log `✅ Created configuration: ${config.config_key}`
    }
  }
}

async function setupUsageData(supabase: any, usageData: any[]) {
  for (const usage of usageData) {
    const { error } = await supabase.from("usage_tracking").insert(usage);

    if (error) {
      // TODO: log `⚠️ Warning: Could not setup usage data:` error.message
    } else {
      // TODO: log `✅ Created usage record for ${usage.user_id}`
    }
  }
}

async function setupBillingData(supabase: any, billingData: any[]) {
  for (const billing of billingData) {
    const { error } = await supabase
      .from("monthly_billing")
      .upsert(billing, { onConflict: "company_id,billing_month" });

    if (error) {
      // TODO: log `⚠️ Warning: Could not setup billing data:` error.message
    } else {
      // TODO: log `✅ Created billing record for ${billing.company_id}`
    }
  }
}

// Función para limpiar datos de test
export async function cleanupTestData(supabase: any) {
  // TODO: log '🧹 Cleaning up test data...'

  try {
    // Cleanup usage tracking
    const { error: usageError } = await supabase
      .from("usage_tracking")
      .delete()
      .like("company_id", "test-%");

    if (usageError) {
      // TODO: log 'Warning: Could not cleanup usage data:' usageError.message
    }

    // Cleanup monthly billing
    const { error: billingError } = await supabase
      .from("monthly_billing")
      .delete()
      .like("company_id", "test-%");

    if (billingError) {
      // TODO: log 'Warning: Could not cleanup billing data:' billingError.message
    }

    // Cleanup users
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
        // TODO: log `Warning: Could not cleanup user ${userId}:` error.message
      }
    }

    // Cleanup companies
    const testCompanySlugs = ["test-company-a", "test-company-b", "test-company-c"];

    for (const slug of testCompanySlugs) {
      const { error } = await supabase.from("companies").delete().eq("slug", slug);

      if (error) {
        // TODO: log `Warning: Could not cleanup company ${slug}:` error.message
      }
    }

    // TODO: log '✅ Test data cleanup completed'
  } catch (error) {
    // TODO: log '❌ Test data cleanup failed:' error
  }
}

// Ejecutar el script
if (require.main === module) {
  main().catch(console.error);
}
