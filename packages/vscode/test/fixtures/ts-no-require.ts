// Test fixture for ts/no-require-imports rule
// Should use ES6 imports instead of CommonJS require

// ISSUE: Using require() in TypeScript
const fs = require('fs')
const path = require('path')

// ISSUE: require with type annotation
const utils: any = require('./utils')

// ISSUE: Destructured require
const { readFile, writeFile } = require('fs')

// OK: ES6 imports
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import * as helpers from './helpers'

export function useImports() {
  return { fs, path, readFileSync, join, helpers }
}
