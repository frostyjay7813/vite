This is a TypeScript project that implements a frontend build tooling called Vite. Please follow these guidelines when contributing:

## Quick Start

- **Setup**: `pnpm i` then `pnpm run build` in root
- **Develop Vite core**: `cd packages/vite && pnpm run dev` (auto-rebuilds)
- **Lint**: `pnpm run lint` (ESLint)
- **Format**: `pnpm run format` (oxfmt)
- **Test**: `pnpm test` (unit, E2E serve, and E2E build)
- **Debug**: Add `debugger;` statement, use VS Code "JavaScript Debug Terminal"

## Repository Structure

- `packages/vite/`: Core build tool and main package
  - `src/node/`: Config, server, build, optimizer, plugins, SSR
  - `src/client/`: Browser-side HMR and module execution
  - `src/shared/`: Shared utilities and constants
  - `src/types/`: Public API types (inlined, bundled)
- `packages/create-vite/`: CLI scaffolding tool
- `packages/plugin-legacy/`: Reference plugin implementation
- `playground/`: E2E test projects and real-world testing scenarios
- `docs/`: VitePress documentation

## Code Standards

### TypeScript & Style
- Follows TypeScript best practices
- Comments explain "why", not "what"
- Uses `pnpm run lint` (ESLint) and `pnpm run format` (oxfmt)

### Dependency Management (CRITICAL)
- **Most runtime deps belong in `devDependencies`** and are pre-bundled by Rolldown before publishing
- Use `(await import('dep')).default` for lazy imports, NOT `require()`
- Never use simple `require('somedep')` (ignored in ESM, won't bundle)
- **Exception**: Type packages, esbuild/rollup (can't bundle), or deps with public types
- Run `pnpm run build-types-check` to verify bundled types don't reference devDeps

## Plugin Development

### Plugin Types
- **App Plugins**: Global, traditional hooks (config, configResolved, configureServer, transformIndexHtml)
- **Environment Plugins**: Per-environment instances, access `this.environment` for DevEnvironment/BuildEnvironment/ScanEnvironment

### Common Patterns
- Plugins extend Rolldown (are valid Rollup plugins)
- Dev mode runs only non-output hooks; build runs full Rolldown pipeline
- Use `.apply` or conditionals to differentiate dev vs build
- Async plugin factories must return sync plugin objects
- Use `this.environment` only in environment plugin hooks, NOT in app hooks

## Testing

### Three Testing Tiers
1. **Unit Tests** (`vitest.config.ts`)
   - `packages/vite/__tests__/**/*.spec.ts`
   - Synchronous, isolated, no browser
   - Prefer when testable without mocks

2. **E2E Serve** (`vitest.config.e2e.ts`)
   - `playground/**/*.spec.ts`
   - Real HTTP server, Playwright browser
   - Use `viteTestUrl`, `page`, `editFile()` utilities
   - Flags: `isServe`, `isBuild`

3. **E2E Build** (same files, `VITE_TEST_BUILD=1`)
   - Tests build output in actual browser
   - Same test files run twice (use `isBuild`/`isServe` conditionals)

### Testing Utilities
- `~utils` alias: `page`, `viteTestUrl`, `viteServer`, `isBuild`, `isServe`, `editFile()`
- Global setup: `vitestGlobalSetup.ts` launches Chromium, copies playground to temp, filters symlinks

## Monorepo Workflow

- **pnpm workspaces**: All packages linked; playground folders also treated as packages
- **Workspace filtering**: `pnpm -r --filter='./packages/*' run <script>`
- **Watch all packages**: `pnpm run dev` (watch + rebuild all)
- **Windows symlink note**: May need [Developer Mode](https://docs.microsoft.com/en-us/windows/apps/get-started/enable-your-device-for-development) and `git config core.symlinks true`

## Environment System

- Vite supports **multiple environments** (client, SSR, worker, etc.)
- Each environment gets:
  - Separate plugin instances (environment constructor called once per env)
  - Distinct configuration
  - Own build pipeline
- Use `perEnvironmentState()` helper for cross-hook state tracking per environment

## PR Guidelines

### PR Title & Commit Messages
- Follow the [commit message convention](./commit-convention.md)
- Format: `type(scope): subject` where type is `feat|fix|docs|style|refactor|perf|test|build|ci|chore`
- Example: `feat(dev): add comments option`, `perf(build)!: remove foo option`

### PR Description
- **Problem**: Clear description of what this solves
- **Rationale**: Why this approach was chosen
- **Feature requests**: Include convincing reason; check if defaults, existing options, or plugins solve it
- **Bug fixes**: Explain root cause; link relevant code if possible
- **API changes**: Include problem statement (why this change is necessary)

### Code Review Checklist
- TypeScript best practices, proper types
- Comments explain "why" not "what"
- No concerning performance impacts
- Tests added (unit preferred; E2E in playground if needed)
- Documentation updated for public API changes
- Existing code structure maintained
- Follows [code conventions](../CONTRIBUTING.md)

## Common Gotchas

| Issue | Solution |
|-------|----------|
| Plugin type bundling errors | Inline types in `packages/vite/src/types/`, not as devDeps |
| Dependency not bundled | Ensure it's a devDep + lazy-imported with `(await import()).default` |
| Plugin environment context undefined | `this.environment` only in environment plugin hooks, not app hooks |
| Config too complex | Consider smarter defaults, existing options, or a plugin instead |
| E2E test assertion wrong | Use `isBuild`/`isServe` flags—same tests run in both modes |
| Slow dev startup | Check for circular imports; use `debug-serve` to profile |

## Documentation

- Update `docs/` for public API changes
- Link to existing docs from CONTRIBUTING.md and inline instructions; don't duplicate
- See [Project Philosophy](https://vite.dev/guide/philosophy) for design principles

## Other Considerations

- No concerning performance impacts
- Lazy-load heavy dependencies with `(await import()).default`
- Consider impact on dev server startup time and build performance
