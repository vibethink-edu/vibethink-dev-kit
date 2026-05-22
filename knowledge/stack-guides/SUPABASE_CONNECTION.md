# Supabase Connection & RLS Validation

**Status:** Harvested from `vibethink-orchestrator-main`
**Source:** `src/shared/utils/utils/testSupabaseConnection.ts`
**Category:** Stack Guide

## 1. Connection Testing Pattern

Don't just check if the client initializes. Check if you can **read** from key tables. This validates both:
1.  Connection credentials.
2.  Row Level Security (RLS) policies.

```typescript
export async function testSupabaseConnection(supabase: SupabaseClient) {
  const result = {
    companies: false,
    userProfiles: false
  };

  try {
    // Test 'companies' table
    const { error: companiesError } = await supabase
      .from('companies')
      .select('id')
      .limit(1);
    result.companies = !companiesError;

    // Test 'user_profiles' table
    const { error: usersError } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);
    result.userProfiles = !usersError;

  } catch (error) {
    console.error('RLS Validate Error', error);
  }

  return result;
}
```

## 2. Table Naming Standards

Based on Orchestrator migrations (`supabase/migrations/`):
-   **Tables:** `snake_case` (e.g., `user_profiles`, `platform_configurations`).
-   **Primary Keys:** `id` (UUID).
-   **Timestamps:** `created_at`, `updated_at` (timestamptz).

## 3. RLS Strategy
*   **Public Read:** Only for `platform_configurations` (if non-sensitive).
*   **Authenticated Read:** `companies`, `user_profiles`.
*   **Service Role:** Required for Admin actions.
