import type { AnimatorStep, Snapshot, SnapshotOptions } from '../types'
import { getTimeout, randRange } from './timing'

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export interface TypewriterOptions {
  defaults?: SnapshotOptions
}

export async function *typingAnimator(
  steps: Generator<AnimatorStep>,

  options: TypewriterOptions = {},
): AsyncGenerator<AnimatorStep> {
  function getOptions(snap: Snapshot) {
    return {
      ...(options.defaults || {}),
      ...(snap.options || {}),
    }
  }

  for (const step of steps) {
    switch (step.type) {
      case 'init':
        break
      case 'snap-start':
        if (step.index) {
          const { wait } = getOptions(step.snap)

          await sleep(wait !== undefined ? wait : randRange(700, 1000))
        }
        if (getOptions(step.snap).pause) {
          yield {
            type: 'action-pause',
            snap: step.snap,
          }
        }
        break
      case 'patch-start':
        if (step.index)
          await sleep(randRange(200, 500))
        break
      case 'insert':
        await sleep(getTimeout(step.char, 1.2))
        break
      case 'paste':
        await sleep(randRange(100, 200))
        break
      case 'removal':
        await sleep(randRange(0, 5))
        break
    }
    yield step
  }
}
