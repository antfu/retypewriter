
import type { AnimatorStep, Snapshot } from './types'
import { simpleAnimator } from './animator'

export const SNAP_HEADING = 'reTypewriter Snapshots v1'
export const SNAP_SEPERATOR_PRE = '-'.repeat(2)
export const SNAP_SEPERATOR_POST = '-'.repeat(10)
export const SNAP_SEPERATOR = `${SNAP_SEPERATOR_PRE}--${SNAP_SEPERATOR_POST}`
export const SNAP_SEPERATOR_MATCHER = new RegExp(`\\n?${SNAP_SEPERATOR_PRE}[#\\w-]*${SNAP_SEPERATOR_POST}\\n`, 'g')

export class Snapshots extends Array<Snapshot> {
  constructor(...args: Snapshot[]) {
    super(...args)
  }

  get last() {
    return this[this.length - 1]
  }

  get first() {
    return this[0]
  }

  toString() {
    return [
      SNAP_HEADING,
      ...this
        .flatMap((snap, i) => {
          return [
            SNAP_SEPERATOR_PRE + (i + 1).toString().padStart(2, '0') + SNAP_SEPERATOR_POST,
            snap.content,
            SNAP_SEPERATOR,
            snap.options ? JSON.stringify(snap.options, null, 2) : undefined,
          ].filter(i => i !== undefined)
        }),
      SNAP_SEPERATOR,
      '',
    ].join('\n')
  }

  static fromString(raw: string) {
    const parts = raw
      .split(SNAP_SEPERATOR_MATCHER)
      .slice(1, -1) // remove header and tailing

    const snapshots: Snapshot[] = []
    for (let i = 0; i < parts.length; i += 2) {
      const snap: Snapshot = {
        content: parts[i],
      }
      const optionsRaw = parts[i + 1].trim()
      if (optionsRaw)
        snap.options = JSON.parse(parts[i + 1])

      snapshots.push(snap)
    }

    return new Snapshots(...snapshots)
  }

  *animate(): Generator<AnimatorStep> {
    let lastContent: string | undefined
    const copy = [...this]
    for (let index = 0; index < copy.length; index++) {
      const snap = copy[index]
      if (lastContent == null) {
        lastContent = snap.content
        yield {
          type: 'init',
          content: lastContent,
        }
        continue
      }

      yield {
        type: 'new-snap',
        snap,
        index,
      }
      const animator = simpleAnimator(lastContent, snap.content)
      for (const result of animator)
        yield result

      lastContent = snap.content
    }
  }
}

export type SnapshotFallbackLoader = (id: string) => Snapshots | undefined | Promise<Snapshots | undefined>
export interface SnapshotManagerOptions {
  ensureFallback?: SnapshotFallbackLoader
}

export class SnapshotManager extends Map<string, Snapshots> {
  constructor(
    public options: SnapshotManagerOptions = {},
  ) {
    super()
  }

  async ensure(
    id: string,
    load = this.options.ensureFallback,
  ) {
    if (!this.has(id))
      this.set(id, await load?.(id) || new Snapshots())
    return this.get(id)!
  }
}
