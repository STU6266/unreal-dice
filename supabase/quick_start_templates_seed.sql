insert into public.quick_start_templates
  (template_key, name, locked_dice_counting, sets, combos, is_published, sort_order)
values
  (
    'standard-dice',
    'Standard Dice',
    'exclude',
    '[
      {"id":"standard-dice-d4","name":"d4","diceCount":1,"sides":4,"diceColor":"#ffffff","pipColor":"#000000","modifier":0},
      {"id":"standard-dice-d6","name":"d6","diceCount":1,"sides":6,"diceColor":"#ffffff","pipColor":"#000000","modifier":0},
      {"id":"standard-dice-d8","name":"d8","diceCount":1,"sides":8,"diceColor":"#ffffff","pipColor":"#000000","modifier":0},
      {"id":"standard-dice-d10","name":"d10","diceCount":1,"sides":10,"diceColor":"#ffffff","pipColor":"#000000","modifier":0},
      {"id":"standard-dice-d12","name":"d12","diceCount":1,"sides":12,"diceColor":"#ffffff","pipColor":"#000000","modifier":0},
      {"id":"standard-dice-d20","name":"d20","diceCount":1,"sides":20,"diceColor":"#ffffff","pipColor":"#000000","modifier":0},
      {"id":"standard-dice-d100","name":"d100","diceCount":1,"sides":100,"diceColor":"#ffffff","pipColor":"#000000","modifier":0}
    ]'::jsonb,
    '[]'::jsonb,
    true,
    10
  ),
  (
    'yahtzee',
    'Yahtzee',
    'include',
    '[{"id":"yahtzee-yahtzee-roll","name":"Yahtzee Roll","diceCount":5,"sides":6,"diceColor":"#ffffff","pipColor":"#000000","modifier":0}]'::jsonb,
    '[]'::jsonb,
    true,
    20
  ),
  (
    'risk',
    'Risk',
    'exclude',
    '[
      {"id":"risk-attack","name":"Attack","diceCount":3,"sides":6,"diceColor":"#ffffff","pipColor":"#000000","modifier":0},
      {"id":"risk-defense","name":"Defense","diceCount":2,"sides":6,"diceColor":"#ffffff","pipColor":"#000000","modifier":0}
    ]'::jsonb,
    '[]'::jsonb,
    true,
    30
  ),
  (
    'monopoly-style',
    'Monopoly Style',
    'include',
    '[{"id":"monopoly-style-move-roll","name":"Move Roll","diceCount":2,"sides":6,"diceColor":"#ffffff","pipColor":"#000000","modifier":0}]'::jsonb,
    '[]'::jsonb,
    true,
    40
  ),
  (
    'farkle',
    'Farkle',
    'include',
    '[{"id":"farkle-farkle-roll","name":"Farkle Roll","diceCount":6,"sides":6,"diceColor":"#ffffff","pipColor":"#000000","modifier":0}]'::jsonb,
    '[]'::jsonb,
    true,
    50
  ),
  (
    'liars-dice',
    'Liar''s Dice',
    'include',
    '[{"id":"liars-dice-player-hand","name":"Player Hand","diceCount":5,"sides":6,"diceColor":"#ffffff","pipColor":"#000000","modifier":0}]'::jsonb,
    '[]'::jsonb,
    true,
    60
  ),
  (
    'ten-dice',
    'Ten Dice',
    'include',
    '[{"id":"ten-dice-ten-dice","name":"Ten Dice","diceCount":10,"sides":6,"diceColor":"#ffffff","pipColor":"#000000","modifier":0}]'::jsonb,
    '[]'::jsonb,
    true,
    70
  ),
  (
    'tabletop-rpg-essentials',
    'Tabletop RPG Essentials',
    'exclude',
    '[
      {"id":"tabletop-rpg-essentials-check-attack","name":"Check / Attack","diceCount":1,"sides":20,"diceColor":"#ffffff","pipColor":"#000000","modifier":0},
      {"id":"tabletop-rpg-essentials-damage-d6","name":"Damage d6","diceCount":1,"sides":6,"diceColor":"#ffffff","pipColor":"#000000","modifier":0},
      {"id":"tabletop-rpg-essentials-damage-d8","name":"Damage d8","diceCount":1,"sides":8,"diceColor":"#ffffff","pipColor":"#000000","modifier":0},
      {"id":"tabletop-rpg-essentials-damage-d10","name":"Damage d10","diceCount":1,"sides":10,"diceColor":"#ffffff","pipColor":"#000000","modifier":0},
      {"id":"tabletop-rpg-essentials-damage-d12","name":"Damage d12","diceCount":1,"sides":12,"diceColor":"#ffffff","pipColor":"#000000","modifier":0},
      {"id":"tabletop-rpg-essentials-percent-roll","name":"Percent Roll","diceCount":1,"sides":100,"diceColor":"#ffffff","pipColor":"#000000","modifier":0}
    ]'::jsonb,
    '[]'::jsonb,
    true,
    80
  ),
  (
    'simple-kids-dice',
    'Simple Kids Dice',
    'include',
    '[
      {"id":"simple-kids-dice-single-roll","name":"Single Roll","diceCount":1,"sides":6,"diceColor":"#ffffff","pipColor":"#000000","modifier":0},
      {"id":"simple-kids-dice-double-roll","name":"Double Roll","diceCount":2,"sides":6,"diceColor":"#ffffff","pipColor":"#000000","modifier":0}
    ]'::jsonb,
    '[]'::jsonb,
    true,
    90
  ),
  (
    'random-tables',
    'Random Tables',
    'exclude',
    '[
      {"id":"random-tables-d2-choice","name":"d2 Choice","diceCount":1,"sides":2,"diceColor":"#ffffff","pipColor":"#000000","modifier":0},
      {"id":"random-tables-d20-table","name":"d20 Table","diceCount":1,"sides":20,"diceColor":"#ffffff","pipColor":"#000000","modifier":0},
      {"id":"random-tables-d100-table","name":"d100 Table","diceCount":1,"sides":100,"diceColor":"#ffffff","pipColor":"#000000","modifier":0}
    ]'::jsonb,
    '[]'::jsonb,
    true,
    100
  )
on conflict (template_key) do update
set
  name = excluded.name,
  locked_dice_counting = excluded.locked_dice_counting,
  sets = excluded.sets,
  combos = excluded.combos,
  is_published = excluded.is_published,
  sort_order = excluded.sort_order;
