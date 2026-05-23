export const copy = {
  home: {
    appName: 'unrealDice',
    eyebrow: 'Local-first dice companion',
    mainMenuLabel: 'Main menu',
    subtitle: 'Offline dice tools for tabletop and quick decisions.',
    footerNote:
      'Designed for offline use. Saved groups will remain local to this device.',
    actions: [
      { label: 'Quick Start', path: '/quick-start' },
      { label: 'Create Group', path: '/groups/new' },
      { label: 'My Groups', path: '/groups' },
      { label: 'Import Backup', path: '/import' },
      { label: 'Coin & Random', path: '/random' },
      { label: 'Install App', path: '/install' },
    ],
  },
  placeholders: [
    { title: 'Quick Start', path: '/quick-start' },
    { title: 'Create Group', path: '/groups/new' },
    { title: 'My Groups', path: '/groups' },
    { title: 'Import Backup', path: '/import' },
    { title: 'Coin & Random', path: '/random' },
    { title: 'Install App', path: '/install' },
  ],
  laterPhase: 'Later phase',
  placeholderMessage: 'This feature will be implemented in a later phase.',
  backToHome: 'Back to Home',
} as const
