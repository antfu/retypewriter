import { describe, expect, it } from 'vitest'
import type { Diff } from 'diff-match-patch'
import { diff_match_patch as DMP } from 'diff-match-patch'

const input = `
import { describe, expect, it } from 'vitest'
import { one } from '../src'

describe('should', () => {
  it('exported', () => {
    expect(one).toEqual(1)
  })
})
`

const output = `
import { describe, expect, it } from 'vitest'

describe('should', () => {
  it('one', () => {
    expect(one).toEqual(1)
    expect(two).toEqual(2)
  })
})
`

interface InsertPatch {
  type: 'insert'
  from: number
  text: string
}
interface RemovalPatch {
  type: 'removal'
  from: number
  length: number
}

type Patch = InsertPatch | RemovalPatch

function diff(a: string, b: string): Diff[] {
  const differ = new DMP()
  const delta = differ.diff_main(a, b)
  differ.diff_cleanupSemantic(delta)
  return delta
}

function calculatePatch(diff: Diff[]): Patch[] {
  const patches: Patch[] = []

  let index = 0
  for (const change of diff) {
    if (change[0] === 0) {
      index += change[1].length
      continue
    }
    else if (change[0] === -1) {
      const length = change[1].length
      patches.push({
        type: 'removal',
        from: index + length,
        length,
      })
    }
    else if (change[0] === 1) {
      patches.push({
        type: 'insert',
        from: index,
        text: change[1],
      })
      index += change[1].length
    }
    else {
      throw new Error('unknown change type')
    }
  }
  return patches
}

function applyPatches(input: string, patches: Patch[]) {
  let output = input
  for (const patch of patches) {
    if (patch.type === 'insert')
      output = output.slice(0, patch.from) + patch.text + output.slice(patch.from)
    else if (patch.type === 'removal')
      output = output.slice(0, patch.from - patch.length) + output.slice(patch.from)
  }
  return {
    output,
  }
}

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
