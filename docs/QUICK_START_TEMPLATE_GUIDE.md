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
- `symbolDice`

Combos may include:

- `color`

## Locked Dice Counting

`"exclude"` means locked dice do not count in totals.

`"include"` means locked dice still count in totals.

If omitted, templates use `"exclude"`.

## Limits

- Numeric dice per set: 0 to 30
- Sides per die: 2 to 100
- Total numeric plus symbol dice per set: 1 to 30
- Faces per symbol die: 2 to 30
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

### Simple Symbol Die

```ts
{
  name: 'Story Die',
  sets: [
    {
      name: 'Story',
      dice: 0,
      sides: 6,
      symbolDice: [
        {
          faces: [
            { type: 'icon', symbol: 'Danger', label: 'Danger' },
            { type: 'icon', symbol: 'Treasure', label: 'Treasure' },
            { type: 'letter', value: 'A' },
            { type: 'color', value: '#dc2626', label: 'Red' },
          ],
        },
      ],
    },
  ],
}
```

### Dice Poker

```ts
{
  name: 'Dice Poker',
  lockedDiceCounting: 'include',
  sets: [
    {
      name: 'Poker Dice',
      dice: 0,
      sides: 6,
      symbolDice: [
        {
          faces: [
            { type: 'number', value: 9, countsTowardTotal: false },
            { type: 'number', value: 10, countsTowardTotal: false },
            { type: 'letter', value: 'J' },
            { type: 'letter', value: 'Q' },
            { type: 'letter', value: 'K' },
            { type: 'letter', value: 'A' },
          ],
        },
      ],
    },
  ],
}
```

Add more symbol dice by copying the object inside `symbolDice`.

### Weighted Symbol Die

Duplicate faces are allowed:

```ts
{
  name: 'Weighted Weather',
  sets: [
    {
      name: 'Weather',
      dice: 0,
      sides: 6,
      symbolDice: [
        {
          faces: [
            { type: 'icon', symbol: 'Sun', label: 'Sun' },
            { type: 'icon', symbol: 'Sun', label: 'Sun' },
            { type: 'icon', symbol: 'Rain', label: 'Rain' },
            { type: 'icon', symbol: 'Lightning', label: 'Lightning' },
          ],
        },
      ],
    },
  ],
}
```

### Countable Number Face

```ts
{
  name: 'Loot Value',
  sets: [
    {
      name: 'Loot',
      dice: 0,
      sides: 6,
      symbolDice: [
        {
          faces: [
            { type: 'number', value: 0, countsTowardTotal: true },
            { type: 'number', value: 5, countsTowardTotal: true },
            { type: 'number', value: 10, countsTowardTotal: true },
          ],
        },
      ],
    },
  ],
}
```

### Visual Number Face

```ts
{
  name: 'Poker Rank',
  sets: [
    {
      name: 'Rank',
      dice: 0,
      sides: 6,
      symbolDice: [
        {
          faces: [
            { type: 'number', value: 9, countsTowardTotal: false },
            { type: 'number', value: 10, countsTowardTotal: false },
            { type: 'letter', value: 'J' },
          ],
        },
      ],
    },
  ],
}
```

### Mixed Numeric And Symbol Set

```ts
{
  name: 'Attack With Effect',
  sets: [
    {
      name: 'Attack',
      dice: 2,
      sides: 6,
      symbolDice: [
        {
          faces: [
            { type: 'icon', symbol: 'Fire', label: 'Fire' },
            { type: 'icon', symbol: 'Ice', label: 'Ice' },
            { type: 'number', value: 2, countsTowardTotal: true },
          ],
        },
      ],
    },
  ],
}
```

### Color Faces

```ts
{
  name: 'Color Choice',
  sets: [
    {
      name: 'Color',
      dice: 0,
      sides: 6,
      symbolDice: [
        {
          faces: [
            { type: 'color', value: '#dc2626', label: 'Red' },
            { type: 'color', value: '#2563eb', label: 'Blue' },
            { type: 'color', value: '#16a34a', label: 'Green' },
          ],
        },
      ],
    },
  ],
}
```

### Letter Faces

```ts
{
  name: 'Letter Die',
  sets: [
    {
      name: 'Letter',
      dice: 0,
      sides: 6,
      symbolDice: [
        {
          faces: [
            { type: 'letter', value: 'A' },
            { type: 'letter', value: 'B' },
            { type: 'letter', value: 'Ä' },
            { type: 'letter', value: 'ß' },
          ],
        },
      ],
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
