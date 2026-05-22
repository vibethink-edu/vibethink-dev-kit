# 📊 Raw Data Analysis Template

**Purpose:** Transform messy client inputs (PDFs, Excels, Whatsapp screenshots) into structured Engineering Requirements (ER).
**Output:** A clear mapping that allows generating `schema.sql` without guessing.

---

## 1. Executive Summary

### 1.1 Input Sources
| File Name | Content Type | Status |
|-----------|--------------|--------|
| `Menu_2024.pdf` | Raw Menu | ✅ Analyzed |
| `Prices_v2.xlsx` | Pricing Data | ⚠️ Conflicts found |

### 1.2 Key Statistics
- **Total Entities:** (e.g., 50 dishes)
- **Categories:** (e.g., 5 categories)
- **Complexity:** (High/Medium/Low - e.g., "Contains logic for 2-for-1 promos")

---

## 2. Structural Analysis

### 2.1 Categorization
List the discovered structure.
*   Category A
    *   Sub-category A.1
*   Category B

### 2.2 Complex Data Patterns (The "Hard Stuff")
Identify items that don't fit the happy path.

**Example Pattern:** "Variable Pricing"
> "The 'Supreme Pizza' costs $10 for Small, $15 for Medium, but implies different toppings."

**Engineering Implication:**
- Need `modifiers` table OR
- Need `variant` column in `products` table.

---

## 3. Database Validation

### 3.1 Proposed Schema Mapping
Map the findings to SQL types.

```sql
-- Pattern detected: Multiple prices per item
CREATE TABLE product_variants (
  product_id UUID,
  size TEXT, -- 'small', 'medium'
  price DECIMAL(10,2)
);
```

### 3.2 Gaps & Questions
- [ ] What is the "VIP Price" mentioned in page 3?
- [ ] Does "Combos" deplete inventory of individual items?

---

## 4. Implementation Strategy

### 4.1 Seed Data Strategy
How will we fill the DB?
- [ ] Manual SQL Insert
- [ ] CSV Parsing Script
- [ ] n8n Workflow

### 4.2 Next Steps
1. Create `db/schema.sql`
2. Create `db/seed/01_initial_data.sql`
