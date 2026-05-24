# Manual QA Checklist

Use this checklist before deployment and real-device testing.

## Build Verification

- [ ] Run `npm run test`
- [ ] Run `npm run lint`
- [ ] Run `npm run build`
- [ ] Run `npm run preview`
- [ ] Open the production preview URL

## Navigation

- [ ] Home loads without errors
- [ ] Quick Start opens
- [ ] Create Group opens
- [ ] My Groups opens
- [ ] Import Backup opens
- [ ] Coin & Random opens
- [ ] Install App opens
- [ ] Unknown routes show a not-found state instead of crashing
- [ ] Back actions return to the expected screen

## Quick Start

- [ ] Built-in templates are visible
- [ ] Quick Start Play opens a playable group
- [ ] Copy creates an editable saved group
- [ ] Copying the same template again creates a unique name
- [ ] Copied group preserves locked-dice counting

## Groups And Sets

- [ ] Create a new group with at least one configured set
- [ ] Save shows the group in My Groups after refresh
- [ ] Edit changes are saved only after confirmation
- [ ] Cancel/discard does not silently save changes
- [ ] Empty set slots are ignored only after confirmation
- [ ] Set colors and names display correctly
- [ ] Low-contrast set colors show a warning
- [ ] Optional set modifiers can be enabled, validated, saved, edited, and removed

## Combos

- [ ] Add a combo in the group editor
- [ ] Edit an existing combo
- [ ] Delete a combo after confirmation
- [ ] Moving a set from one combo to another requires confirmation
- [ ] Saving cannot leave an empty or invalid combo

## Export And Import

- [ ] Export one group downloads a JSON file
- [ ] Export All downloads one JSON file with saved groups
- [ ] Exporting and importing a modifier-enabled group preserves modifier configuration
- [ ] Older backups without modifier data import with modifiers disabled
- [ ] Importing a valid backup adds new imported groups
- [ ] Importing the same backup again creates unique imported names
- [ ] Invalid JSON shows an error and changes no saved groups
- [ ] Imported combo references still point to the correct imported sets

## Coin And Random

- [ ] Heads / Tails starts blank
- [ ] Single tap/click flips without opening history
- [ ] Double-click opens history without flipping
- [ ] Long press opens history without flipping
- [ ] Heads / Tails history keeps only the latest 20 entries
- [ ] Random Number validates the maximum input from 2 to 100
- [ ] Random Number starts blank and stores range-specific history
- [ ] Clearing one random history does not clear the other

## Play Mode

- [ ] Single set roll updates only that set
- [ ] Roll All updates all sets and its total
- [ ] Combo roll updates only included sets and its combo total
- [ ] Expanding a set shows current individual die values
- [ ] Collapsed sets update internally after rolling
- [ ] Double-click or long press on an individual die toggles lock state
- [ ] For Each Die modifiers, individual dice cycle modifier-active -> normal -> locked -> modifier-active
- [ ] For Set Total modifiers, the set action menu toggles the session modifier on and off
- [ ] Locked dice retain values during reroll
- [ ] Modifier totals match add/subtract/multiply/divide rules, with division rounded up
- [ ] Include locked dice counts locked values in totals
- [ ] Exclude locked dice removes locked values from totals
- [ ] Large set die darkens when any die in the set is locked
- [ ] Set history shows latest rolls and marks locked dice with X
- [ ] Modifier-enabled history entries show per-die modifier state or set-total modifier notes
- [ ] Clearing one set history does not clear another set history
- [ ] Add Combo during saved-group play preserves current results and locks
- [ ] Quick Start Copy to Edit creates an editable copy without copying temporary roll state
- [ ] Group Setup -> color/name-only edit -> Save & Play preserves current results and locks
- [ ] Group Setup -> dice count or sides change -> Save & Play resets that changed set

## Responsive Checks

- [ ] Check approximately 375px mobile width
- [ ] Check approximately 768px tablet width
- [ ] Check desktop width
- [ ] Dialogs fit on small screens
- [ ] Buttons do not overflow
- [ ] Expanded large dice sets remain tappable and scrollable
- [ ] Long group, set, and combo names wrap without breaking layouts

## Accessibility

- [ ] Keyboard navigation reaches all main actions
- [ ] Focus outlines are visible
- [ ] Dialogs have clear titles and close/cancel actions
- [ ] Form inputs have labels and validation messages
- [ ] Interactive dice expose state through accessible labels or pressed state
- [ ] History is reachable through visible buttons, not gestures only
- [ ] Reduced motion setting avoids unnecessary animation

## PWA And Offline

- [ ] Manifest is detected in production preview
- [ ] 192x192 and 512x512 icons are present
- [ ] Service worker registers in production preview
- [ ] Previously opened routes reload while offline
- [ ] Saved groups remain visible offline
- [ ] Coin & Random works offline
- [ ] Play Mode works offline after the app shell is cached
- [ ] Install App screen wording matches browser behavior
- [ ] Update prompt does not reload until confirmed

## Backup Warning

- [ ] Install App screen explains local device/browser storage
- [ ] README explains local data and export backups
- [ ] User understands that clearing browser data or removing the app can delete local groups and histories
