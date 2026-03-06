export function ellipsis(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max) + '...'
}
