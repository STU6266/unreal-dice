# unrealDice — Product Specification

## 1. Product Goal

unrealDice is an installable offline-capable dice application for mobile phones, tablets, and desktop browsers.

I am building it as a professional portfolio project. The app should demonstrate:

- React and TypeScript application structure
- clean separation of UI, storage, validation, and dice logic
- responsive mobile-first interaction design
- local-first data storage
- safe import/export handling
- Progressive Web App capability
- thoughtful game-focused UX

The app should feel like a finished small product, not a basic tutorial dice roller.

## 2. Technical Direction

### Stack

- Vite
- React
- TypeScript
- PWA support after the main features are stable
- localStorage accessed only through a dedicated storage service
- possible later migration to IndexedDB or Capacitor storage
- possible later Capacitor packaging for Android/iOS

### Version 1 Does Not Need

- backend
- login
- account system
- cloud sync
- online database
- multiplayer
- App Store publishing

## 3. Language and Design

### Language

- Initial UI language: English
- Prepare the code so German can be added later without rewriting the UI
- Keep user-facing text centralized where practical

### Visual Direction

- mobile-first responsive design
- professional, clean, slightly game-oriented visual style
- dark-oriented theme is acceptable as the default
- a subtle old-school or pixel-inspired feeling may be used if readability remains strong
- keep animation lightweight
- use CSS/component-based dice rather than heavy image files
- allow vertical scrolling instead of shrinking controls until they become difficult to use

The final detailed visual decisions may be refined during implementation.

## 4. Main Screens

The app requires these screens:

1. Home / Main Menu
2. Quick Start
3. Create Group
4. My Groups
5. Edit Group
6. Edit Set
7. Create/Edit Combo
8. Import Backup
9. Play Mode
10. Coin & Random Menu
11. Heads / Tails Mode
12. Random Number Mode
13. Install App / Offline Help

Use dialogs or popups instead of extra full pages for:

- help text
- set history
- coin history
- random number history
- delete confirmations
- discard-unsaved-changes confirmations
- overwrite/save confirmations
- export options
- import validation/confirmation

## 5. Home / Main Menu

The home screen should show the app name `unrealDice` and these actions:

- Quick Start
- Create Group
- My Groups
- Import Backup
- Coin & Random
- Install App

Export is handled through My Groups, not as a separate home action.

## 6. Quick Start

Quick Start provides built-in read-only dice groups.

Each template supports:

- Play
- Copy

### Quick Start Rules

- Templates cannot be edited directly.
- Templates are not exported.
- Copying a template creates a normal editable group in My Groups.
- Copied names use:
  - `Yahtzee Copy`
  - `Yahtzee Copy 2`
  - `Yahtzee Copy 3`
- Never silently overwrite an existing group.
- Copied templates preserve their Locked Dice Counting rule.
- No dice are locked when a template or copied group first starts.

### Initial Templates

Keep the list useful and concise. Begin with these templates:

#### Standard Dice

Sets:

- d4: 1 die, 4 sides
- d6: 1 die, 6 sides
- d8: 1 die, 8 sides
- d10: 1 die, 10 sides
- d12: 1 die, 12 sides
- d20: 1 die, 20 sides
- d100: 1 die, 100 sides

Locked Dice Counting: Exclude locked dice from total.

#### Yahtzee

Sets:

- Yahtzee Roll: 5 dice, 6 sides

Locked Dice Counting: Include locked dice in total.

#### Risk

Sets:

- Attack: 3 dice, 6 sides
- Defense: 2 dice, 6 sides

The user locks dice when fewer attack or defense dice are needed.

Locked Dice Counting: Exclude locked dice from total.

#### Monopoly Style

Sets:

- Move Roll: 2 dice, 6 sides

Locked Dice Counting: Include locked dice in total.

#### Farkle

Sets:

- Farkle Roll: 6 dice, 6 sides

Locked Dice Counting: Include locked dice in total.

#### Liar's Dice

Sets:

- Player Hand: 5 dice, 6 sides

Locked Dice Counting: Include locked dice in total.

#### Ten Dice

Sets:

- Ten Dice: 10 dice, 6 sides

Locked Dice Counting: Include locked dice in total.

#### Tabletop RPG Essentials

