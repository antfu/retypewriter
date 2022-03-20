import { expect, it } from 'vitest'
import { applySlice, sliceInput } from '../src/slicing'

it('works', () => {
  const fixture = `
import { describe, expect, it } from 'vitest'

describe('should', () => {
  it('one', () => {
    expect(one).toEqual(1)
  })
})\n`

  const slices = sliceInput(fixture)

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
  expect(applySlice(slices)).toEqual(fixture)
})
