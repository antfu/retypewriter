import { expect, it } from 'vitest'
import type { Snapshot } from '../src'
import { Snapshots } from '../src'

it('snaps', () => {
  const data: Snapshot[] = [
    { content: '' },
    { content: 'import {} from "vue"', options: { pause: true } },
    { content: 'import { createApp } from "vue"\n\nconst app = createApp()\n' },
  ]

  const snaps = new Snapshots(...data)
  const serialized = snaps.toString()

  expect(serialized).toMatchSnapshot()

  const deserialized = Snapshots.fromString(serialized)

  expect(data).toEqual([...deserialized])
})
