# beshaped-webapp — public website, program store, member portal

Landing, pricing, program store (free + paid PDFs), member sign-up, and a client portal that is a
subset of the mobile app. Workspace context and cross-repo rules: ../CLAUDE.md (links to the Notion Dev Hub).

## Stack
- Framework: <!-- TODO(claude) --> · UI: <!-- TODO(claude) -->
- Payments: <!-- TODO(claude): provider, where checkout + webhook/confirmation code lives -->
- Hosting: Netlify <!-- TODO(claude): confirm -->

## Commands
<!-- TODO(claude): fill from package.json -->
- Dev: `` · Build: `` · Typecheck: `` · Lint: `` · Test: ``

## Structure
<!-- TODO(claude): 5-10 lines; separate the public/marketing area from the logged-in portal -->

## Conventions
- A purchase must grant the entitlement server-side (function/webhook), never from the client.
- Portal features mirror the mobile app's behaviour; keep the list in the Dev Hub's Scope section current.
- Marketing pages: fast, SEO-friendly, mobile-first; most traffic will be phones.
<!-- TODO(claude): more, only if non-obvious -->

## Don't
- Don't touch payment keys, webhook secrets or pricing values without asking.
