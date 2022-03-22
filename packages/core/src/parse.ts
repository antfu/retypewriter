import YAML from 'js-yaml'
import { SNAP_HEADING, SNAP_SEPERATOR_MATCHER, SNAP_SEPERATOR_OPTIONS_MATCHER } from './snaps'
import type { SnapshotOptions } from './types'

export interface ParsedSnaphot {
  raw: string
  start: number
  end: number
  body: string
  bodyStart: number
  bodyEnd: number
  optionsRaw?: string
  options?: SnapshotOptions
}

export interface ParsedHead {
  options?: SnapshotOptions
}

function parseOptions(raw: string): SnapshotOptions | undefined {
  raw = raw.trim()
  if (!raw)
    return undefined
  return (raw.startsWith('{'))
    ? JSON.parse(raw)
    : YAML.load(raw)
}

export function parseSnapshots(raw: string) {
  if (!raw.startsWith(SNAP_HEADING))
    throw new SyntaxError('Invalid snapshot file')
  if (!raw.endsWith('\n'))
    raw += '\n'

  const head: ParsedHead = {}
  const snaps: ParsedSnaphot[] = []

  SNAP_SEPERATOR_MATCHER.lastIndex = 0
  const matches = Array.from(raw.matchAll(SNAP_SEPERATOR_MATCHER))

  matches.forEach((match, idx) => {
    const start = match.index!

    if (idx === 0) {
      const content = raw.slice(0, start)
      head.options = parseOptions(content.slice(SNAP_HEADING.length))
    }

    const next = matches[idx + 1]
    const end = next?.index ?? raw.length
    const bodyStart = start + match[0].length
    const withOptions = raw.slice(bodyStart, end)
    const parts = withOptions.split(SNAP_SEPERATOR_OPTIONS_MATCHER)
    const body = parts[0]
    const bodyEnd = bodyStart + body.length
    const snap: ParsedSnaphot = {
      raw: raw.slice(start, end),
      start,
      end,
      body,
      bodyEnd,
      bodyStart,
    }
    const optionsRaw = parts[1]?.trim()
    if (optionsRaw) {
      snap.optionsRaw = optionsRaw
      snap.options = parseOptions(optionsRaw)
    }
    snaps.push(snap)
  })

  // remove tailing separator
  snaps.pop()

  return {
    head,
    snapshots: snaps,
  }
}
