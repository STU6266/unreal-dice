export function hasReadableColorContrast(
  foregroundHex: string,
  backgroundHex: string,
  minimumRatio = 3,
): boolean {
  const foreground = parseHexColor(foregroundHex)
  const background = parseHexColor(backgroundHex)

  if (foreground === null || background === null) {
    return false
  }

  return getContrastRatio(foreground, background) >= minimumRatio
}

function getContrastRatio(
  foreground: readonly [number, number, number],
  background: readonly [number, number, number],
): number {
  const foregroundLuminance = getRelativeLuminance(foreground)
  const backgroundLuminance = getRelativeLuminance(background)
  const lighter = Math.max(foregroundLuminance, backgroundLuminance)
  const darker = Math.min(foregroundLuminance, backgroundLuminance)

  return (lighter + 0.05) / (darker + 0.05)
}

function getRelativeLuminance(rgb: readonly [number, number, number]): number {
  const [red, green, blue] = rgb.map((channel) => {
    const normalized = channel / 255
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4
  })

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

function parseHexColor(hexColor: string): [number, number, number] | null {
  const normalized = hexColor.trim().replace(/^#/, '')

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return null
  }

  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ]
}
