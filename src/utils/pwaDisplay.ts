export function isStandaloneDisplay(
  mediaMatches: boolean,
  navigatorStandalone: boolean | undefined,
): boolean {
  return mediaMatches || navigatorStandalone === true
}
