# QA Manifest — QA Checklist Builder

A small React app for QA engineers to build, verify, and export a per-ticket test
checklist. Pick the modules that apply (DB, UI, API, Security, Microservices,
Performance, Accessibility, Mobile, Regression…), select the checks relevant to
your ticket, add remarks, and export a clean **Markdown** or **PDF** record.

Everything is stored in the browser's `localStorage` — there is no backend and
no data leaves the device.

## Features

- **Modular checklist** — all checklist content lives in one JSON file
  (`src/data/checklists.json`), grouped by module → category → item.
- **Ticket-based workflow** — Setup → Checklist → Review, tracked with a stepper.
- **Per-item and overall remarks.**
- **Progress tracking** persisted per ticket (tester name, ticket ID/title,
  selected checks, % complete) so you can pick up where you left off.
- **Export to Markdown or PDF**, structured and ready to attach to a ticket.
- **Multiple saved tickets**, listed on the home screen with live progress.

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL. To produce a production build:

```bash
npm run build   # outputs to dist/
npm run preview # serve the production build locally
```

## Project structure

```
src/
  data/checklists.json     # the single source of truth for modules & checklist items
  hooks/
    useLocalStorage.js     # generic localStorage-backed state
    useTickets.js          # CRUD for saved tickets + "last tester name"
  utils/
    ticketUtils.js         # ticket creation, progress calculation
    exportMarkdown.js      # builds & downloads the .md export
    exportPdf.js           # builds & downloads the .pdf export (jsPDF)
  components/
    Home.jsx               # ticket list + "new ticket" modal
    Workspace.jsx           # per-ticket shell (stepper + steps)
    Stepper.jsx
    ModuleSelector.jsx      # Step 1
    ChecklistStep.jsx       # Step 2
    ReviewStep.jsx          # Step 3 (manifest summary + export buttons)
```

## Editing the checklist content

Everything shown in the app comes from `src/data/checklists.json`. To add a new
module, category, or item, edit that file — no component code needs to change.

```json
{
  "id": "unique-module-id",
  "name": "Module Display Name",
  "shortName": "Short label for chips",
  "description": "One line shown on the module card",
  "categories": [
    {
      "id": "unique-category-id",
      "name": "Category heading",
      "items": [
        { "id": "unique-item-id", "text": "The checklist statement shown to the user" }
      ]
    }
  ]
}
```

Item and category `id`s must stay unique across the file — they're used as
localStorage keys for each ticket's saved state.

## Deploying to Cloudflare Pages via GitHub Actions

This repo includes `.github/workflows/deploy.yml`, which builds the app and
publishes `dist/` to Cloudflare Pages on every push to `main`.

1. **Create a Cloudflare Pages project** (Cloudflare dashboard → Workers & Pages
   → Create → Pages → "Connect to Git" or "Direct Upload" — either works, since
   the action publishes directly). Name it `qa-manifest`, or update
   `projectName` in the workflow to match whatever you choose.
2. **Create a Cloudflare API token** with the `Cloudflare Pages: Edit`
   permission (Account → Manage Account → API Tokens).
3. **Add repository secrets** (GitHub repo → Settings → Secrets and variables
   → Actions):
   - `CLOUDFLARE_API_TOKEN` — the token from step 2
   - `CLOUDFLARE_ACCOUNT_ID` — found on the Cloudflare dashboard's right sidebar
4. Push to `main`. The workflow installs dependencies, runs `npm run build`,
   and deploys `dist/` to Cloudflare Pages.

The app is a static SPA, so a `public/_redirects` file (`/* /index.html 200`)
is included in case client-side routing is added later.

## Data & privacy

All ticket data (tester name, ticket ID/title, selected checks, remarks,
progress) is written to `window.localStorage` in the visiting browser only.
Clearing site data or using a different browser/device will not carry the data
over — there is intentionally no server or sync layer.

## Tech stack

- React + Vite
- [jsPDF](https://github.com/parallax/jsPDF) for PDF export
- Plain CSS (custom design system, no UI framework)
