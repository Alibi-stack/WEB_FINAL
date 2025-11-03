# WEB_FINAL

A small multi-page static website project demonstrating a simple learning platform UI built with plain HTML, CSS and vanilla JavaScript. The project includes pages for listing courses, viewing course details, a registration/sign-in flow (demo, client-side only), and a lightweight dark/light theme toggle.

## Features

- Multi-page static site: `index.html`, `courses.html`, `course-detail.html`, `about.html` and additional pages.
- Dark / Light theme toggle with preference persisted in `localStorage`.
- Simple registration and login demo using `localStorage` (client-side only).
- Profile page that displays the signed-in user's name and email.
- Small UI helpers: live clock, back-to-top button, progress indicator, toasts, and lightweight preloader.

## Getting started

This is a static project — no build step or server is strictly required, but some features (like localStorage and relative imports) work best when served from a local static server.

1. Open files directly in your browser (double-click `index.html`).
2. Or start a local static server (recommended) from the project root. For example, with Python 3:

```powershell
# from project root
python -m http.server 5501
# then open http://127.0.0.1:5501 in your browser
# WEB_FINAL — Znanija Land (static demo)

This repository is a small static demo of an online learning UI built with plain HTML, CSS and vanilla JavaScript. It demonstrates common UI patterns (pages, modals, theme toggle, simple auth demo using localStorage) and contains a few helper scripts for UI polish.

This README documents everything currently present in the project so you (and other developers) know what files exist, what they do, and how to run / test the demo locally.

---

## Quick start

Recommended: run a simple static server from the project root so relative URLs and local requests behave consistently.

Using Python 3 (PowerShell):

```powershell
# from project root (where README.md lives)
python -m http.server 5501
# open http://127.0.0.1:5501 in your browser
```

Or use VS Code Live Server or any other static server. You can also open the HTML files directly in your browser, but some demos behave best when served.

---

## Pages (top-level)

- `index.html` — Home page. Includes hero, KPI counters, featured courses, registration modal and global header/footer.
- `courses.html` — Courses listing page with search suggestions and client-side filtering.
- `course-detail.html` — Course detail layout with side panel "Enroll" card, progress area and requirements.
- `about.html` — About / informational page (upgrade.js injects FAQ on this page).
- `profile.html` — Profile page (created for the demo) showing the currently signed-in user's name and email; sign-out button clears session.
- `login.html` — Simple sign-in page that posts to client-side login handler.

Files added/modified by scripts at runtime:
- `upgrade.js` may inject a site footer (`footer.site-footer`) and a subscription modal if one is missing.

---

## JavaScript files and responsibilities (`js/`)

- `js/script.js` — central site behavior and the largest script. Responsibilities include:
	- Theme toggle and early theme application (reads/writes `localStorage.site-theme`).
	- Live clock start/stop and autostart preference (reads/writes `localStorage.autostartClock`).
	- Registration and login handlers (client-side demo that stores users in `localStorage.users` and session in `localStorage.currentUser`).
	- Profile redirect after successful register/login.
	- Preloader logic (shows/hides an overlay while the page loads).
	- Toast notifications, form helpers (button loading states), back-to-top, counters, and small UI wiring.

- `js/search.js` — search helpers used to filter courses on `courses.html` and highlight matches.
- `js/progress.js` — small jQuery-based progress bar that updates width based on document scroll (uses `#progressBar`).
- `js/forms.js` — general form helpers (set button loading, toasts, submit interception) used across pages.
- `js/counters.js` — animated numeric counters that run when visible (IntersectionObserver).
- `js/upgrade.js` — enhancement script that injects footer, subscription modal, FAQ on `about.html`, background palette buttons, and other small UI behaviors (ratings, toast utility).

Note: `js/progress.js` and several small features expect jQuery; the project includes a CDN jQuery include on pages that need it. `script.js` guards usage of jQuery so the rest of the script doesn't fail if jQuery is absent.

---

## CSS files and theming (`styles.css`, `css/`)

- `styles.css` — main project styles. Implements:
	- CSS variables (`--primary`, `--accent`, `--bg`, `--surface`, `--text`, etc.).
	- Layout (header sticky, container sizes, grid/cards, hero, footer), modals, buttons, toasts, preloader and responsive tweaks.
	- `.dark` variable overrides for dark theme colors.

- `css/upgrade.css` — an included stylesheet containing branded/third-party styles (gradients, glass effects). It defines defaults like `--bg`, `.site-header` gradient and many white panels.

