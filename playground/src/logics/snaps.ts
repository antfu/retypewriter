import { Snapshots } from 'retypewriter'
import example from '../../../examples/main.ts.retypewriter?raw'

export const snaps = reactive(Snapshots.fromString(example))
