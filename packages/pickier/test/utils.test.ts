import { describe, expect, it } from 'bun:test'
import { blue, bold, colorize, colors, gray, green, red, yellow } from '../src/utils'

describe('colors', () => {
  it('wraps text with ANSI codes (object)', () => {
    expect(colors.green('x')).toBe('\x1B[32mx\x1B[0m')
    expect(colors.red('x')).toBe('\x1B[31mx\x1B[0m')
    expect(colors.yellow('x')).toBe('\x1B[33mx\x1B[0m')
    expect(colors.blue('x')).toBe('\x1B[34mx\x1B[0m')
    expect(colors.gray('x')).toBe('\x1B[90mx\x1B[0m')
    expect(colors.bold('x')).toBe('\x1B[1mx\x1B[0m')
  })

  it('wraps text with ANSI codes (named)', () => {
    expect(green('x')).toBe('\x1B[32mx\x1B[0m')
    expect(red('x')).toBe('\x1B[31mx\x1B[0m')
    expect(yellow('x')).toBe('\x1B[33mx\x1B[0m')
    expect(blue('x')).toBe('\x1B[34mx\x1B[0m')
    expect(gray('x')).toBe('\x1B[90mx\x1B[0m')
    expect(bold('x')).toBe('\x1B[1mx\x1B[0m')
  })

  it('colorize helper works for arbitrary codes', () => {
    expect(colorize('35', 'x')).toBe('\x1B[35mx\x1B[0m')
  })
})
