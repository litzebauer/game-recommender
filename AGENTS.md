# Repository Guidelines

## Project Structure & Module Organization
- `app/` holds the TanStack Start application. Key areas include `app/routes/` for route loaders and server handlers, `app/components/` for UI primitives (with shadcn-inspired elements in `app/components/ui/`), and `app/lib/` for LangChain agents, schemas, and shared services.
- API integrations live under `app/client/` (`rawg`, `itad`) while reusable hooks live in `app/hooks/`. Static assets are served from `public/`, generated API schemas from `openapi/`, and additional architecture notes from `docs/`.
- Keep feature-specific utilities close to their usage. New shared modules belong in `app/lib/` with clear subfolder names (e.g., `agents`, `schemas`).

## Build, Test, and Development Commands
- `npm run dev`: Start the local development server at `http://localhost:3000`.
- `npm run dev:mock`: Launch the app with mocked API responses—useful when keys for RAWG/ITAD/OpenRouter are unavailable.
- `npm run build`: Produce a production build via Vinxi.
- `npm run start`: Serve the production build locally.
- `npm run lint` / `npm run lint:fix`: Check and automatically fix lint issues.
- `npm run format`: Apply Prettier formatting to all tracked file types.

## Coding Style & Naming Conventions
- Use TypeScript throughout, relying on the provided `tsconfig` path aliases. Components and hooks follow PascalCase (`GameCard`, `useSearchForm`); functions and variables use camelCase; constants are SCREAMING_CASE.
- Formatting is enforced by Prettier (2-space indentation, single quotes). Run `npm run format` before requesting review.
- Tailwind CSS classes should be composed with `clsx`/`tailwind-merge` where collisions are possible. Store new Zod schemas in `app/lib/schemas` and export via index files to keep imports consistent.

## Testing Guidelines
- Automated tests are not yet committed. When adding coverage, prefer Vitest for unit logic and colocate specs as `*.test.ts` beside the files they exercise.
- Until the test suite is formalized, validate flows by running `npm run dev` or `npm run dev:mock` and documenting manual QA steps in your PR description.
- Maintain at least smoke-level coverage for new LangChain agents (mock external calls) to keep suggestions deterministic.

## Commit & Pull Request Guidelines
- Follow the existing commit message style: lowercase type prefixes (`refactor:`, `feat:`, `fix:`) followed by a concise summary.
- Each PR should describe scope, configuration changes, manual test notes, and include screenshots or console transcripts when UI or agent behavior changes.
- Cross-reference related issues in the description and request review from a maintainer familiar with the affected area (`app/lib/agents`, `app/routes/api`, etc.).

## Environment & Configuration Tips
- Store secrets in a local `.env` file; see `README.md` for required keys (`OPENROUTER_API_KEY`, `RAWG_API_KEY`, `ITAD_API_KEY`, `TAVILY_API_KEY`).
- Use `npm run dev:mock` when collaborating without full credential access—keep mock fixtures under `app/client/*/mock.ts` and avoid committing real keys.
- Document any new environment variable in both `.env.example` (if added) and the PR summary to help downstream agents stay in sync.
