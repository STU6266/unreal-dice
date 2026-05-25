# unrealDice

unrealDice is a local-first React and TypeScript PWA for tabletop dice management, quick random decisions and reusable dice setups.

The project is more than a simple dice roller: it focuses on saved dice groups, reusable play setups, offline use, safe import/export and a practical mobile-friendly app flow.

## Live Demo

```text
https://unrealdice.onrender.com
```

## What This Project Shows

- React and TypeScript app structure
- PWA/offline app foundation
- local-first browser data handling
- reusable dice groups and play sessions
- JSON backup import/export with validation
- route-based app flow with React Router
- mobile-friendly product thinking
- separation between domain logic, services, hooks and UI screens

## Core Features

- saved dice groups with configurable dice sets
- colors, modifiers and locked-dice counting
- reusable combo rolls
- real play mode with Roll All, set rolls and combo rolls
- expandable dice results and temporary locked states
- roll history and local tool histories
- Coin and Random tools for quick decisions
- Quick Start templates with copy-to-edit support
- safe JSON export/import for backups
- install/offline help screen
- production PWA configuration

## PWA and Offline Behavior

unrealDice is designed as a local-first app. Saved groups and histories live in browser storage, so the app can stay useful without a backend account system.

The PWA setup provides an installable app shell. Production offline behavior should be tested from a built preview or deployed version, not only from the development server.

Important note: browser-local data can be lost if the user clears browser data, removes the app, uses private browsing or resets the device. Export backups are therefore part of the product flow.

## Import and Export

The backup system exports saved groups as JSON. Imports are validated and created with new IDs so existing groups are not overwritten accidentally.

This was an important part of the project because local-first apps need a clear way for users to move or protect their data.

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- PWA/service worker setup
- Browser storage
- Optional Supabase-backed Quick Start templates

## Architecture Overview

```text
src/app          routing and app-level PWA update handling
src/screens      route screens for groups, play, tools and help
src/components   reusable UI components
src/domain       types, constants, validation and pure utilities
src/hooks        focused React state/browser interaction hooks
src/services     storage, backup and history services
src/content      centralized UI copy
docs             setup notes and QA documentation
```

The project separates reusable domain behavior from screen components so dice logic, validation and persistence can be tested and maintained more easily.

## Screenshots

Repository-local screenshots are still planned. The current portfolio page uses real screenshots captured from the running app and can be used as the visual reference for this project.

Suggested future screenshot set for this README:

- dashboard/home view
- saved dice group editor
- play mode with roll result
- mobile/PWA view
- import/export flow

## Getting Started

```bash
git clone https://github.com/STU6266/unreal-dice.git
cd unreal-dice
npm install
npm run dev
```

## Test, Build and Preview

```bash
npm run test
npm run lint
npm run build
npm run preview
```

Production PWA behavior should be checked after:

```bash
npm run build
npm run preview
```

Then open the preview URL in Chrome or Edge, inspect the manifest and service worker in DevTools, load the main routes once, enable offline mode and reload a previously opened route.

Production hosting should serve `index.html` as the SPA fallback for routes such as `/groups`, `/random` and `/play/group/:groupId`.

## Optional Remote Quick Start Templates

The public Quick Start screen works without Supabase by using built-in templates.

When `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are configured, the app can load published remote templates and cache the last valid list for offline fallback.

The unlinked studio route at `/studio/templates` is not security by itself. Admin access depends on Supabase Authentication and Row Level Security policies.

See:

```text
docs/SUPABASE_STUDIO_SETUP.md
```

## Project Scope

This is a portfolio-ready PWA/tool project focused on practical app UX and local-first data handling.

Possible future improvements:

- German language support
- repository-local screenshots
- more template packs
- optional native packaging through Capacitor
- broader automated coverage for backup and play flows
