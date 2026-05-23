# unrealDice Development Rules

## Project Goal

unrealDice is an installable offline-capable dice application for mobile and desktop browsers. I am building it as a professional portfolio project that demonstrates clean frontend architecture, responsive interaction design, local-first data storage, safe import/export handling, and Progressive Web App development.

## Technology Direction

- Use React, TypeScript, and Vite.
- The app will later be configured as a Progressive Web App.
- Keep the code suitable for possible future wrapping with Capacitor for Android and iOS.
- Do not add a backend, account system, cloud database, or unnecessary dependencies unless I explicitly request them.
- Store user-created groups locally through a dedicated storage service, initially using localStorage.
- Keep storage logic isolated so it can later be migrated to IndexedDB or native storage without rewriting the UI.

## Code Quality

- Use English file names, component names, variable names, function names, UI text, and comments.
- Keep components small and focused.
- Keep dice logic, storage logic, validation, and UI rendering separate.
- Use TypeScript interfaces or types for groups, sets, combos, history, imports, and play-session state.
- Avoid `any`.
- Prefer small, reviewable changes instead of large rewrites.
- Do not add features unless they are part of the agreed unrealDice plan.

## Comment Style

Use comments only where they explain a meaningful design decision, non-obvious behavior, validation rule, or architectural reason.

Important comments should be written in first person, as if I am explaining my decisions to a recruiter reviewing the project.

Good example:

```ts
// I keep storage access behind this service so I can later move from
// browser storage to a native mobile solution without rewriting the UI.
```

Do not add comments that only repeat obvious code.

## UX and Safety

- Build mobile-first, while keeping desktop use clean and responsive.
- Use a professional, readable visual design with only lightweight motion.
- Important destructive actions must require confirmation.
- Never silently overwrite imported, duplicated, or copied groups.
- Quick Start templates are read-only; users can copy them into My Groups for editing.
- Current roll results and locked dice are play-session state, not permanent group configuration.
- Explain that locally stored data can be lost and that exported backups are recommended.

## Working Method

- Implement the app in phases.
- Keep each phase buildable before starting the next one.
- Run lint and build checks after meaningful changes.
- Do not implement the full Play Mode until the shared models, storage layer, screens, and group editor foundations are stable.