Sets:

- Check / Attack: 1 die, 20 sides
- Damage d6: 1 die, 6 sides
- Damage d8: 1 die, 8 sides
- Damage d10: 1 die, 10 sides
- Damage d12: 1 die, 12 sides
- Percent Roll: 1 die, 100 sides

Locked Dice Counting: Exclude locked dice from total.

#### Simple Kids Dice

Sets:

- Single Roll: 1 die, 6 sides
- Double Roll: 2 dice, 6 sides

Locked Dice Counting: Include locked dice in total.

#### Random Tables

Sets:

- d2 Choice: 1 die, 2 sides
- d20 Table: 1 die, 20 sides
- d100 Table: 1 die, 100 sides

Locked Dice Counting: Exclude locked dice from total.

## 7. User Groups and Limits

A user-created group contains:

- unique ID
- name
- source type
- locked dice counting rule
- sets
- combos
- created timestamp
- updated timestamp

### Limits

Use these Version 1 limits:

- Maximum user groups: 30
- Maximum sets per group: 40
- Maximum combos per group: 20
- Maximum sets inside one combo: 20
- Maximum dice per set: 30
- Minimum sides per die: 2
- Maximum sides per die: 100
- Maximum history entries per set: 20
- Optional global history safety cap: 2,000 entries

Validate limits both in UI input and before saving/importing data.

## 8. Locked Dice Counting

Each group contains a setting called:

`Locked Dice Counting`

Available values:

- `Exclude locked dice from total`
- `Include locked dice in total`

### Default

New user-created groups default to:

`Exclude locked dice from total`

### Behavior

- Dice are never locked by default.
- Locking occurs only during Play Mode through user interaction.
- Locked dice keep their last visible result.
- Locked dice are not rolled again until unlocked.
- Whether locked dice count toward totals depends on the group setting.
- If a Quick Start template is copied, its counting rule is copied too.

## 9. Create Group and Edit Group

### Create Group

The Create Group screen contains:

- help button
- group name input
- Locked Dice Counting selection
- input for initial number of set slots
- visual set placeholder grid represented as dice
- Add Set button
- Create/Edit Combo option
- Save
- Save & Play
- Cancel

A new group is not saved until Save or Save & Play is confirmed.

### Edit Group

Edit Group is opened only through My Groups or from Group Setup in Play Mode.

It uses the same main layout as Create Group, but shows the existing saved sets and combos.

There is no autosave.

Changes are stored only when the user confirms Save or Save & Play.

### Important Confirmations

Ask for confirmation when:

- saving changes over an existing group
- cancelling or leaving with unsaved changes
- deleting a group
- deleting a set
- deleting a combo

### Empty and Incomplete Sets

- Empty set placeholders are allowed during editing.
- When saving, empty placeholders may be ignored after confirmation.
- Partially completed sets block saving until completed or removed.
- A group with no valid sets cannot be saved.

Example warning:

`3 empty set slots will be ignored. Continue?`

## 10. Set Configuration

A set represents one homogeneous roll.

Examples:

- `5d6`
- `1d20`
- `10d8`

A set does not contain mixed dice types. Mixed use cases should be represented through multiple sets and optionally a combo.

### Set Fields

Each set contains:

- unique ID
- name
- dice count
- sides per die
- dice body color
- number/dot color
- history

### Rules

- Set name is optional. If left empty, create a default such as `Set 1`.
- Dice count is required and must be between 1 and 30.
- Sides are required and must be between 2 and 100.
- Dice body color is editable.
- Number/dot color is editable.

### Default Set Colors

All new sets start with the same default colors:

- dice body: white
- number/dot color: black

Do not automatically assign different colors to sets.

### Dice Face Rendering

- Results from dice with 2 to 6 sides should be shown with traditional dot/pip layouts.
- Results from dice with more than 6 sides should be shown as numbers.

### Modifier

Do not expose a modifier feature in the Version 1 UI.

The TypeScript model may reserve a `modifier: 0` property so modifiers can be added later without redesigning saved data.

## 11. Combo Configuration

A combo rolls multiple sets together and displays a combo total.

### Rules

