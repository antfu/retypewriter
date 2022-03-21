import YAML from 'js-yaml'
import { SNAP_HEADING, SNAP_SEPERATOR_MATCHER, SNAP_SEPERATOR_OPTIONS_MATCHER } from './snaps'
import type { SnapshotOptions } from './types'

export interface ParsedSnap {
  raw: string
  index: number
  type: 'seperator' | 'options' | 'snapshot' | 'head'
  options?: SnapshotOptions
}

export function parseSnap(raw: string) {
  if (!raw.startsWith(SNAP_HEADING))
    throw new SyntaxError('Invalid snapshot file')

  const parts = []
  SNAP_SEPERATOR_MATCHER.lastIndex = 0
  let index = 0
  for (const i of raw.matchAll(SNAP_SEPERATOR_MATCHER)) {
    const content = raw.substring(index, i.index!)
    const withOptions = content.split(SNAP_SEPERATOR_OPTIONS_MATCHER)
    parts.push({
      raw: withOptions[0],
      index,
      type: 'snapshot',
    })
    const optionsRaw = withOptions[1]?.trim()
    if (optionsRaw) {
      const options = (optionsRaw.startsWith('{'))
        ? JSON.parse(optionsRaw)
        : YAML.load(optionsRaw) as any

      parts.push({
        raw: withOptions[1],
        index,
        type: 'options',
        options,
      })
    }

    index = i.index!
    parts.push({
      raw: i[0],
      index,
      type: 'seperator',
    })
    index += i[0].length
  }

  return parts
}
