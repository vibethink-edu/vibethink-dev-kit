#!/usr/bin/env tsx

/**
 * Apply Database Migrations Script
 *
 * Applies all necessary database migrations for the meeting processor
 *
 * @author AI Pair Platform - Backend Team
 * @version 1.0.0
 */

import { readFileSync } from "fs";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";

interface MigrationFile {
  filename: string;
  sql: string;
}

async function main() {
  // TODO: log '🚀 Starting database migration process...'

  // Initialize Supabase client
  const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://pikywaoqlekupfynnclg.supabase.co";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceKey) {
    // TODO: log '❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required'
    // TODO: log 'Please set your service role key in the environment variables.'
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Test connection
  try {
    const { data, error } = await supabase.from("companies").select("count").limit(1).maybeSingle();

    if (error) {
      // TODO: log '❌ Database connection failed:' error.message
      process.exit(1);
    }

    // TODO: log '✅ Database connection successful'
  } catch (error) {
    // TODO: log '❌ Database connection error:' error
    process.exit(1);
  }

  // Load migration files
  const migrations: MigrationFile[] = [
    {
      filename: "20240101000001_create_meetings_table.sql",
      sql: readFileSync(
        join(process.cwd(), "supabase/migrations/20240101000001_create_meetings_table.sql"),
        "utf8"
      ),
    },
    {
      filename: "20240101000002_create_ai_usage_logs_table.sql",
      sql: readFileSync(
        join(process.cwd(), "supabase/migrations/20240101000002_create_ai_usage_logs_table.sql"),
        "utf8"
      ),
    },
    {
      filename: "20240101000003_create_company_limits_function.sql",
      sql: readFileSync(
        join(
          process.cwd(),
          "supabase/migrations/20240101000003_create_company_limits_function.sql"
        ),
        "utf8"
      ),
    },
  ];

  // Apply migrations
  for (const migration of migrations) {
    // TODO: log `\n📄 Applying migration: ${migration.filename}`

    try {
      // Split SQL by statements (basic splitting on semicolon followed by newline)
      const statements = migration.sql
        .split(/;\s*\n/)
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await supabase.rpc("exec_sql", { sql_query: statement + ";" });

          if (error) {
            // TODO: log `❌ Error executing statement: ${error.message}`
            // TODO: log `Statement: ${statement.substring(0, 100)}...`
            // Continue with next statement instead of failing completely
          }
        }
      }

      // TODO: log `✅ Migration ${migration.filename} completed`
    } catch (error) {
      // TODO: log `❌ Error applying migration ${migration.filename}:` error
      // Continue with next migration
    }
  }

  // Verify tables were created
  // TODO: log '\n🔍 Verifying table creation...'

  const tablesToCheck = ["meetings", "ai_usage_logs"];

  for (const table of tablesToCheck) {
    try {
      const { error } = await supabase
        .from(table as any)
        .select("count")
        .limit(1)
        .maybeSingle();

      if (error) {
        // TODO: log `❌ Table '${table}' verification failed: ${error.message}`
      } else {
        // TODO: log `✅ Table '${table}' is accessible`
      }
    } catch (error) {
      // TODO: log `❌ Table '${table}' check failed:` error
    }
  }

  // Test RPC functions
  // TODO: log '\n🔍 Testing RPC functions...'

  try {
    // Test with a dummy company ID
    const { data, error } = await supabase.rpc("get_company_limits", {
      p_company_id: "00000000-0000-0000-0000-000000000000",
    });

    if (error) {
      // TODO: log `❌ RPC function 'get_company_limits' test failed: ${error.message}`
    } else {
      // TODO: log `✅ RPC function 'get_company_limits' is working`
      // TODO: log `   Response type: ${typeof data}`
    }
  } catch (error) {
    // TODO: log `❌ RPC function test failed:` error
  }

  // Create sample data (optional)
  // TODO: log '\n📝 Creating sample data...'

  try {
    // Check if we have any companies
    const { data: companies, error: companiesError } = await supabase
      .from("companies")
      .select("id, name")
      .limit(1);

    if (companiesError) {
      // TODO: log '❌ Could not check companies:' companiesError.message
    } else if (companies && companies.length > 0) {
      // TODO: log `✅ Found existing company: ${companies[0].name}`
      // TODO: log '   Sample data creation skipped (companies already exist)'
    } else {
      // TODO: log 'ℹ️  No companies found. You may need to set up initial company data.'
    }
  } catch (error) {
    // TODO: log '❌ Sample data check failed:' error
  }

  // TODO: log '\n🎉 Migration process completed!'
  // TODO: log '\nNext steps:'
  // TODO: log '1. Set up your environment variables (.env.local):'
  // TODO: log '   - VITE_SUPABASE_URL'
  // TODO: log '   - VITE_SUPABASE_ANON_KEY'
  // TODO: log '   - OPENAI_API_KEY (for Edge Functions)'
  // TODO: log '2. Deploy Edge Functions: npm run deploy:functions'
  // TODO: log '3. Test the meeting processor: npm run dev'
  // TODO: log '4. Visit /meeting-processor-demo to test functionality'
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error);
}

export { main as applyMigrations };
