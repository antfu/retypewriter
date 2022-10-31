import { calculatePatch, diff } from '../state/patch'
import type { AnimatorStep, Patch, Snapshot } from '../types'
import { sliceInput } from './slicing'

export function *patchSteps(input: string, patches: Patch[]): Generator<AnimatorStep> {
  let output = input
  let cursor = 0

  for (let index = 0; index < patches.length; index++) {
    const patch = patches[index]

    yield {
      type: 'patch-start',
      patch,
      index,
      total: patches.length,
    }

    const head = output.slice(0, patch.cursor)
    const tail = output.slice(patch.cursor)

    if (patch.type === 'insert') {
      cursor = patch.cursor

      for (const { char, output, cursor: delta } of animateInsertionSlices(patch.content)) {
        yield {
          type: 'insert',
          char,
          cursor: cursor + delta,
          content: head + output + tail,
        }
      }

      output = head + patch.content + tail
    }
    else if (patch.type === 'paste') {
      cursor = patch.cursor
      const { content } = patch

      yield {
        type: 'paste',
        cursor: cursor + content.length,
        content,
      }

      output = head + patch.content + tail
    }
    else if (patch.type === 'removal') {
      cursor = patch.cursor - patch.length
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

    yield {
      type: 'patch-finish',
      content: output,
      index,
      total: patches.length,
    }
  }
}

export function *animateSteps(snapshots: Snapshot[]): Generator<AnimatorStep> {
  let lastContent: string | undefined
  const copy = [...snapshots]
  for (let index = 0; index < copy.length; index++) {
    const snap = copy[index]
    if (lastContent == null) {
      lastContent = snap.content
      yield {
        type: 'init',
        content: lastContent,
      }
      continue
    }

    yield {
      type: 'snap-start',
      snap,
      index,
      total: copy.length,
    }

    const isPasted = snap.options?.paste

    const steps = stepsTo(lastContent, snap.content, isPasted)
    for (const step of steps)
      yield step

    yield {
      type: 'snap-finish',
      content: snap.content,
      snap,
      index,
      total: copy.length,
    }

    lastContent = snap.content
  }
}

export function *animateInsertionSlices(input: string) {
  const slices = sliceInput(input)
  let output = ''
  for (const { content, cursor } of slices) {
    const head = output.slice(0, cursor)
    const tail = output.slice(cursor)

    let body = ''
    for (const char of content) {
      body += char
      yield {
        char,
        output: head + body + tail,
        cursor: cursor + body.length,
      }
    }
    output = head + content + tail
  }
}

export function stepsTo(input: string, output: string, isPasted?: boolean) {
  const delta = diff(input, output)
  const patches = calculatePatch(delta, isPasted)
  return patchSteps(input, patches)
}
