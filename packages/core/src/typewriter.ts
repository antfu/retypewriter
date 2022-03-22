import { getTimeout, randRange } from './timing'
import type { AnimatorStep } from './types'

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export interface TypewriterOptions {

}

export async function *typingAnimator(
  steps: Generator<AnimatorStep>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  options: TypewriterOptions = {},
): AsyncGenerator<AnimatorStep> {
  for (const step of steps) {
    switch (step.type) {
      case 'init':
        break
      case 'snap-start':
        if (step.index)
          await sleep(randRange(700, 1000))
        break
      case 'patch-start':
        if (step.index)
          await sleep(randRange(200, 500))
        break
      case 'insert':
        await sleep(getTimeout(step.char, 1.2))
        break
      case 'removal':
        await sleep(randRange(0, 5))
        break
    }
    yield step
  }
}