- Maximum 20 combos per group.
- Maximum 20 sets per combo.
- A set can belong to only one combo.
- A combo stores set IDs, not copied set definitions.
- If a set changes, the combo automatically uses its updated configuration.
- If a set is deleted, remove its reference from any combo.
- A combo with no selected sets cannot be used.

### Combo Creation

Combos may be created:

- while creating/editing a group
- during Play Mode using the Add Combo button

Flow:

1. User selects Add Combo.
2. User selects one or more sets by tapping/clicking them.
3. App provides a default name such as `Combo A`, `Combo B`, `Combo C`.
4. App provides a default combo color from a prepared accessible palette.
5. User may change name and color.
6. User presses Confirm once to create the combo, or Cancel to discard it.

If a user selects a set that already belongs to another combo, ask for confirmation before moving it.

## 12. My Groups

My Groups is the central management page for user-created and copied groups.

For each group, show:

- name
- number of sets
- number of combos
- Play
- Edit
- Export
- Delete

Also provide:

- Export All Groups
- Back

### Rules

- Deleting requires confirmation.
- Export applies only to user-created/copied groups.
- Quick Start templates do not appear here unless copied.
- Import results appear here.

## 13. Import and Export

### Export

Support:

- Export one group
- Export all user groups

Export does not include built-in Quick Start templates.

Export should support:

- default export without history
- optional export including history

Suggested filenames:

- `unrealdice-risk-copy.json`
- `unrealdice-all-groups.json`

### Import

Import is accessible from the Home screen.

Flow:

1. User chooses a file.
2. App validates it before changing any local data.
3. If valid, app shows confirmation.
4. Imported groups appear under My Groups.

### Import Safety

Import must be all-or-nothing.

Validate:

- valid JSON
- correct unrealDice export structure/version
- groups are within limits
- sets are valid
- combos reference existing sets
- a set is not assigned to more than one combo
- IDs are safe and not duplicated in a way that corrupts existing data

Never silently overwrite existing groups.

When imported names already exist, create unique names such as:

- `Risk Imported`
- `Risk Imported 2`

### Local Storage Warning

The Import/Export area must explain:

`unrealDice stores your groups locally on this device. Your data can be lost if browser data is cleared, the app is removed, private browsing is used, or the device is reset. Export a backup if your saved groups are important to you.`

## 14. Play Mode

Play Mode is the central gameplay screen.

### Layout

Top:

- current group name only

Main area:

- visual responsive grid of set dice

Below all sets:

- Roll All button
- combo buttons, if combos exist
- Back button
- Add Combo button
- Group Setup button

The lower action buttons are part of the normal page flow and are not fixed to the viewport. The user may scroll down to reach them.

### Set Display

Each set is represented by:

- set name above the large set die
- one large die using the configured set colors
- the large die displays the total result of that set
- a Roll button directly below the large die
- optionally expanded individual dice below the Roll button

Before the first roll, the large set die displays a neutral placeholder such as `—`.

### Expand and Collapse

A normal click/tap on the large set die toggles the individual dice display:

- collapsed: only the large total die is visible
- expanded: all individual dice from that set are shown below it

The expanded/collapsed state remains until the user toggles it again.

Different sets may be expanded or collapsed independently.

If an expanded set needs more horizontal room, it may expand across the available width and cause following sets to move below it.

### Set Menu

A double-click on desktop or long press on touch devices on the large set die opens a popup menu with:

- History
- Set Setup
- Cancel/Close

Set Setup leads back to the existing group/set editing flow. It is not a new independent screen.

### Individual Dice Locking

Individual dice are visible only when a set is expanded.

To lock or unlock one individual die:

- desktop: double-click that die
- touch device: long press that die

Locked die behavior:

- it becomes visibly darker
- it keeps its last shown value
- it is not rolled again until unlocked
- it may or may not count toward totals depending on the group's Locked Dice Counting setting

If any individual die in a set is locked:

- the large set die also becomes visibly darker
- do not add lock icons or text indicators

Locking is play-session behavior, not saved group configuration.

### Rolling a Single Set

When the user presses the Roll button for a set:

- roll all unlocked dice of that set
- retain any locked dice values
- update the large total die
- if individual dice are expanded, update visible individual dice
- if individual dice are collapsed, still update their internal values so expanding later shows the correct last roll
- store one new history entry for that set

