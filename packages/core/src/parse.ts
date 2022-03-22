import YAML from 'js-yaml'
import type { ParsedHead, ParsedSnaphot, Snapshot, SnapshotOptions } from './types'

export const SNAP_EXT = '.retypewriter'
export const SNAP_HEADING = 'reTypewriter Snapshots v1\n'
export const SNAP_SEPERATOR_PRE = '-'.repeat(2)
export const SNAP_SEPERATOR_POST = '-'.repeat(10)
export const SNAP_SEPERATOR = `${SNAP_SEPERATOR_PRE}--${SNAP_SEPERATOR_POST}`
export const SNAP_SEPERATOR_OPTIONS = '-----options--'
export const SNAP_SEPERATOR_MATCHER = new RegExp(`\\n?${SNAP_SEPERATOR_PRE}[\\w-]{2}${SNAP_SEPERATOR_POST}\\n`, 'g')
export const SNAP_SEPERATOR_OPTIONS_MATCHER = new RegExp(`\\n?${SNAP_SEPERATOR_OPTIONS}\\n`, 'g')

export function parseOptions(raw: string): SnapshotOptions | undefined {
  raw = raw.trim()
  if (!raw)
    return undefined
  return (raw.startsWith('{'))
    ? JSON.parse(raw)
    : YAML.load(raw)
}

export function stringifySnapshots(snapshots: Snapshot[], useYaml = true) {
  return [
    SNAP_HEADING,
    ...snapshots
      .flatMap((snap, i) => [
        SNAP_SEPERATOR_PRE + (i + 1).toString().padStart(2, '0') + SNAP_SEPERATOR_POST,
        snap.content,
        ...(
          snap.options
            ? [
              SNAP_SEPERATOR_OPTIONS,
              useYaml
                ? YAML.dump(snap.options, { indent: 2 }).trimEnd()
                : Object.keys(snap.options).length > 1
                  ? JSON.stringify(snap.options, null, 2)
                  : JSON.stringify(snap.options),
            ]
            : []
        ),
      ]),
    SNAP_SEPERATOR,
    '',
  ].join('\n')
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
