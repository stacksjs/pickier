// Test fixture for pickier/no-import-node-modules-by-path and pickier/no-import-dist

// ISSUE: Importing from node_modules by path
import { something } from '../../../node_modules/some-package/index.js'
import utils from '../../node_modules/utils/dist/index.js'

// ISSUE: Importing from dist directory
import { helper } from './dist/helper'
import config from '../lib/dist/config'

// ISSUE: Importing build output
import { component } from './build/component'

// OK: Proper package imports
import { z } from 'zod'
import { readFile } from 'node:fs/promises'

// OK: Importing source files
import { myHelper } from './src/helper'
import { localUtil } from '../utils'
