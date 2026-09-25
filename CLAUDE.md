# beshaped-webapp — public website, program store, member portal

Landing, pricing, program store (free + paid PDFs), member sign-up, and a client portal that is a
subset of the mobile app. Workspace context and cross-repo rules: ../CLAUDE.md (links to the Notion Dev Hub).

## Stack
- Framework: Next.js 16.1 (App Router, React 19.2, server components) · UI: Tailwind v4, react-icons, zod
- Firebase: client SDK (`lib/firebase.ts`), which server components also use for Firestore reads, plus
  Admin SDK (`lib/firebase-admin.ts`, Auth only) for session cookies
- Payments: **not implemented.** Provider decided: Adumo Online + Resend (see the Notion Payments page).
  Product and checkout UI exist only on branch `feature/product-store`, and its checkout form is a placeholder
  that fakes success. No webhook or confirmation code exists anywhere yet.
- Hosting: Netlify (confirmed, `netlify.toml`: `npm run build`, publish `.next`). Env var names:
  `NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`,
  `SESSION_SECRET` (used only by the unused `lib/session.ts`)

## Commands
- Dev: `npm run dev` · Build: `npm run build` · Typecheck: `npx tsc --noEmit` · Lint: `npm run lint` · Test: none

## Structure
- `app/(public)/`: marketing landing page (`page.tsx`; program cards and prices are hardcoded) and, on the
  feature branch, `products/` store pages
- `app/(auth)/login`: login · `app/(protected)/`: members area (`dashboard`, `programs`, `exercises`)
- `middleware.ts`: redirects to `/login` when there is no `session` cookie (presence only, not verified)
- `features/<area>/{api,types,components,hooks}`: auth, programs, exercises, products. Firestore reads live in
  `features/*/api/*.ts`, types in `features/*/types/*.ts`
- `features/auth/`: `AuthContext` (client sign-in → `createSession` server action → Admin session cookie),
  `getServerAuth.requireAuth()`, `AuthGuard`
- `components/`: marketing sections and navbars · `lib/`: Firebase init, admin, exercise media helper

## Conventions
- A purchase must grant the entitlement server-side (function/webhook), never from the client.
- Portal features mirror the mobile app's behaviour; keep the list in the Dev Hub's Scope section current.
- Marketing pages: fast, SEO-friendly, mobile-first; most traffic will be phones.
- Protected pages must call `requireAuth()` (verifies the session cookie with the Admin SDK); the middleware
  alone is not a security check. Today no page calls it, and `AuthGuard` is unused.
- Members-area program lists must filter by the user's entitlement (same rule as mobile: free programs +
  `users.availablePrograms`). `getAllPrograms()` currently returns every program.
- `"server-only";` at the top of `features/*/api/*.ts` is a no-op string; the working form is `import "server-only";`.

## Don't
- Don't touch payment keys, webhook secrets or pricing values without asking.