### Roll All

The Roll All button:

- rolls every set in the active group
- updates every large set die
- updates individual visible dice for expanded sets
- updates internal dice values for collapsed sets
- displays the total of all newly updated set totals inside the Roll All button

### Combo Buttons

If combos exist, display their buttons below Roll All.

Combo buttons may wrap into multiple rows.

When a combo is pressed:

- roll only the sets contained in that combo
- update those set results in the main grid
- do not update unrelated sets
- show the combined total of the rolled combo sets inside the combo button
- add history entries to each rolled set

## 15. Set History

History belongs only to individual sets.

There is no global group history and no separate combo history.

### Access

In Play Mode:

- double-click or long press the large set die
- choose History from the popup menu

### Content

Store and display the last 20 rolls for that set.

Each history row shows:

- total result
- every individual die result
- timestamp
- an `X` marker on any die that was locked during that roll

The `X` indicates that the die was locked. Whether it contributed to the total depends on the group's Locked Dice Counting setting at the time of the roll.

History entries should preserve the relevant rule and result snapshot so later group edits do not make previous results misleading.

### Clear History

Clearing a set's history requires confirmation.

## 16. Coin & Random

The Home screen includes a Coin & Random option.

### Coin & Random Menu

Show:

- Heads / Tails
- Random Number input and start action
- Back

### Heads / Tails Mode

Flow:

1. User enters Heads / Tails mode.
2. A large coin is initially blank.
3. The user clicks/taps the coin once.
4. A small lightweight flip animation plays.
5. The result shows `Heads` or `Tails`.
6. Every later normal click/tap flips again.
7. Back returns to the previous menu.

### Heads / Tails History

- store the last 20 Heads/Tails results
- open history through double-click or long press on the coin
- opening history must not also trigger a coin flip

### Random Number Mode

Flow:

1. User enters a maximum number between 2 and 100.
2. User confirms.
3. A large coin/token-style display is initially blank.
4. The user clicks/taps it once.
5. A small lightweight motion plays.
6. A random integer from 1 to the selected maximum appears.
7. Every later normal click/tap creates another number.
8. Back returns to the previous menu.

### Random Number History

- store the last 20 random number results for the active random-number use
- history is separate from Heads/Tails history
- open history through double-click or long press on the token
- opening history must not also trigger a new random number

## 17. Install App / Offline Help

The Home screen includes an Install App action.

Because this is a PWA, installation behavior differs between devices. The page should explain this clearly.

### Content

Explain:

- unrealDice is installable on compatible devices
- it can work offline after the required application files have been cached
- saved groups are stored locally on the current device/browser
- exporting backups is recommended

Provide instructions for:

### Android / Chrome

- open unrealDice in Chrome
- use Install App or Add to Home Screen
- open the installed app once while online

### iPhone / Safari

- open unrealDice in Safari
- tap Share
- choose Add to Home Screen
- open the installed app once while online

### Desktop

- use the browser's install option when available

The help page must remain accessible later so the user can reread installation instructions.

## 18. Storage Rules

Persist:

- user-created/copied groups
- group settings
- sets
- combos
- set history
- Heads/Tails history
- Random Number history
- app preferences such as theme/language when added

Do not persist as permanent group configuration:

- current dice lock state
- current displayed roll results
- expanded/collapsed play-mode panels

Those belong to the current play session only in Version 1.

## 19. Confirmation Requirements

Require clear Yes/No confirmation for important actions:

- delete group
- delete set
- delete combo
- clear history
- leave editor with unsaved changes
- save over an existing group
- import data
- replace/overwrite data if that option is added later

Do not add an undo system in Version 1.

## 20. Development Phases

Implement in this order:

1. Project cleanup, shared design foundation, and Home screen
2. TypeScript domain models and constants
3. Storage service and validation foundation
4. Quick Start and My Groups screens
5. Create/Edit Group flow
6. Set configuration flow
7. Combo configuration flow
8. Import/Export
9. Coin & Random modes
10. Play Mode
11. Set History
12. PWA install/offline support
13. Accessibility, testing, README, deployment, and portfolio polish

Do not rush into full Play Mode before the models, storage, group flow, and validation foundation are stable.
