# unrealDice

unrealDice is a local-first dice application for tabletop games and quick decisions. It is built as a responsive React portfolio project with saved dice groups, configurable sets and combos, backup import/export, Coin & Random tools, real Play Mode, and offline-capable PWA support.

## Current Features

- Quick Start read-only dice templates
- Saved user groups with configurable sets, colors, locked-dice counting, and combos
- Real Play Mode with set rolls, Roll All, combo rolls, expandable dice, and temporary locks
- Per-set roll history and local Coin & Random histories
- Safe JSON export/import for saved group backups
- Install App / Offline Help screen and production PWA configuration

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- Vitest
- vite-plugin-pwa
- localStorage-backed services for saved local data

## Local Development

```bash
npm install
npm run dev
npm run test
npm run lint
npm run build
npm run preview
```

## PWA Testing

Production PWA behavior should be tested after:

```bash
npm run build
npm run preview
```

The normal development server is for development feedback and should not be used as proof of installability or offline behavior.

## Local Data

User groups and histories are stored locally in the current browser/device. They can be lost if browser data is cleared, the app is removed, private browsing is used, or the device is reset. Export backups to protect saved group configurations.

## Future Enhancements

Optional German UI translation and possible later mobile packaging may be added after final polish.
