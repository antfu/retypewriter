import { expect, it } from 'vitest'
import { animateTo } from '../src'
import { input, output } from './fixture'

it('animator', () => {
  const animator = animateTo(input, output)

  expect([...animator]).toMatchSnapshot('animator')
})
