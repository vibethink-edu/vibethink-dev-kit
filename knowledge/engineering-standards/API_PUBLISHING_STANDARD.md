# 📡 API Publishing Standard (Redocly First)

**Status:** ✅ VibeThink Standard
**Tooling:** OpenAPI (OAS 3.0) + Redocly + GitHub Pages
**Goal:** Lightweight, professional API documentation without heavy SaaS dependencies.

---

## 1. The "Lightweight" Philosophy
We avoid heavy API gateways or paid hubs (like SwaggerHub) for internal/partner APIs.
We use **Static Generation**.

- **Source:** Code/YAML (`openapi/*.yaml`)
- **Build:** Redocly CLI (`redoc-cli bundle`)
- **Deploy:** GitHub Pages (`/docs`)

---

## 2. Directory Structure
Every API project must usually have this structure:

```
project-root/
├── openapi/
│   ├── main.yaml          # Root file
│   ├── paths/             # Endpoints
│   └── components/        # Schemas & Responses
├── docs/
│   └── html/              # Generated static files
└── .github/workflows/
    └── deploy-docs.yml    # Automation
```

---

## 3. The Specification (OAS 3.0)
- **Format:** YAML (preferred over JSON for comments).
- **Version:** OpenAPI 3.0.3 or 3.1.
- **Webhooks:** MUST be documented in `webhooks:` section (crucial for n8n integrations).

### Example Webhook Def:
```yaml
webhooks:
  orderCompleted:
    post:
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/OrderPayload'
```

---

## 4. Visualization (Redocly)
We use Redocly for its superior "Three-Panel" design (Sidebar, Docs, Examples).

**Build Command:**
```bash
npx @redocly/cli build-docs openapi/main.yaml -o docs/index.html
```

---

## 5. Deployment (GitHub Pages)
Documentation lives where the code lives.
1.  Enable GitHub Pages on repository (Source: `gh-pages` branch or `/docs` folder).
## 5. Deployment Automation (GitHub Actions)
To enable "Push-to-Publish", drop this file into `.github/workflows/deploy-docs.yml`.

**Prerequisite:** Go to Repo Settings -> Pages -> Source: **GitHub Actions**.

```yaml
name: Deploy API Docs to GitHub Pages

on:
  push:
    branches: ["main"]
    paths: ["openapi/**"] # Only rebuild if specs change

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Build Redoc HTML
        run: npx @redocly/cli build-docs openapi/main.yaml -o docs/index.html

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: 'docs'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

> **Agent Instruction:** When asked to "Document the API", do NOT create a Google Doc. Create/Update the `openapi/*.yaml` files and ensure this workflow is valid.
