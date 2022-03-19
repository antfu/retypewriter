import _TypeIt from 'typeit'
import { calculatePatch, diff } from './src'

const TypeIt = _TypeIt as any

const typingEl = document.getElementById('typing') as HTMLParagraphElement
const inputEl = document.getElementById('input') as HTMLTextAreaElement
const outputEl = document.getElementById('output') as HTMLTextAreaElement

let input = `
import { describe, expect, it } from 'vitest'
import { one } from '../src'

describe('should', () => {
  it('exported', () => {
    expect(one).toEqual(1)
  })
})
`

let output = `
import { describe, expect, it } from 'vitest'

describe('should', () => {
  it('one', () => {
    expect(one).toEqual(1)
    expect(two).toEqual(2)
  })
})
`

inputEl.value = input
outputEl.value = output

inputEl.addEventListener('input', () => {
  input = inputEl.value
  start()
})

outputEl.addEventListener('input', () => {
  output = outputEl.value
  start()
})

let typeit: any

function start() {
  if (typeit)
    typeit.reset()

  typingEl.textContent = ''

  typeit = new TypeIt(typingEl, {
    speed: 50,
    waitUntilVisible: true,
  })

  const patches = calculatePatch(diff(input, output))

  typeit
    .type(input, { instant: true })

  for (const patch of patches) {
    typeit
      .pause(800)

    if (patch.type === 'insert') {
      typeit
        .move(null, { to: 'START', instant: true })
        .move(patch.from, { instant: true })
        .type(patch.text, { delay: 300 })
    }
    else {
      typeit
        .move(null, { to: 'START', instant: true })
        .move(patch.from, { instant: true })
        .delete(patch.length)
    }
  }

  typeit.go()
}

start()
