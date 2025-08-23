/* eslint-disable no-console */
import { describe, expect, it } from 'bun:test'
import { buildSourceMap, findMatching, tokenize } from '../src/ast'

describe('ast.tokenize', () => {
  it('tokenizes strings, comments, punctuators and words', () => {
    const src = "// c\nconst a = 'x'; /* b */\nfunction f(){ return a / 2 / re; }\n"
    const tokens = tokenize(src)
    expect(tokens.length).toBeGreaterThan(0)
    expect(tokens.some(t => t.type === 'LineComment')).toBe(true)
    expect(tokens.some(t => t.type === 'BlockComment')).toBe(true)
    expect(tokens.some(t => t.type === 'String')).toBe(true)
    expect(tokens.some(t => t.type === 'Punct' && t.value === '{')).toBe(true)
    expect(tokens.some(t => t.type === 'Word' && t.value === 'function')).toBe(true)
  })

  it('recognizes template literals and nested expressions', () => {
    const src = "const s = `a${1+2}b${`x${y}`}`;\n"
    const tokens = tokenize(src)
    expect(tokens.some(t => t.type === 'Template')).toBe(true)
  })

  it('disambiguates division vs regex literals', () => {
    const src = "const a=4/2; const r=/re\\\//g; x=a/2/re; if(/x/.test('x')){}\n"
    const tokens = tokenize(src)
    const slashes = tokens.filter(t => t.value === '/')
    // There should be at least one division punctuator
    expect(slashes.length).toBeGreaterThan(0)
    // There should be at least one Regex token
    expect(tokens.some(t => t.type === 'Regex')).toBe(true)
  })

  it('skips line and block comments correctly', () => {
    const src = "// line\n/* block */ const x = 1; /* unterminated? */\n"
    const tokens = tokenize(src)
    expect(tokens.some(t => t.type === 'LineComment')).toBe(true)
    expect(tokens.some(t => t.type === 'BlockComment')).toBe(true)
    expect(tokens.some(t => t.type === 'Word' && t.value.includes('const'))).toBe(true)
  })

  it('handles unclosed strings/templates without hanging', () => {
    const src = "const a='unterminated\nconst b=\"also\nconst t=`tmpl${1+2}`\n"
    const tokens = tokenize(src)
    // Should produce some tokens and not hang
    expect(tokens.length).toBeGreaterThan(0)
  })

  it('handles deeply nested templates without hanging', () => {
    const src = "const s = `a${`b${`c${1}`}`}`;\n"
    const tokens = tokenize(src)
    expect(tokens.some(t => t.type === 'Template')).toBe(true)
  })

  it('disambiguates division vs regex literals', () => {
    const src = "const a=4/2; const r=/re\\\//g; x=a/2/re; if(/x/.test('x')){}\n"
    const tokens = tokenize(src)
    const slashes = tokens.filter(t => t.value === '/')
    // There should be at least one division punctuator
    expect(slashes.length).toBeGreaterThan(0)
    // There should be at least one Regex token
    expect(tokens.some(t => t.type === 'Regex')).toBe(true)
  })

  it('skips line and block comments correctly', () => {
    const src = "// line\n/* block */ const x = 1; /* unterminated? */\n"
    const tokens = tokenize(src)
    expect(tokens.some(t => t.type === 'LineComment')).toBe(true)
    expect(tokens.some(t => t.type === 'BlockComment')).toBe(true)
    expect(tokens.some(t => t.type === 'Word' && t.value.includes('const'))).toBe(true)
  })

  it('handles unclosed strings/templates without hanging', () => {
    const src = "const a='unterminated\nconst b=\"also\nconst t=`tmpl${1+2}`\n"
    const tokens = tokenize(src)
    // Should produce some tokens and not hang
    expect(tokens.length).toBeGreaterThan(0)
  })

  it('handles deeply nested templates without hanging', () => {
    const src = "const s = `a${`b${`c${1}`}`}`;\n"
    const tokens = tokenize(src)
    expect(tokens.some(t => t.type === 'Template')).toBe(true)
  })
})

describe('ast.buildSourceMap', () => {
  it('maps indices to loc (1-based)', () => {
    const src = "a\n123\nZ" // lines: 1:'a', 2:'123', 3:'Z'
    const map = buildSourceMap(src)
    // index of 'a' is 0 -> (1,1)
    expect(map.indexToLoc(0)).toEqual({ line: 1, column: 1 })
    // index of '2' is 3 -> (2,2)
    expect(map.indexToLoc(3)).toEqual({ line: 2, column: 2 })
    // index of 'Z' is 6 -> (3,1)
    expect(map.indexToLoc(6)).toEqual({ line: 3, column: 1 })
  })
})

describe('ast.findMatching', () => {
  it('finds matching brace while skipping strings/templates', () => {
    const src = "function f(){ const s = '{" + "}'; return `{}`; } end" // ensure strings/templates inside braces
    const open = src.indexOf('{')
    const close = findMatching(src, open, '{', '}')
    expect(close).toBeGreaterThan(open)
    // ensure it matched the one before ' end'
    expect(src.slice(close, close + 2)).toBe('} ')
  })
})
