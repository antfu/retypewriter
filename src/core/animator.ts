import type { Patch } from '.'

export function* createAnimator(input: string, patches: Patch[]) {
  let output = input
  let cursor = 0
  for (const patch of patches) {
    if (patch.type === 'insert') {
      cursor = patch.from
      const head = output.slice(0, patch.from)
      const tail = output.slice(patch.from)
      let selection = ''
      for (const char of patch.text) {
        selection += char
        yield {
          cursor: cursor + selection.length,
          output: head + selection + tail,
        }
      }
      output = head + patch.text + tail
    }
    else if (patch.type === 'removal') {
      cursor = patch.from - patch.length
      const head = output.slice(0, patch.from - patch.length)
      const tail = output.slice(patch.from)
      const selection = output.slice(patch.from - patch.length, patch.from)
      for (let i = selection.length; i >= 0; i--) {
        yield {
          cursor: cursor + i,
          output: head + selection.slice(0, i) + tail,
        }
      }
      output = head + tail
    }
  }
}
