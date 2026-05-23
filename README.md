# unrealDice

unrealDice is a local-first dice application for tabletop games and quick decisions. Version 1 includes configurable dice groups, combos, safe backup import/export, Coin & Random tools, a real play mode, and an offline-capable PWA foundation.

## Current Features

- Home navigation for all Version 1 tools
- Quick Start read-only templates with copy-to-edit support
- Optional Supabase-backed published Quick Start templates with built-in offline fallback
- Saved user groups with configurable sets, colors, locked-dice counting, and combos
- Create/Edit Group workflow with validation, confirmations, and local persistence
- Real Play Mode with set rolls, Roll All, combo rolls, expandable dice, temporary locks, set history, and Add Combo during play
- Coin & Random tools with separate local histories
- Safe JSON export/import for saved group backups
- Install App / Offline Help screen and production PWA configuration

## Technical Decisions

- React, TypeScript, Vite, and React Router power the client app.
- Data is local-first: saved groups and histories live in browser storage, not on a server.
- JSON backups are validated and imported as new IDs to avoid overwriting existing groups.
- Dice results, expanded sets, and locked dice are session-only play state and are not saved into reusable group definitions.
- PWA support uses a service worker for the application shell while user data remains in browser storage.
- Remote template management, when configured, uses Supabase Auth and RLS; the unlinked studio route is not treated as security.

## Screenshots

Screenshots will be added after deployment and real-device verification.

## Getting Started

```bash
npm install
npm run dev
```

## Test, Build, Preview

```bash
npm run test
npm run lint
npm run build
npm run preview
```

## PWA Offline Testing

Production PWA behavior should be tested after:

```bash
npm run build
npm run preview
```

Open the preview URL in Chrome or Edge, inspect the manifest and service worker in DevTools, load the main routes once, enable offline mode, and reload a previously opened route. The normal development server is not proof of installability or offline behavior.

Production hosting should serve `index.html` as the SPA fallback for app routes such as `/groups`, `/random`, and `/play/group/:groupId`.

## Remote Quick Start Studio

The public Quick Start screen works without Supabase by using the built-in templates. When Supabase is configured with `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`, public users can receive published remote templates and cache the last valid published list for offline fallback.

An unlinked studio route exists at `/studio/templates` for managing remote templates. Admin access depends on Supabase email/password Authentication and Row Level Security policies, not on the route being hidden. See `docs/SUPABASE_STUDIO_SETUP.md` before configuring or deploying this feature.

## Local Data And Backups

User groups and histories are stored locally in the current browser/device. They can be lost if browser data is cleared, the app is removed, private browsing is used, or the device is reset. Export backups to protect saved group configurations.

## Architecture Overview

- `src/app`: routing and app-level PWA update prompt wiring
- `src/screens`: route screens for Home, groups, import/export, random tools, play, and install help
- `src/components`: reusable UI pieces for groups, play mode, backup dialogs, random tools, and PWA prompts
- `src/domain`: types, constants, validation, templates, and pure transformation/engine utilities
- `src/hooks`: focused React state and browser interaction hooks
- `src/services`: local storage, backup, random history, and set history services
- `src/content/en.ts`: centralized English UI copy
- `docs`: project specification and manual QA checklist

## Future Enhancements

- German language support
- Optional native packaging through Capacitor
