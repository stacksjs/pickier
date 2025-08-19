# Pickier VS Code Extension Examples

This folder contains example configurations and settings for the Pickier VS Code extension.

## Configuration Files

### 1. Basic Configuration (`basic-config.ts`)

A minimal setup perfect for getting started with Pickier. Includes:

- Essential formatting rules
- Basic linting configuration
- Standard file type support

**Best for**: New projects, personal development, learning Pickier

### 2. Advanced Configuration (`advanced-config.ts`)

A comprehensive setup with advanced features including:

- Custom plugin rules
- Extended rule configuration
- Performance optimizations
- Detailed sorting rules

**Best for**: Mature projects, teams wanting more control, complex codebases

### 3. Team/Enterprise Configuration (`team-config.ts`)

A strict configuration designed for team environments with:

- Zero-tolerance policies for warnings
- Comprehensive ignore patterns
- Consistent formatting across team members
- CI/CD integration considerations

**Best for**: Enterprise projects, large teams, production environments

### 4. VS Code Settings (`vscode-settings.json`)

Example VS Code workspace settings that:

- Integrate optimally with Pickier
- Disable conflicting formatters
- Set up language-specific preferences
- Optimize performance

## Usage Instructions

### Setting up a Configuration

1. **Choose a configuration** that matches your project needs
2. **Copy the configuration file** to your project root as `pickier.config.ts`
3. **Modify the settings** as needed for your specific requirements
4. **Update your VS Code settings** using the provided example

### VS Code Integration

1. **Copy relevant settings** from `vscode-settings.json`
2. **Add them to your workspace settings** (`.vscode/settings.json`) or user settings
3. **Restart VS Code** to ensure all settings take effect
4. **Test the integration** by formatting and linting files

### Customization Tips

#### File Extensions

Add or remove file extensions based on your project:

```typescript
extensions: ['ts', 'tsx', 'js', 'jsx', 'vue', 'svelte']
```

#### Ignore Patterns

Customize ignore patterns for your project structure:

```typescript
ignores: [
  '**/node_modules/**',
  '**/your-custom-build-dir/**',
  '**/legacy-code/**'
]
```

#### Rule Severity

Adjust rule severity based on your team's preferences:

```typescript
rules: {
  noConsole: 'off',    // Allow console.log
  noDebugger: 'warn',  // Warn instead of error
}
```

## Migration from Other Tools

### From Prettier

1. Disable Prettier in your VS Code settings
2. Remove Prettier configuration files
3. Use Pickier's formatting options instead
4. Adjust any custom Prettier rules to Pickier equivalents

### From ESLint

1. Keep ESLint for logical rules
2. Disable ESLint formatting rules
3. Use Pickier for formatting and sorting
4. Configure both tools to work together

### From Other Formatters

1. Identify overlapping functionality
2. Disable conflicting extensions
3. Migrate custom rules to Pickier configuration
4. Test thoroughly with your codebase

## Troubleshooting

### Common Issues

**Configuration not loading**:

- Ensure the file is named `pickier.config.ts`
- Check file syntax for errors
- Verify the file is in the workspace root

**Formatting not working**:

- Check that Pickier is set as the default formatter
- Ensure `formatOnSave` is enabled if desired
- Verify file extensions are included in configuration

**Performance issues**:

- Enable caching in the configuration
- Review ignore patterns to exclude unnecessary files
- Consider reducing the scope of plugin rules

### Getting Help

1. Check the [main documentation](../docs/USAGE.md)
2. Enable the output channel for debugging
3. Review VS Code's developer tools
4. Check the [GitHub repository](https://github.com/stacksjs/pickier) for issues

## Contributing

Have a useful configuration or improvement? Please:

1. Test it thoroughly
2. Document its use case
3. Submit a pull request
4. Include example usage

## License

These examples are provided under the same MIT license as the Pickier project.
