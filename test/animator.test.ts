import { expect, it } from 'vitest'
import { calculatePatch, createAnimator, diff } from '../src'
import { input, output } from './fixture'

it('animator', () => {
  const delta = diff(input, output)
  const patches = calculatePatch(delta)
  const animator = createAnimator(input, patches)

  expect([...animator]).toMatchSnapshot('animator')
})
