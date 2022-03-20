import { expect, it } from 'vitest'
import { stepsTo } from '../src'
import { input, output } from './fixture'

it('steps', () => {
  const steps = stepsTo(input, output)

  expect([...steps]).toMatchSnapshot('steps')
})
