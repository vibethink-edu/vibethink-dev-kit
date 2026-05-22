# 🧪 Postman Testing Standard

**Status:** ✅ VibeThink Standard
**Purpose:** Ensure robust End-to-End (E2E) testing for APIs and asynchronous flows (Webhooks).

---

## 1. Philosophy
"An API without automated tests is legacy code from day one."

We use **Postman + Newman** because:
1.  It is language-agnostic.
2.  It excels at testing complex flows (Step 1 output -> Step 2 input).
3.  It is the industry standard for verifying Webhooks.

---

## 2. Directory Structure
Every project must have a `testing/postman` (or `.agents/testing/postman`) directory:

```
postman/
├── Project-API.postman_collection.json    # The Collection
├── environments/                          # Config per env
│   ├── Development.postman_environment.json
│   └── Production.postman_environment.json
├── run-tests.ps1                          # Execution script (Windows)
└── README.md                              # Specific instructions
```

---

## 3. The "Webhook Testing" Pattern
Testing asynchronous webhooks is hard. Here is the standard pattern:

### Standard Flow: "Trigger & Validate"
1.  **Trigger Action:** Call `POST /api/orders` (Simulate the event).
2.  **Wait:** Add a delay (e.g., 2000ms) to allow the webhook to fire.
3.  **Validate Side Effect:** Call `GET /api/orders/{id}` and assert that the status changed or the external ID was synced.

**Postman Test Script Example:**
```javascript
// Check if the webhook successfully updated the status
pm.test("Webhook Status Update", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.status).to.eql("CONFIRMED"); // Proves webhook ran
});
```

---

## 4. Automation with Newman
Tests must be runnable from CLI for CI/CD.

`npm install -g newman`

**Standard Command:**
```bash
newman run Project-API.postman_collection.json \
  -e environments/Development.postman_environment.json \
  --reporters cli,htmlextra
```

---

## 5. Mandatory Checks
Every Request in the collection MUST have at least these 3 tests:
1.  **Status Code 200/201** (`pm.response.to.have.status(200)`)
2.  **Response Time < 2000ms** (`pm.expect(pm.response.responseTime).to.be.below(2000)`)
3.  **Schema Validation** (Check for required keys like `id`, `success`)
