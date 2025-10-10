import * as path from 'node:path'
import * as vscode from 'vscode'

let cachedConfig: any = null
let configWatcher: vscode.FileSystemWatcher | null = null

export async function getPickierConfig(workspaceRoot?: string): Promise<any> {
  // Return cached config if available
  if (cachedConfig !== null) {
    return cachedConfig
  }

  if (!workspaceRoot) {
    const workspaceFolders = vscode.workspace.workspaceFolders
    if (!workspaceFolders) {
      throw new Error('No workspace folder found')
    }
    workspaceRoot = workspaceFolders[0].uri.fsPath
  }

  const config = vscode.workspace.getConfiguration('pickier')
  const configPath = config.get<string>('configPath', '')

  try {
    // Dynamic import to avoid bundling issues
    const pickierModule = await import('pickier')
    const { defaultConfig } = pickierModule

    // Check if loadConfig is available (it's from bunfig package)
    let loadConfig: any
    try {
      const bunfigModule = await import('bunfig')
      loadConfig = bunfigModule.loadConfig
    }
    catch {
      // bunfig not available, use default config
      cachedConfig = defaultConfig
      return defaultConfig
    }

    // If a specific config path is provided, try to load it
    if (configPath) {
      const fullConfigPath = path.resolve(workspaceRoot, configPath)
      try {
        // Use bunfig's loadConfig with custom path
        const customConfig = await loadConfig({
          name: 'pickier',
          defaultConfig,
          cwd: path.dirname(fullConfigPath),
        })
        cachedConfig = customConfig
        return customConfig
      }
      catch (error) {
        console.warn(`Failed to load config from ${fullConfigPath}:`, error)
        // Fall through to default config loading
      }
    }

    // Try to load config from workspace root using bunfig
    const loadedConfig = await loadConfig({
      name: 'pickier',
      defaultConfig,
      cwd: workspaceRoot,
    })

    cachedConfig = loadedConfig
    return loadedConfig
  }
  catch (error) {
    console.error('Failed to load pickier config:', error)
    // Fall back to default config
    const { defaultConfig } = await import('pickier')
    return defaultConfig
  }
}

export function clearConfigCache(): void {
  cachedConfig = null
}

export function watchConfigFile(
  workspaceRoot: string,
  onChange: () => void,
): vscode.FileSystemWatcher {
  // Dispose existing watcher if any
  if (configWatcher) {
    configWatcher.dispose()
  }

  // Watch for config file changes
  const configPatterns = [
    'pickier.config.{ts,js,mjs,cjs}',
    '.pickierrc.{json,js,ts}',
    'package.json',
  ]

  // Create a watcher for config files
  const pattern = new vscode.RelativePattern(
    workspaceRoot,
    `{${configPatterns.join(',')}}`,
  )
  configWatcher = vscode.workspace.createFileSystemWatcher(pattern)

  configWatcher.onDidChange(() => {
    clearConfigCache()
    onChange()
  })

  configWatcher.onDidCreate(() => {
    clearConfigCache()
    onChange()
  })

  configWatcher.onDidDelete(() => {
    clearConfigCache()
    onChange()
  })

  return configWatcher
}

export function disposeConfigWatcher(): void {
  if (configWatcher) {
    configWatcher.dispose()
    configWatcher = null
  }
}
