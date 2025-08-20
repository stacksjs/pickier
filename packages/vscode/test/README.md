# Pickier VS Code Extension Tests

This folder contains the test suite for the Pickier VS Code extension.

## Test Structure

### Test Files

- `extension.test.ts` - Main extension activation and integration tests
- `formatter.test.ts` - Tests for the formatting provider functionality
- `diagnostics.test.ts` - Tests for the diagnostic provider and linting
- `status-bar.test.ts` - Tests for status bar integration and updates

### Mock Infrastructure

Each test file includes comprehensive mocks for:

- VS Code API (`vscode` module)
- File system operations (`fs` module)
- Operating system utilities (`os` module)
- Pickier core functionality (`pickier` module)

## Running Tests

### Prerequisites

Ensure you have the required dependencies installed:

```bash
bun install
```

### Running All Tests

```bash
bun test
```

### Running Specific Test Files

```bash
# Run extension tests only
bun test test/extension.test.ts

# Run formatter tests only
bun test test/formatter.test.ts

# Run diagnostic tests only
bun test test/diagnostics.test.ts

# Run status bar tests only
bun test test/status-bar.test.ts
```

### Test Coverage

Generate test coverage reports:

```bash
bun test --coverage
```

## Test Categories

### Unit Tests

- Test individual components in isolation
- Mock all external dependencies
- Focus on single responsibility testing

### Integration Tests

- Test component interactions
- Verify VS Code API integration
- Test end-to-end workflows

### Mock Tests

- Verify mocking infrastructure works correctly
- Test error handling and edge cases
- Validate configuration scenarios

## Testing Strategies

### Mocking VS Code API

The tests use comprehensive mocks for the VS Code API to:

- Simulate extension activation
- Test command registration
- Mock document operations
- Simulate configuration changes

Example:

```typescript
const mockVSCode = {
  window: {
    showInformationMessage: () => Promise.resolve(),
    createOutputChannel: () => ({ /* mock implementation */ })
  },
  workspace: {
    getConfiguration: () => ({ /* mock config */ })
  }
}
```

### Testing Formatter

The formatter tests verify:

- Document formatting functionality
- Range formatting capabilities
- Error handling scenarios
- Cancellation token support

### Testing Diagnostics

The diagnostic tests ensure:

- Proper lint issue detection
- VS Code diagnostic integration
- Temporary file handling
- Error reporting and logging

### Testing Status Bar

The status bar tests validate:

- Language-specific visibility
- State updates and transitions
- Configuration-based behavior
- Icon and message display

## Test Utilities

### Mock Classes

Custom mock classes are provided for:

- `MockTextDocument` - Simulates VS Code text documents
- `MockDiagnosticCollection` - Mocks diagnostic collection behavior
- `MockStatusBarItem` - Simulates status bar item functionality
- `MockOutputChannel` - Captures output channel messages

### Helper Functions

Utility functions for:

- Setting up test environments
- Creating mock objects
- Asserting complex behaviors
- Managing test state

## Best Practices

### Test Organization

- Group related tests in describe blocks
- Use descriptive test names
- Set up and tear down test state properly

### Mocking Strategy

- Mock external dependencies completely
- Use dependency injection where possible
- Verify mock interactions when relevant

### Error Testing

- Test both success and failure scenarios
- Verify graceful error handling
- Test edge cases and boundary conditions

### Async Testing

- Properly handle async operations
- Use appropriate waiting strategies
- Test cancellation scenarios

## Debugging Tests

### VS Code Test Environment

To debug tests in VS Code:

1. Open the extension project in VS Code
2. Set breakpoints in test files
3. Use the "Extension Tests" debug configuration
4. Run tests in debug mode

### Console Output

Tests include console output capturing for:

- Verifying log messages
- Debugging test failures
- Monitoring mock interactions

### Test Isolation

Each test is isolated with:

- Fresh mock objects
- Reset global state
- Clean test environment

## Contributing

When adding new tests:

1. **Follow naming conventions** - Use descriptive test names
2. **Add appropriate mocks** - Mock all external dependencies
3. **Test error cases** - Include negative test scenarios
4. **Update documentation** - Keep this README current
5. **Verify coverage** - Ensure new code is tested

### Test Guidelines

- **Arrange, Act, Assert** - Structure tests clearly
- **Single responsibility** - Test one thing at a time
- **Deterministic** - Tests should be reliable and repeatable
- **Fast execution** - Keep tests quick and efficient

## Troubleshooting

### Common Issues

**Tests not running**:

- Check that all dependencies are installed
- Verify Bun is properly configured
- Ensure test files are properly named (*.test.ts)

**Mock not working**:

- Verify mock module paths are correct
- Check that mocks are reset between tests
- Ensure proper mock implementations

**VS Code API errors**:

- Update VS Code type definitions
- Check API compatibility
- Verify mock completeness

### Getting Help

1. Check test output for specific error messages
2. Review VS Code extension testing documentation
3. Examine working tests for patterns
4. Use debugger to step through test execution

## Future Improvements

Potential enhancements to the test suite:

- **End-to-end tests** with real VS Code instance
- **Performance benchmarks** for large files
- **Cross-platform testing** validation
- **Integration tests** with other extensions
- **Visual regression testing** for UI components
