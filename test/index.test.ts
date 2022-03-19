import { describe, expect, it } from 'vitest'
import { applyPatches, calculatePatch, diff } from '../packages/core/src'
import { input, output } from './fixture'

describe('should', () => {
  it('exported', () => {
    const delta = diff(input, output)
    expect(delta).toMatchSnapshot('delta')
    const patches = calculatePatch(delta)
    expect(patches).toMatchSnapshot('patches')
    const applied = applyPatches(input, patches)
    expect(applied.output).toMatchSnapshot('output')
    expect(applied.output).toEqual(output)
  })
})
