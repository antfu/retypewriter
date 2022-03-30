import { describe, expect, it } from 'vitest'
import type { Patch } from '../src'
import { calculatePatch, diff, patchSteps } from '../src'
import { input, output } from './fixture'

export function applyPatches(input: string, patches: Patch[]) {
  let output = input
  for (const patch of patchSteps(input, patches)) {
    if (patch.type === 'patch-finish')
      output = patch.content
  }
  return output
}

describe('should', () => {
  it('exported', () => {
    const delta = diff(input, output)
    expect(delta).toMatchSnapshot('delta')
    const patches = calculatePatch(delta)
    expect(patches).toMatchSnapshot('patches')
    const applied = applyPatches(input, patches)
    expect(applied).toMatchSnapshot('output')
    expect(applied).toEqual(output)
  })
})
