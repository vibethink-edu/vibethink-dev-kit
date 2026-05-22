#!/usr/bin/env tsx

/**
 * Create VibeThink Team Users Script
 *
 * Creates user profiles for the VibeThink team in Supabase
 * Note: Auth users must be created manually in Supabase dashboard first
 *
 * @author VibeThink Platform
 * @version 1.0.0
 */

import { createClient } from "@supabase/supabase-js";

// Supabase configuration
const SUPABASE_URL = "https://pikywaoqlekupfynnclg.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpa3l3YW9xbGVrdXBmeW5uY2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTE3NTgsImV4cCI6MjA2NTUyNzc1OH0.jt_uLXm-GhrcrPd4VXe4ZcEHIdKH35sj5o8aABCUutE";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  // TODO: log '🚀 Creating VibeThink team users...'

  try {
    // First, create/update VibeThink platform company
    // TODO: log '📝 Creating VibeThink platform company...'

    const { error: companyError } = await supabase.from("companies").upsert({
      id: "111e1111-e11b-11d1-a111-111111111111",
      name: "VibeThink Platform",
      slug: "vibethink-platform",
      status: "ACTIVE",
      subscription_plan: "ENTERPRISE",
      max_users: 1000,
      max_monthly_ai_requests: 1000000,
      max_monthly_scraping_pages: 100000,
      domain: "vibethink.co",
    });

    if (companyError && companyError.code !== "23505") {
      // TODO: log '❌ Error creating company:' companyError
      return;
    }

    // TODO: log '✅ VibeThink platform company created/updated (or already exists)'

    // Create VibeThink team user profiles
    const vibethinkUsers = [
      {
        id: "00000000-0000-0000-0000-000000000001",
        email: "superadmin@vibethink.co",
        full_name: "Super Administrator",
        role: "ADMIN", // We handle SUPER_ADMIN logic in code
        company_id: "111e1111-e11b-11d1-a111-111111111111",
      },
      {
        id: "00000000-0000-0000-0000-000000000002",
        email: "admin@vibethink.co",
        full_name: "Platform Administrator",
        role: "ADMIN",
        company_id: "111e1111-e11b-11d1-a111-111111111111",
      },
      {
        id: "00000000-0000-0000-0000-000000000003",
        email: "manager@vibethink.co",
        full_name: "Team Manager",
        role: "MANAGER",
        company_id: "111e1111-e11b-11d1-a111-111111111111",
      },
      {
        id: "00000000-0000-0000-0000-000000000004",
        email: "employee@vibethink.co",
        full_name: "Internal Employee",
        role: "EMPLOYEE",
        company_id: "111e1111-e11b-11d1-a111-111111111111",
      },
      {
        id: "00000000-0000-0000-0000-000000000005",
        email: "support@vibethink.co",
        full_name: "Technical Support",
        role: "SUPPORT",
        company_id: "111e1111-e11b-11d1-a111-111111111111",
      },
    ];

    // TODO: log '👥 Creating VibeThink team user profiles...'

    for (const user of vibethinkUsers) {
      const { error } = await supabase.from("user_profiles").upsert({
        ...user,
        is_active: true,
      });

      if (error) {
        // TODO: log `❌ Error creating user ${user.email}:` error
      } else {
        // TODO: log `✅ Created/updated user: ${user.email}`
      }
    }

    // Create example client company
    // TODO: log '🏢 Creating example client company...'

    const { error: clientCompanyError } = await supabase.from("companies").upsert({
      id: "222e2222-e22b-22d2-a222-222222222222",
      name: "Example Company Inc",
      slug: "example-company",
      status: "ACTIVE",
      subscription_plan: "PROFESSIONAL",
      max_users: 25,
      max_monthly_ai_requests: 10000,
      max_monthly_scraping_pages: 1000,
    });

    if (clientCompanyError && clientCompanyError.code !== "23505") {
      // TODO: log '❌ Error creating client company:' clientCompanyError
    } else {
      // TODO: log '✅ Example client company created/updated (or already exists)'
    }

    // Create client company users
    const clientUsers = [
      {
        id: "00000000-0000-0000-0000-000000000011",
        email: "admin@company.com",
        full_name: "Company Administrator",
        role: "ADMIN",
        company_id: "222e2222-e22b-22d2-a222-222222222222",
      },
      {
        id: "00000000-0000-0000-0000-000000000012",
        email: "manager@company.com",
        full_name: "Company Manager",
        role: "MANAGER",
        company_id: "222e2222-e22b-22d2-a222-222222222222",
      },
      {
        id: "00000000-0000-0000-0000-000000000013",
        email: "user@company.com",
        full_name: "Company Employee",
        role: "EMPLOYEE",
        company_id: "222e2222-e22b-22d2-a222-222222222222",
      },
    ];

    // TODO: log '👥 Creating client company user profiles...'

    for (const user of clientUsers) {
      const { error } = await supabase.from("user_profiles").upsert({
        ...user,
        is_active: true,
      });

      if (error) {
        // TODO: log `❌ Error creating user ${user.email}:` error
      } else {
        // TODO: log `✅ Created/updated user: ${user.email}`
      }
    }

    // TODO: log '\n🎉 VibeThink team users created successfully!'
    // TODO: log '\n📋 Next steps:'
    // TODO: log '1. Go to Supabase Dashboard > Authentication > Users'
    // TODO: log '2. Create auth users for each email with password "12345"'
    // TODO: log '3. The profiles will be automatically linked when they sign in'
    // TODO: log '\n👑 SUPER_ADMIN: superadmin@vibethink.co (can switch roles)'
    // TODO: log '⚙️  ADMIN: admin@vibethink.co (no role switching)'
    // TODO: log '👥 MANAGER: manager@vibethink.co (no role switching)'
    // TODO: log '👤 EMPLOYEE: employee@vibethink.co (no role switching)'
    // TODO: log '🛡️  SUPPORT: support@vibethink.co (no role switching)'
  } catch (error) {
    // TODO: log '❌ Error in main function:' error
  }
}

// Execute the script
main().catch(console.error);