- `css/dark-overrides.css` — project-specific overrides loaded after `upgrade.css` to neutralize light panels and force a consistent, matte dark-blue background when `.dark` is present. It keeps main containers transparent while ensuring card/panel surfaces use `--surface`.

---

## Data storage (localStorage keys)

The demo stores a handful of keys in `localStorage` for persistence. These are for demonstration only:

- `users` — JSON array of registered demo users (objects with at least `{ name, email, password, created }`).
- `currentUser` — JSON object `{ name, email }` representing the signed-in user (session emulation).
- `site-theme` — string `"dark"` or `"light"`, used to persist theme choice.
- `autostartClock` — string `'true'` when the user requested the clock to autostart on load.

Security note: passwords are stored plaintext in `localStorage` in this demo. This is insecure and only acceptable for local testing. Replace with server-side auth and hashed passwords in any production project.

---

## Runtime behavior and UX details

- Preloader: an overlay with a spinner (`#preloader`) is shown on most pages and hidden after `window.load` or a fallback timeout. `courses.html` may omit the preloader by design.
- Theme: the site applies saved theme early via inline script in `<head>` to avoid flash-of-incorrect-theme (FOIT). Toggle updates `localStorage.site-theme`.
- Registration / Login: the modal on `index.html` allows registration. On successful registration/login the site sets `currentUser` and redirects to `profile.html`.
- Profile: `profile.html` reads `currentUser` and shows name / email; the Sign out button clears `currentUser` and returns to the homepage.
- Search & highlights: `courses.html` contains a search input that filters visible `.card` elements and highlights matching text across the page.
- Progress bar: the top-centered progress rail (`#scrollProgress` / `#progressBar`) reflects page scroll. The progress script is jQuery-based but there is a guard in `script.js` so the site doesn't fail without jQuery.
- Upgrade enhancements (`upgrade.js`): injects footer actions, subscription modal and FAQ when appropriate, and contains small helpers (play sound, change background palettes, rating widget).

---

## How to reset demo data (developers/testers)

Open browser DevTools → Application (or Storage) → Local Storage → select your origin (e.g., `http://127.0.0.1:5501`). You can:

- Delete single keys (`users`, `currentUser`, `site-theme`, `autostartClock`).
- Or clear all storage for this origin using `localStorage.clear()` in Console.

Example Console commands:

```js
// remove only the signed-in user
localStorage.removeItem('currentUser');

// remove all demo users
localStorage.removeItem('users');

// remove theme only
localStorage.removeItem('site-theme');

// clear everything for this origin
localStorage.clear();
```

---

## Files layout (full list)

Top-level HTML
- `index.html` — home (hero, KPI counters, registration modal)
- `courses.html` — course listing and search
- `course-detail.html` — detail & enroll panel
- `about.html` — about + FAQ injected by `upgrade.js`
- `profile.html` — user profile page
- `login.html` — standalone sign-in page

CSS
- `styles.css` — main styles and theme variables
- `css/upgrade.css` — third-party/branded styles used by the demo
- `css/dark-overrides.css` — explicit dark-mode overrides to neutralize conflicting rules

JS
- `js/script.js` — site glue: theme, auth, preloader, toasts, counters, form helpers, and more
- `js/search.js` — course search and highlights
- `js/progress.js` — scroll progress bar (jQuery)
- `js/forms.js` — generic form helpers (loading states, toast helpers)
- `js/counters.js` — animated numeric counters
- `js/upgrade.js` — enhancement script (footer injection, modal, FAQ, small utilities)

Other
- `README.md` — this file

---

## Known limitations & TODOs

- Authentication is purely client-side and insecure (passwords in localStorage). Replace with server-side auth for production.
- Many dark-mode fixes are implemented by overrides; a long-term improvement is to unify them by using a single variable-driven theme in `styles.css` and remove fracture across `upgrade.css`.
- Tests and linting are not included. Consider adding automated checks for maintainability.

---

## Contributing / Next steps

- If you want me to:
	- Replace client-side auth with a simple hashed check (e.g. PBKDF2/SHA) to avoid storing raw passwords locally.
	- Replace jQuery-dependent bits with vanilla JS.
	- Add screenshot examples and a short demo GIF to the README.

Open an issue or tell me what you'd like next — I can make the changes and update the README further.

---

Team: SE-2404 — Alibi (Алиби / Alibi Aibekuly) • Sultan (Султан)




