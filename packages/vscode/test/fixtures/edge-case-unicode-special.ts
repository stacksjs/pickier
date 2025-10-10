// Test fixture for Unicode and special characters
// Ensure linting works correctly with international characters

// ISSUE: Unsorted object with Unicode keys
const translations = {
  '中文': 'Chinese',
  'Ελληνικά': 'Greek',
  'Русский': 'Russian',
  'العربية': 'Arabic',
  '日本語': 'Japanese',
}

// ISSUE: Variables with Unicode names (unsorted)
const 変数 = 'Japanese variable'
const переменная = 'Russian variable'
const μεταβλητή = 'Greek variable'

// ISSUE: Arrow function with Unicode parameter names
const процесс = (データ: string, 参数: number) => {
  return `${データ}: ${参数}`
}

// Emoji in code (should not break parsing)
const 🚀 = 'rocket'
const 🎉 = 'party'
const status = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
}

// ISSUE: Unsorted object with emoji keys
const reactions = {
  '👍': 'thumbs up',
  '❤️': 'heart',
  '😂': 'laugh',
  '🎉': 'celebration',
}

// Special characters in strings
const special = "Special chars: @#$%^&*()_+-=[]{}|;':\",./<>?"
const unicode = "Unicode: \u0041 \u{1F600} \u{1F4A9}"

// ISSUE: Regex with Unicode
const unicodeRegex = /[\u0400-\u04FF]+/u
const emojiRegex = /[\u{1F600}-\u{1F64F}]/u

// ISSUE: Template with Unicode
const message = `Hello ${переменная} and ${変数}!`

// ISSUE: Import with Unicode (if supported)
// import { 函数 } from './unicode-module'

// Zero-width characters and other tricky Unicode
const invisible = "Text with​zero-width​space" // Has zero-width spaces
const rtl = "مرحبا بك" // Right-to-left text

// ISSUE: Function with mixed regular and Unicode (top-level arrow)
const processUnicode = (text: string) => {
  return text.normalize('NFC')
}

console.log(translations, процесс(変数, 42), status, reactions, special, unicode)
console.log(unicodeRegex, emojiRegex, message, invisible, rtl, processUnicode('test'), 🚀, 🎉, μεταβλητή)
