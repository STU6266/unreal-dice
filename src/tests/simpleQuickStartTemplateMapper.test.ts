import { describe, expect, it } from 'vitest'
import { COMBO_COLOR_PALETTE, DEFAULT_SET_COLORS } from '../domain/constants/colors'
import {
  mapSimpleQuickStartTemplate,
  mapSimpleQuickStartTemplates,
} from '../domain/utils/simpleQuickStartTemplateMapper'
import { QUICK_START_TEMPLATES } from '../domain/data/quickStartTemplates'

describe('simpleQuickStartTemplateMapper', () => {
  it('maps a simple template to a Quick Start group', () => {
    const template = mapSimpleQuickStartTemplate({
      name: 'Single d6',
      sets: [{ name: 'Roll', dice: 1, sides: 6 }],
    })

    expect(template).toMatchObject({
      id: 'quick-start-single-d6',
      name: 'Single d6',
      source: 'quick-start',
      lockedDiceCounting: 'exclude',
    })
    expect(template?.sets[0]).toMatchObject({
      id: 'quick-start-single-d6-roll',
      diceCount: 1,
      sides: 6,
      diceColor: DEFAULT_SET_COLORS.diceColor,
      pipColor: DEFAULT_SET_COLORS.pipColor,
    })
  })

  it('maps combo set names to generated set IDs and applies a default color', () => {
    const template = mapSimpleQuickStartTemplate({
      name: 'Risk Battle',
      sets: [
        { name: 'Attack', dice: 3, sides: 6 },
        { name: 'Defense', dice: 2, sides: 6 },
      ],
      combos: [{ name: 'Battle', sets: ['Attack', 'Defense'] }],
    })

    expect(template?.combos[0]).toEqual({
      id: 'combo-battle',
      name: 'Battle',
      color: COMBO_COLOR_PALETTE[0],
      setIds: ['quick-start-risk-battle-attack', 'quick-start-risk-battle-defense'],
    })
  })

  it('skips templates with invalid dice counts', () => {
    const template = mapSimpleQuickStartTemplate({
      name: 'Invalid Dice',
      sets: [{ name: 'Too Many', dice: 31, sides: 6 }],
    })

    expect(template).toBeNull()
  })

  it('skips templates with invalid sides', () => {
    const template = mapSimpleQuickStartTemplate({
      name: 'Invalid Sides',
      sets: [{ name: 'd1', dice: 1, sides: 1 }],
    })

    expect(template).toBeNull()
  })

  it('skips templates with invalid combo references', () => {
    const template = mapSimpleQuickStartTemplate({
      name: 'Broken Combo',
      sets: [{ name: 'Attack', dice: 1, sides: 20 }],
      combos: [{ name: 'Full Attack', sets: ['Attack', 'Damage'] }],
    })

    expect(template).toBeNull()
  })

  it('skips duplicate custom template IDs when reserved IDs are supplied', () => {
    const templates = mapSimpleQuickStartTemplates(
      [
        { name: 'Standard Dice', sets: [{ name: 'Roll', dice: 1, sides: 6 }] },
        { name: 'Custom Dice', sets: [{ name: 'Roll', dice: 1, sides: 6 }] },
      ],
      { reservedTemplateIds: new Set(['quick-start-standard-dice']) },
    )

    expect(templates.map((template) => template.id)).toEqual(['quick-start-custom-dice'])
  })

  it('normalizes omitted modifiers to disabled modifiers', () => {
    const template = mapSimpleQuickStartTemplate({
      name: 'No Modifier',
      sets: [{ name: 'Roll', dice: 1, sides: 6 }],
    })

    expect(template?.sets[0]?.modifier.enabled).toBe(false)
  })

  it('maps modifier-enabled sets', () => {
    const template = mapSimpleQuickStartTemplate({
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
    })

    expect(template?.sets[0]?.modifier).toEqual({
      enabled: true,
      operator: 'add',
      value: 2,
      application: 'each-die',
    })
  })

  it('skips templates with invalid modifier values', () => {
    const template = mapSimpleQuickStartTemplate({
      name: 'Broken Modifier',
      sets: [
        {
          name: 'Damage',
          dice: 3,
          sides: 6,
          modifier: {
            enabled: true,
            operator: 'add',
            value: 0,
            application: 'each-die',
          },
        },
      ],
    })

    expect(template).toBeNull()
  })

  it('maps custom symbol templates', () => {
    const template = mapSimpleQuickStartTemplate({
      name: 'Symbol Test',
      sets: [
        {
          name: 'Symbols',
          dice: 0,
          sides: 6,
          symbolDice: [
            {
              faces: [
                { type: 'letter', value: 'A' },
                { type: 'color', value: '#dc2626', label: 'Red' },
              ],
            },
          ],
        },
      ],
    })

    expect(template?.sets[0]?.diceCount).toBe(0)
    expect(template?.sets[0]?.symbolDice[0]?.faces).toHaveLength(2)
  })

  it('skips invalid symbol templates', () => {
    const template = mapSimpleQuickStartTemplate({
      name: 'Broken Symbol',
      sets: [
        {
          name: 'Symbols',
          dice: 0,
          sides: 6,
          symbolDice: [{ faces: [{ type: 'letter', value: 'A' }] }],
        },
      ],
    })

    expect(template).toBeNull()
  })

  it('includes Dice Poker as a code-managed Quick Start template', () => {
    const dicePoker = QUICK_START_TEMPLATES.find((template) => template.name === 'Dice Poker')

    expect(dicePoker?.sets[0]?.symbolDice).toHaveLength(5)
  })
})
