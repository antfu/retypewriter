import type { Slice } from './types'

const pairs = [
  ['{', '}'],
  ['(', ')'],
  ['[', ']'],
  ['<', '>'],
  ['`', '`'],
  ['\'', '\''],
  ['"', '"'],
]

const chars = '(){}\\[\\]<>\'"`'
const splitRegex = new RegExp(`(\\s*[${chars}]\\s*)`)

export function sliceInput(input: string): Slice[] {
  if (!input)
    return []
  const tailingNewLines = input.match(/\n+$/m)?.[0] || ''
  const rest = tailingNewLines.length
    ? input.slice(0, -tailingNewLines.length)
    : input

  const strings = rest.split(splitRegex).filter(Boolean)

  // assertion
  import.meta.vitest?.expect(strings.join('')).toEqual(rest)

  let index = 0
  const slices = strings
    .map((s, idx) => {
      const trimmed = s.trim()
      const pair = pairs.find(i => i[1] === trimmed)
      const order = (pair && strings[idx - 2]?.trim() === pair[0])
        ? idx - 2 // paired with previous
        : idx

      const _index = index
      index += s.length

      return {
        content: s,
        order,
        cursor: _index,
      }
    })
    .sort((a, b) => a.order - b.order)

  let cursor = 0
  slices.forEach((i) => {
    i.cursor = Math.min(i.cursor, cursor)
    cursor += i.content.length
  })

  if (tailingNewLines.length) {
    slices.unshift({
      content: tailingNewLines,
      order: -1,
      cursor: 0,
    })
  }

  return slices
}

function applySlice(slices: Slice[]) {
  const result = slices.reduce((acc, i) => {
    const { content: contet, cursor } = i
    return acc.slice(0, cursor) + contet + acc.slice(cursor)
  }, '')
  return result
}

if (import.meta.vitest) {
  const { expect, it } = import.meta.vitest

  it('works', () => {
    const fixture = `
import { describe, expect, it } from 'vitest'

describe('should', () => {
  it('one', () => {
    expect(one).toEqual(1)
  })
})\n`

    const slices = sliceInput(fixture)
    // expect(applySlice(slices)).toEqual(fixture)
    expect(applySlice(slices.slice(0, 4))).toMatchInlineSnapshot(`
      "
      import {  } 
      "
    `)
    expect(applySlice(slices.slice(0, 5))).toMatchInlineSnapshot(`
      "
      import { describe, expect, it } 
      "
    `)
    expect(applySlice(slices.slice(0, 6))).toMatchInlineSnapshot(`
      "
      import { describe, expect, it } from
      "
    `)
    expect(slices.slice(0, 4)).toMatchInlineSnapshot(`
      [
        {
          "content": "
      ",
          "cursor": 0,
          "order": -1,
        },
        {
          "content": "
      import",
          "cursor": 0,
          "order": 0,
        },
        {
          "content": " { ",
          "cursor": 7,
          "order": 1,
        },
        {
          "content": " } ",
          "cursor": 10,
          "order": 1,
        },
      ]
    `)
  })
}
