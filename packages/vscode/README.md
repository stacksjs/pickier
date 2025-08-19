# Pickier VS Code Extension

> Format, lint and more in a fraction of seconds.

[![Version](https://img.shields.io/vscode-marketplace/v/pickier.vscode.svg)](https://marketplace.visualstudio.com/items?itemName=pickier.vscode)
[![Installs](https://img.shields.io/vscode-marketplace/i/pickier.vscode.svg)](https://marketplace.visualstudio.com/items?itemName=pickier.vscode)
[![Rating](https://img.shields.io/vscode-marketplace/r/pickier.vscode.svg)](https://marketplace.visualstudio.com/items?itemName=pickier.vscode)

The official VS Code extension for [Pickier](https://github.com/stacksjs/pickier) - a lightning-fast formatter and linter built with Bun.

## ✨ Features

- **🚀 Lightning Fast**: Built with Bun for maximum performance
- **🎯 Multi-Language**: Supports TypeScript, JavaScript, JSON, HTML, CSS, Markdown, and YAML
- **🔧 Smart Formatting**: Intelligent code formatting with configurable rules
- **🔍 Advanced Linting**: Comprehensive linting with sorting and organization rules
- **⚡ Real-time**: Instant feedback with live diagnostics
- **🎨 Customizable**: Extensive configuration options for teams and individuals

## 🚀 Quick Start

1. **Install the extension** from the VS Code Marketplace
2. **Open a supported file** (`.ts`, `.js`, `.json`, etc.)
3. **Format on save** or use the command palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
4. **Customize settings** in VS Code preferences

## 📋 Supported File Types

| Language    | Extensions           | Formatting | Linting |
|-------------|---------------------|------------|---------|
| TypeScript  | `.ts`, `.tsx`       | ✅         | ✅      |
| JavaScript  | `.js`, `.jsx`       | ✅         | ✅      |
| JSON        | `.json`, `.jsonc`   | ✅         | ✅      |
| HTML        | `.html`             | ✅         | ✅      |
| CSS         | `.css`              | ✅         | ✅      |
| Markdown    | `.md`               | ✅         | ✅      |
| YAML        | `.yaml`, `.yml`     | ✅         | ✅      |

## 🛠️ Commands

Access these via the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

- `Pickier: Format Document` - Format the entire document
- `Pickier: Format Selection` - Format only selected text
- `Pickier: Lint Document` - Lint the current document
- `Pickier: Lint Workspace` - Lint all files in workspace

## ⚙️ Configuration

### Extension Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `pickier.enable` | `true` | Enable/disable Pickier |
| `pickier.formatOnSave` | `false` | Format files on save |
| `pickier.lintOnSave` | `true` | Lint files on save |
| `pickier.configPath` | `""` | Path to config file |
| `pickier.showOutputChannel` | `false` | Show debug output |

### Example VS Code Settings

```json
{
  "pickier.enable": true,
  "pickier.formatOnSave": true,
  "pickier.lintOnSave": true,
  "pickier.configPath": "pickier.config.ts",

  "[typescript]": {
    "editor.defaultFormatter": "pickier.vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "pickier.vscode"
  }
}
```

### Pickier Configuration

Create a `pickier.config.ts` in your workspace root:

```typescript
import type { PickierConfig } from 'pickier'

const config: PickierConfig = {
  format: {
    indent: 2,
    quotes: 'single',
    semi: false,
    trimTrailingWhitespace: true,
  },
  rules: {
    noDebugger: 'error',
    noConsole: 'warn',
  },
  pluginRules: {
    'sort-imports': 'warn',
    'sort-objects': 'warn',
  }
}

export default config
```

## 🔧 Integration

### Disable Conflicting Extensions

To avoid conflicts, disable other formatters for Pickier-supported files:

```json
{
  "prettier.enable": false,
  "eslint.format.enable": false,
  "typescript.format.enable": false
}
```

### Working with ESLint

Pickier works great alongside ESLint. Use ESLint for logical rules and Pickier for formatting:

```json
{
  "eslint.validate": ["typescript", "javascript"],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## 📊 Performance

Pickier is designed for speed:

- **Native Performance**: Built with Bun runtime
- **Incremental Processing**: Only processes changed content
- **Efficient Caching**: Smart caching for faster subsequent runs
- **Minimal Overhead**: Lightweight VS Code integration

## 🐛 Troubleshooting

### Common Issues

**Extension not working?**

- Check that you're using supported file types
- Verify extension is enabled in settings
- Look for errors in the Output panel (View → Output → Pickier)

**Formatting conflicts?**

- Disable other formatters for the same file types
- Check that Pickier is set as the default formatter

**Performance issues?**

- Enable caching in your Pickier config
- Check ignore patterns to exclude unnecessary files

### Debug Mode

Enable detailed logging:

1. Set `pickier.showOutputChannel` to `true`
2. Open View → Output → Pickier
3. Perform actions to see debug information

## 📝 Examples

Check the [`examples/`](./examples/) folder for:

- Basic configuration setups
- Advanced team configurations
- VS Code settings examples
- Integration patterns

## 🤝 Contributing

Found a bug or want to contribute? Check out our [GitHub repository](https://github.com/stacksjs/pickier).

### Development

1. Clone the repository
2. Run `bun install`
3. Open in VS Code
4. Press F5 to launch Extension Development Host

## 📄 License

MIT License - see [LICENSE](../../LICENSE.md) for details.

## 🔗 Links

- [Pickier Documentation](https://github.com/stacksjs/pickier#readme)
- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=pickier.vscode)
- [GitHub Repository](https://github.com/stacksjs/pickier)
- [Issue Tracker](https://github.com/stacksjs/pickier/issues)
