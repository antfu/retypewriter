import type { Diff } from 'diff-match-patch'
import { diff_match_patch as DMP } from 'diff-match-patch'

export interface InsertPatch {
  type: 'insert'
  from: number
  text: string
}

export interface RemovalPatch {
  type: 'removal'
  from: number
  length: number
}

export type Patch = InsertPatch | RemovalPatch

export function diff(a: string, b: string): Diff[] {
  const differ = new DMP()
  const delta = differ.diff_main(a, b)
  differ.diff_cleanupSemantic(delta)
  return delta
}

export function calculatePatch(diff: Diff[]): Patch[] {
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

export function applyPatches(input: string, patches: Patch[]) {
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
