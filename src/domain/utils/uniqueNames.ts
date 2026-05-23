export function createUniqueCopyName(
  sourceName: string,
  existingNames: readonly string[],
): string {
  const baseName = `${sourceName} Copy`
  const normalizedExistingNames = new Set(
    existingNames.map((name) => name.trim().toLowerCase()),
  )

  if (!normalizedExistingNames.has(baseName.toLowerCase())) {
    return baseName
  }

  let copyNumber = 2
  while (
    normalizedExistingNames.has(`${baseName} ${copyNumber}`.toLowerCase())
  ) {
    copyNumber += 1
  }

  return `${baseName} ${copyNumber}`
}
