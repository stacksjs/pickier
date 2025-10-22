import type { RuleModule } from '../../types'

export const noIrregularWhitespaceRule: RuleModule = {
  meta: {
    docs: 'Disallow irregular whitespace characters that may cause issues in code',
  },
  check: (text, ctx) => {
    const issues: ReturnType<RuleModule['check']> = []

    // Irregular whitespace characters to detect:
    // \u00A0 - NO-BREAK SPACE
    // \u1680 - OGHAM SPACE MARK
    // \u180E - MONGOLIAN VOWEL SEPARATOR
    // \u2000-\u200A - EN QUAD through HAIR SPACE
    // \u2028 - LINE SEPARATOR
    // \u2029 - PARAGRAPH SEPARATOR
    // \u202F - NARROW NO-BREAK SPACE
    // \u205F - MEDIUM MATHEMATICAL SPACE
    // \u3000 - IDEOGRAPHIC SPACE
    // \uFEFF - ZERO WIDTH NO-BREAK SPACE (BOM)
    const irregularWhitespace = /[\u00A0\u1680\u180E\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]/g

    const lines = text.split(/\r?\n/)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      let match: RegExpExecArray | null

      // Reset regex for each line
      irregularWhitespace.lastIndex = 0

      // Find all irregular whitespace in this line
      // eslint-disable-next-line no-cond-assign
      while ((match = irregularWhitespace.exec(line)) !== null) {
        const char = match[0]
        const charCode = char.charCodeAt(0)
        let charName = 'irregular whitespace'

        // Provide specific names for better error messages
        switch (charCode) {
          case 0x00A0: charName = 'NO-BREAK SPACE'; break
          case 0x1680: charName = 'OGHAM SPACE MARK'; break
          case 0x180E: charName = 'MONGOLIAN VOWEL SEPARATOR'; break
          case 0x2000: charName = 'EN QUAD'; break
          case 0x2001: charName = 'EM QUAD'; break
          case 0x2002: charName = 'EN SPACE'; break
          case 0x2003: charName = 'EM SPACE'; break
          case 0x2004: charName = 'THREE-PER-EM SPACE'; break
          case 0x2005: charName = 'FOUR-PER-EM SPACE'; break
          case 0x2006: charName = 'SIX-PER-EM SPACE'; break
          case 0x2007: charName = 'FIGURE SPACE'; break
          case 0x2008: charName = 'PUNCTUATION SPACE'; break
          case 0x2009: charName = 'THIN SPACE'; break
          case 0x200A: charName = 'HAIR SPACE'; break
          case 0x2028: charName = 'LINE SEPARATOR'; break
          case 0x2029: charName = 'PARAGRAPH SEPARATOR'; break
          case 0x202F: charName = 'NARROW NO-BREAK SPACE'; break
          case 0x205F: charName = 'MEDIUM MATHEMATICAL SPACE'; break
          case 0x3000: charName = 'IDEOGRAPHIC SPACE'; break
          case 0xFEFF: charName = 'ZERO WIDTH NO-BREAK SPACE'; break
        }

        issues.push({
          filePath: ctx.filePath,
          line: i + 1,
          column: match.index + 1,
          ruleId: 'no-irregular-whitespace',
          message: `Irregular whitespace detected: ${charName} (U+${charCode.toString(16).toUpperCase().padStart(4, '0')})`,
          severity: 'error',
          help: 'Replace irregular whitespace with regular spaces or tabs',
        })
      }
    }

    return issues
  },
  fix: (text) => {
    // Replace all irregular whitespace with regular space
    return text.replace(/[\u00A0\u1680\u180E\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]/g, ' ')
  },
}
