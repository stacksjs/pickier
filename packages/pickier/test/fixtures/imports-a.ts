import z, { B, type C, D as E, type F as G } from 'lib'
import * as NS from './ns'
import { X, type Y } from './local'
import 'side-effects'

const v = B + (NS ? 1 : 0) + X
export { v }

