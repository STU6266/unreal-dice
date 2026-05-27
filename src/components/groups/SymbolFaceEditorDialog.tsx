import { useMemo, useState } from 'react'
import { copy } from '../../content/en'
import { COLOR_SYMBOLS, LETTER_SYMBOLS, SYMBOL_LIBRARY_CATEGORIES } from '../../domain/data/symbolLibrary'
import type { SymbolDieFace } from '../../domain/types/dice'
import { MAX_SYMBOL_FACES_PER_DIE } from '../../domain/utils/symbolDiceUtils'
import { SymbolFaceView } from '../play/SymbolFaceView'

interface SymbolFaceEditorDialogProps {
  faces: SymbolDieFace[]
  onCancel: () => void
  onSave: (faces: SymbolDieFace[]) => void
}

type StaticSymbolCategory = 'letters' | 'numbers' | 'colors'
type SymbolCategory = string | StaticSymbolCategory
const STATIC_CATEGORIES: readonly StaticSymbolCategory[] = ['letters', 'colors', 'numbers']
const ALL_SUBGROUPS = 'all'

export function SymbolFaceEditorDialog({
  faces,
  onCancel,
  onSave,
}: SymbolFaceEditorDialogProps) {
  const [draftFaces, setDraftFaces] = useState<SymbolDieFace[]>(faces)
  const [category, setCategory] = useState<SymbolCategory>(
    SYMBOL_LIBRARY_CATEGORIES[0]?.name ?? 'letters',
  )
  const [subgroup, setSubgroup] = useState(ALL_SUBGROUPS)
  const [search, setSearch] = useState('')
  const [numberValue, setNumberValue] = useState(1)
  const [countsTowardTotal, setCountsTowardTotal] = useState(false)
  const canAddFace = draftFaces.length < MAX_SYMBOL_FACES_PER_DIE
  const selectedLibraryCategory = SYMBOL_LIBRARY_CATEGORIES.find((group) => group.name === category)
  const subgroups = useMemo(() => {
    if (selectedLibraryCategory === undefined) {
      return []
    }

    return Array.from(
      new Set(
        selectedLibraryCategory.symbols
          .map((symbol) => symbol.subgroup)
          .filter((value): value is string => typeof value === 'string' && value !== ''),
      ),
    ).sort()
  }, [selectedLibraryCategory])
  const filteredIcons = useMemo(() => {
    const searchTerm = search.trim().toLowerCase()

    return (selectedLibraryCategory?.symbols ?? []).filter((symbol) => {
      const matchesSubgroup = subgroup === ALL_SUBGROUPS || symbol.subgroup === subgroup
      const matchesSearch =
        searchTerm === '' ||
        symbol.label.toLowerCase().includes(searchTerm) ||
        symbol.symbol.toLowerCase().includes(searchTerm) ||
        symbol.subgroup?.toLowerCase().includes(searchTerm)

      return matchesSubgroup && matchesSearch
    })
  }, [search, selectedLibraryCategory, subgroup])

  return (
    <div className="dialog-backdrop" role="presentation">
      <section
        className="editor-dialog symbol-face-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="symbol-face-title"
      >
        <h2 id="symbol-face-title">{copy.groupEditor.symbolFaces.title}</h2>

        <div className="segmented-control" aria-label={copy.groupEditor.symbolFaces.category}>
          {[...SYMBOL_LIBRARY_CATEGORIES.map((group) => group.name), ...STATIC_CATEGORIES].map((item) => (
            <button
              key={item}
              className={category === item ? 'segmented-control__item is-active' : 'segmented-control__item'}
              type="button"
              onClick={() => selectCategory(item)}
            >
              {getCategoryLabel(item)}
            </button>
          ))}
        </div>

        {selectedLibraryCategory !== undefined ? (
          <>
            {subgroups.length > 1 ? (
              <div className="segmented-control segmented-control--subtle" aria-label={copy.groupEditor.symbolFaces.subgroup}>
                {[ALL_SUBGROUPS, ...subgroups].map((item) => (
                  <button
                    key={item}
                    className={subgroup === item ? 'segmented-control__item is-active' : 'segmented-control__item'}
                    type="button"
                    onClick={() => setSubgroup(item)}
                  >
                    {item === ALL_SUBGROUPS ? copy.groupEditor.symbolFaces.allSubgroups : item}
                  </button>
                ))}
              </div>
            ) : null}
            <label className="field">
              <span>{copy.groupEditor.symbolFaces.search}</span>
              <input value={search} onChange={(event) => setSearch(event.target.value)} />
            </label>
            <div className="symbol-option-grid">
              {filteredIcons.map((face) => (
                <button
                  key={face.id ?? `${face.symbol}-${face.label}`}
                  className="symbol-option"
                  type="button"
                  disabled={!canAddFace}
                  aria-label={copy.groupEditor.symbolFaces.addFace(face.label)}
                  onClick={() => addFace(face)}
                >
                  <span className="symbol-option__preview">
                    <SymbolFaceView face={face} />
                  </span>
                  <span className="symbol-option__label">{face.label}</span>
                </button>
              ))}
            </div>
          </>
        ) : null}

        {category === 'letters' ? (
          <div className="symbol-option-grid">
            {LETTER_SYMBOLS.map((face) => (
              <button
                key={face.value}
                className="symbol-option symbol-option--letter"
                type="button"
                disabled={!canAddFace}
                aria-label={copy.groupEditor.symbolFaces.addFace(face.value)}
                onClick={() => addFace(face)}
              >
                <span className="symbol-option__preview">
                  <SymbolFaceView face={face} />
                </span>
              </button>
            ))}
          </div>
        ) : null}

        {category === 'colors' ? (
          <div className="symbol-option-grid">
            {COLOR_SYMBOLS.map((face) => (
              <button
                key={face.label}
                className="symbol-option"
                type="button"
                disabled={!canAddFace}
                aria-label={copy.groupEditor.symbolFaces.addFace(face.label)}
                onClick={() => addFace(face)}
              >
                <span className="symbol-option__preview">
                  <SymbolFaceView face={face} />
                </span>
                <span className="symbol-option__label">{face.label}</span>
              </button>
            ))}
          </div>
        ) : null}

        {category === 'numbers' ? (
          <div className="form-grid form-grid--panel">
            <label className="field">
              <span>{copy.groupEditor.symbolFaces.numberValue}</span>
              <input
                type="number"
                min={0}
                max={100}
                value={numberValue}
                onChange={(event) => setNumberValue(Number(event.target.value))}
              />
            </label>
            <label className="field field--checkbox">
              <input
                type="checkbox"
                checked={countsTowardTotal}
                onChange={(event) => setCountsTowardTotal(event.target.checked)}
              />
              <span>{copy.groupEditor.symbolFaces.countsTowardTotal}</span>
            </label>
            <button
              className="button-link"
              type="button"
              disabled={!canAddFace || !Number.isInteger(numberValue) || numberValue < 0 || numberValue > 100}
              onClick={() =>
                addFace({
                  type: 'number',
                  value: numberValue,
                  countsTowardTotal,
                })
              }
            >
              {copy.groupEditor.symbolFaces.addNumber}
            </button>
          </div>
        ) : null}

        <section className="symbol-selected-list" aria-label={copy.groupEditor.symbolFaces.selectedFaces}>
          <h3>{copy.groupEditor.symbolFaces.selectedFaces}</h3>
          {draftFaces.length === 0 ? (
            <p className="random-history-empty">{copy.groupEditor.symbolFaces.empty}</p>
          ) : (
            <ol>
              {draftFaces.map((face, index) => (
                <li key={`${index}-${getFaceKey(face)}`}>
                  <span className="history-die">
                    <SymbolFaceView face={face} />
                  </span>
                  <span>{getFaceLabel(face)}</span>
                  <button className="button-link" type="button" onClick={() => removeFace(index)}>
                    {copy.groupEditor.symbolFaces.remove}
                  </button>
                </li>
              ))}
            </ol>
          )}
        </section>

        <div className="confirm-dialog__actions">
          <button className="button-link" type="button" onClick={onCancel}>
            {copy.groupEditor.setDialog.cancel}
          </button>
          <button
            className="button-link button-link--primary"
            type="button"
            disabled={draftFaces.length < 2}
            onClick={() => onSave(draftFaces)}
          >
            {copy.groupEditor.symbolFaces.finish}
          </button>
        </div>
      </section>
    </div>
  )

  function addFace(face: SymbolDieFace): void {
    setDraftFaces((current) =>
      current.length >= MAX_SYMBOL_FACES_PER_DIE ? current : [...current, { ...face }],
    )
  }

  function removeFace(indexToRemove: number): void {
    setDraftFaces((current) => current.filter((_, index) => index !== indexToRemove))
  }

  function selectCategory(nextCategory: SymbolCategory): void {
    setCategory(nextCategory)
    setSubgroup(ALL_SUBGROUPS)
    setSearch('')
  }
}

function getCategoryLabel(category: SymbolCategory): string {
  return category in copy.groupEditor.symbolFaces.categories
    ? copy.groupEditor.symbolFaces.categories[category as StaticSymbolCategory]
    : category
}

function getFaceKey(face: SymbolDieFace): string {
  return face.type === 'number'
    ? `${face.type}-${face.value}-${face.countsTowardTotal}`
    : face.type === 'letter'
      ? `${face.type}-${face.value}`
      : `${face.type}-${face.label}`
}

function getFaceLabel(face: SymbolDieFace): string {
  if (face.type === 'number') {
    return face.countsTowardTotal
      ? copy.groupEditor.symbolFaces.countableNumber(face.value)
      : copy.groupEditor.symbolFaces.visualNumber(face.value)
  }

  if (face.type === 'letter') {
    return face.value
  }

  return face.label
}
