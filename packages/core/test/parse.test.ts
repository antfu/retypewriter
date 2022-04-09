import { expect, it } from 'vitest'
import { parseSnapshots } from '../src/state/parse'
import fixture from '../../../examples/main.js.retypewriter?raw'

it('works', () => {
  expect(parseSnapshots(fixture)).toMatchSnapshot()
})
