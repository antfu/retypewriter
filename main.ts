import { calculatePatch, createAnimator, diff } from './src'

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

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function start() {
  const _input = input
  const patches = calculatePatch(diff(_input, output))
  const animator = createAnimator(_input, patches)

  for (const result of animator) {
    typingEl.textContent = result.output
    await sleep(Math.random() * 100)
  }
}

start()
