# Repository Guidelines

## Project Structure & Module Organization
- `pages/`: Next.js pages; `_app.jsx` wraps global layout, `_document.jsx` sets HTML shell, `posts/[id].jsx` renders markdown posts.
- `components/`: Reusable UI such as `layout.jsx`, `WebMention.jsx`, `network_graph.jsx` plus CSS modules.
- `lib/posts.js`: Markdown ingest, feed generation (RSS/Atom/JSON), and network data helpers.
- `posts/`: Source markdown with frontmatter; filenames follow `YYYYMMDD-title.md` and link to each other with `[text](slug.md)`.
- `public/`: Static assets and generated outputs (sitemaps, feeds); `styles/` holds global CSS and theme variables.

## Build, Test, and Development Commands
- `npm run dev`: Start the Next.js dev server at `http://localhost:3000`.
- `npm run build`: Production build; also generates RSS/Atom/JSON feeds under `public/rss` during the server build step.
- `npm run output`: Run `next export` to produce static files in `out/` (for static hosting).
- Environment: set `NEXT_PUBLIC_SITE_URL` before build so sitemaps/OG/meta and feeds use the correct origin.

## Coding Style & Naming Conventions
- JavaScript/JSX with 2-space indentation, double quotes, and functional React components.
- Components in `components/` use PascalCase filenames; utility modules are lower_snake where already used (`network_graph.jsx`).
- Prefer CSS Modules (`*.module.css`) scoped per component; keep global styles in `styles/global.css`.
- Frontmatter fields at minimum: `title` (string) and `date` (`YYYY-MM-DD`). Include `description` and `image` when available for OG/meta richness.

## Testing Guidelines
- No formal automated test suite is configured yet; validate changes via `npm run dev` and manual click-through of updated pages/posts.
- When adding critical flows, consider adding Playwright tests (dependency already present); place specs under `e2e/` and document the command used (e.g., `npx playwright test`).
- Before opening a PR, ensure feeds regenerate (`npm run build`) and that `public/rss` and sitemaps look reasonable.

## Commit & Pull Request Guidelines
- Write clear, imperative commits (e.g., `Add mermaid support to post renderer`, `Fix sitemap base URL`).
- Keep PRs focused; include a brief summary, scope of pages touched, and any config/env changes (`NEXT_PUBLIC_SITE_URL`, etc.).
- Add screenshots for visual tweaks and note any new content files added under `posts/`.
- If adding/renaming posts, mention the slug so reviewers can check links (`[text](slug.md)`) and feed entries.
