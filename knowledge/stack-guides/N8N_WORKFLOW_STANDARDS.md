# N8n Workflow Standards

**Status:** Harvested from `VozFood-Agent`
**Category:** Low-Code Integration

## 1. Workflow Structure (JSON)
All workflows must be saved as `.json` in the `n8n/workflows/` directory.

### Naming Convention
*   **Filename**: `snake_case.json` (e.g., `process_order.json`).
*   **Workflow Name (inside UI)**: `[Environment] - Feature Name` (e.g., `[DEV] - Process Order`).

## 2. Error Handling Pattern
Every workflow logic block MUST have an Error Trigger or Catch Node.

*   **Pattern**: "The Watchtower"
    *   Create a separate error workflow (e.g., `log_error.json`).
    *   In the main workflow, use "Error Trigger" node.
    *   Send failure details (Node Name, Execution ID) to `log_error`.

## 3. Webhook Security
*   **Method**: POST (Always).
*   **Authentication**: Header Auth (`x-api-key`) or JWT.
*   **Idempotency**: Check for `idempotency_key` in payload to prevent double-processing.

```javascript
// Example Idempotency Check Node
if (exists(order_id)) {
  return { json: { status: 'skipped', reason: 'duplicate' } };
}
```

## 4. Version Control
*   NEVER edit workflows directly in production.
*   Edit in Dev -> Export JSON -> Commit to Git -> Deploy.
