import { calculatePatch, diff } from './patch'
import type { AnimatorStep, Patch } from './types'

export function* createAnimator(input: string, patches: Patch[]): Generator<AnimatorStep> {
  let output = input
  let cursor = 0

  for (let index = 0; index < patches.length; index++) {
    const patch = patches[index]

    yield { type: 'new-patch', patch, index }

    if (patch.type === 'insert') {
      cursor = patch.cursor
      const head = output.slice(0, patch.cursor)
      const tail = output.slice(patch.cursor)
      let selection = ''
      for (const char of patch.content) {
        selection += char
        yield {
          type: 'insert',
          char,
          cursor: cursor + selection.length,
          content: head + selection + tail,
        }
      }
      output = head + patch.content + tail
    }
    else if (patch.type === 'removal') {
      cursor = patch.cursor - patch.length
      const head = output.slice(0, cursor)
      const tail = output.slice(patch.cursor)
      const selection = output.slice(cursor, patch.cursor)
      for (let i = selection.length - 1; i >= 0; i--) {
        yield {
          type: 'removal',
          cursor: cursor + i,
          content: head + selection.slice(0, i) + tail,
        }
      }
      output = head + tail
    }
  }

  yield { type: 'snap-finish', content: output }
}

export function simpleAnimator(input: string, output: string) {
  const delta = diff(input, output)
  const patches = calculatePatch(delta)
  return createAnimator(input, patches)
}

export function applyPatches(input: string, patches: Patch[]) {
  for (const patch of createAnimator(input, patches)) {
    if (patch.type === 'snap-finish')
      return patch.content
  }
  return input
}
