# Erledo Rework

The implementation is self-contained in `Rework/`; the old page is not imported.

## Start and build

- `pnpm dev`: local Vite development server on http://127.0.0.1:5173
- `pnpm build`: TypeScript checking and production build
- `pnpm assets`: regenerate the existing category/bento assets

## Pages

For a manual Netlify deployment, run `pnpm build` and upload the complete `dist/`
folder. The generated `_redirects` file proxies `/api/*` to the existing Erledo
backend before applying the SPA fallback, so direct links and refreshes on
frontend subpages resolve correctly. Authenticated production flows still depend
on the backend's session-cookie and request-origin policies.

Native links load the React application at `/`, `/login`, `/registrieren`,
`/passwort-vergessen`, `/auftrag-erstellen`, `/datenschutz`, `/impressum`, and
`/nutzungsbedingungen`. The existing `/register`, `/auftrag/neu`, and `.html`
legal paths are supported as aliases. Configure production hosting to serve
`index.html` for these frontend routes while retaining `/api/*` as backend routes.

## Existing Erledo backend

The forms call the existing JSON/session API and multipart task API. Vite proxies
`/api/*` to `https://erledo.at` for local development. This is the real service:
submitting valid credentials or publishing a task is a real action, not a demo.
No account or task was created during verification.

Production should serve the new frontend and the existing API on the same origin.
`VITE_API_BASE_URL` can override the API origin, but a separate origin requires
appropriate backend CORS and session-cookie configuration. Passwords are never
written to browser storage, URLs, or application logs. Task drafts stay in React
memory; signing in within the final wizard step keeps the draft in place.

Successful API responses are required before displaying login/task success.
The existing `/api/auth/login`, `/api/auth/register`, `/api/auth/forgot-password`,
`/api/auth/me`, and `/api/tasks` contracts were inspected on the public Erledo
pages. Live authenticated success paths require an actual Erledo account and
were not exercised as part of UI verification.

## Legal content and contact

The legal page content is imported from the existing public Erledo legal pages,
with the source date and original link preserved. `scripts/import-legal-content.py`
can refresh `src/data/legal.json`. It extracts and sanitizes content only;
the original page's code, styling, and scripts are not reused. This is a design
migration of existing declarations, not a revision of their legal substance.

Telegram points to `https://t.me/erledo`, the community linked on the live site.
Email links point to the published `erledo.app@gmail.com` address.
