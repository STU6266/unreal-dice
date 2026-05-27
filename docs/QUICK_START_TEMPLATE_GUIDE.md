# Quick Start Template Guide

Quick Start templates are managed in code.

Edit this file:

```text
src/domain/data/customQuickStartTemplates.ts
```

## Basic Workflow

1. Edit `src/domain/data/customQuickStartTemplates.ts`.
2. Run:

```bash
npm run test
npm run lint
npm run build
```

3. Commit and push.
4. Render redeploys the app from GitHub automatically.

No Supabase project, online admin login, or frontend-only password screen is needed.

## Required Fields

Every template needs:

- `name`
- `sets`

Every set needs:

- `name`
- `dice`
- `sides`

Do not write IDs, timestamps, source values, or generated group objects. The mapper creates those.

## Optional Fields

Templates may include:

- `lockedDiceCounting`: `"exclude"` or `"include"`
- `sortOrder`
- `combos`

Sets may include:

- `diceColor`
- `pipColor`
- `modifier`

Combos may include:

- `color`

## Locked Dice Counting

`"exclude"` means locked dice do not count in totals.

`"include"` means locked dice still count in totals.

If omitted, templates use `"exclude"`.

## Limits

- Dice per set: 1 to 30
- Sides per die: 2 to 100
- Sets per group: up to 40
- Combos per group: up to 20
- Sets inside one combo: up to 20

Combos reference set names exactly. If a combo set name is misspelled, the custom template is skipped so the public app does not crash.

A set can belong to only one combo.

## Examples

### One Simple d6

```ts
{
  name: 'Single d6',
  sets: [
    { name: 'Roll', dice: 1, sides: 6 },
  ],
}
```

### Risk-Style Group

```ts
{
  name: 'Risk Battle',
  lockedDiceCounting: 'exclude',
  sets: [
    { name: 'Attack', dice: 3, sides: 6 },
    { name: 'Defense', dice: 2, sides: 6 },
  ],
  combos: [
    { name: 'Battle', sets: ['Attack', 'Defense'] },
  ],
}
```

### Yahtzee-Style Group

```ts
{
  name: 'Five Dice Hold',
  lockedDiceCounting: 'include',
  sets: [
    { name: 'Roll', dice: 5, sides: 6 },
  ],
}
```

### RPG Attack Group

```ts
{
  name: 'RPG Attack',
  lockedDiceCounting: 'exclude',
  sets: [
    { name: 'Attack Roll', dice: 1, sides: 20 },
    { name: 'Damage', dice: 2, sides: 6 },
  ],
  combos: [
    { name: 'Attack + Damage', sets: ['Attack Roll', 'Damage'] },
  ],
}
```

### Custom Colors

```ts
{
  name: 'Fire Spell',
  sets: [
    {
      name: 'Fire Damage',
      dice: 3,
      sides: 6,
      diceColor: '#dc2626',
      pipColor: '#fff7ed',
    },
  ],
}
```

### Multiple Sets Without Combos

```ts
{
  name: 'RPG Dice Tray',
  sets: [
    { name: 'd4', dice: 1, sides: 4 },
    { name: 'd6', dice: 1, sides: 6 },
    { name: 'd8', dice: 1, sides: 8 },
    { name: 'd10', dice: 1, sides: 10 },
    { name: 'd12', dice: 1, sides: 12 },
    { name: 'd20', dice: 1, sides: 20 },
    { name: 'd100', dice: 1, sides: 100 },
  ],
}
```

### Modifier On Each Die

```ts
{
  name: 'Blessed Damage',
  sets: [
    {
      name: 'Damage',
      dice: 3,
      sides: 6,
      modifier: {
        enabled: true,
        operator: 'add',
        value: 2,
        application: 'each-die',
      },
    },
  ],
}
```

### Modifier On Set Total

```ts
{
  name: 'Heavy Attack',
  sets: [
    {
      name: 'Damage',
      dice: 2,
      sides: 8,
      modifier: {
        enabled: true,
        operator: 'multiply',
        value: 2,
        application: 'set-total',
      },
    },
  ],
}
```

## Notes

- Combo `sets` values must match set names exactly.
- Do not manually write IDs.
- Do not edit generated data unless there is a real code reason.
- Run tests before pushing.
- Render redeploys from GitHub after push.
