import { expect, it } from 'vitest'
import { parseSnapshots } from '../src/state/parse'
import fixture from '../../../examples/main.js.retypewriter?raw'
import { Snapshots } from '../src'

it('works', () => {
  expect(parseSnapshots(fixture)).toMatchSnapshot()
})

it('serializable', () => {
  const snapshots = Snapshots.fromString(fixture)
  const stringified = snapshots.toString()
  expect(stringified).toEqual(fixture)
})
