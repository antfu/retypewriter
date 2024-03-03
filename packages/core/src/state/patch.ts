import type { Diff } from 'diff-match-patch-es'
import { diffCleanupSemantic, diffMain } from 'diff-match-patch-es'
import type { Patch } from '../types'

export function diff(a: string, b: string): Diff[] {
  const delta = diffMain(a, b)
  diffCleanupSemantic(delta)
  return delta
}

export function calculatePatch(diff: Diff[], isPasted?: boolean): Patch[] {
  const patches: Patch[] = []

  let cursor = 0
  for (const change of diff) {
    if (change[0] === 0) {
      cursor += change[1].length
    }
    else if (change[0] === -1) {
      const length = change[1].length
      patches.push({
        type: 'removal',
        cursor: cursor + length,
        length,
      })
    }
    else if (change[0] === 1) {
      const content = change[1]
      patches.push({
        type: isPasted ? 'paste' : 'insert',
        cursor,
        content,
      })
      cursor += content.length
    }
    else {
      throw new Error('unknown change type')
    }
  }
  return patches
}
