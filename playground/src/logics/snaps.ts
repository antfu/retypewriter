import { Snapshots } from 'retypewriter'
import example from '../../../examples/main.js.retypewriter?raw'

export const snaps = reactive(Snapshots.fromString(example))
