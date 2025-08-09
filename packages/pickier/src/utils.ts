/**
 * Colorize console output (simple ANSI colors)
 */
export const colors = {
  green: (text: string) => `\x1B[32m${text}\x1B[0m`,
  red: (text: string) => `\x1B[31m${text}\x1B[0m`,
  yellow: (text: string) => `\x1B[33m${text}\x1B[0m`,
  blue: (text: string) => `\x1B[34m${text}\x1B[0m`,
  gray: (text: string) => `\x1B[90m${text}\x1B[0m`,
  bold: (text: string) => `\x1B[1m${text}\x1B[0m`,
}
