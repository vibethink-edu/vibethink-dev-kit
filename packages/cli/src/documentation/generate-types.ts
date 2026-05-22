#!/usr/bin/env tsx

/**
 * Generate Supabase Types Script
 *
 * Genera los tipos de TypeScript desde la base de datos de Supabase
 *
 * @author AI Pair Platform - Backend Team
 * @version 1.0.0
 */

import { execSync } from "child_process";
import { writeFileSync } from "fs";
import { join } from "path";

async function main() {
  // TODO: log '🚀 Generating Supabase types...'

  try {
    // Generate types using Supabase CLI
    execSync(
      "supabase gen types typescript --project-id pikywaoqlekupfynnclg > src/integrations/supabase/types.ts",
      {
        stdio: "inherit",
      }
    );

    // TODO: log '✅ Types generated successfully'
  } catch (error) {
    // TODO: log '❌ Error generating types:' error
    process.exit(1);
  }
}

main();
