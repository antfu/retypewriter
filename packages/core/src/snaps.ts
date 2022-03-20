
import YAML from 'js-yaml'
import type { AnimatorStep, Snapshot } from './types'
import { stepsTo } from './steps'
import type { TypewriterOptions } from './typewriter'
import { typingAnimator } from './typewriter'

export const SNAP_HEADING = 'reTypewriter Snapshots v1\n'
export const SNAP_SEPERATOR_PRE = '-'.repeat(2)
export const SNAP_SEPERATOR_POST = '-'.repeat(10)
export const SNAP_SEPERATOR = `${SNAP_SEPERATOR_PRE}--${SNAP_SEPERATOR_POST}`
export const SNAP_SEPERATOR_OPTIONS = '-----options--'
export const SNAP_SEPERATOR_MATCHER = new RegExp(`\\n?${SNAP_SEPERATOR_PRE}[#\\w-]*${SNAP_SEPERATOR_POST}\\n`, 'g')
export const SNAP_SEPERATOR_OPTIONS_MATCHER = new RegExp(`\\n?${SNAP_SEPERATOR_OPTIONS}\\n`, 'g')

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

  move(from: number, to: number) {
    if (from === to)
      return

    const i = this.splice(from, 1)[0]
    if (to > from)
      to -= 1
    this.splice(to, 0, i)
  }

  toString(useYaml = true) {
    return [
      SNAP_HEADING,
      ...this
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

  static fromString(raw: string) {
    const parts = raw
      .split(SNAP_SEPERATOR_MATCHER)
      .slice(1, -1) // remove header and tailing

    const snapshots: Snapshot[] = []
    for (let i = 0; i < parts.length; i += 1) {
      const withOptions = parts[i].split(SNAP_SEPERATOR_OPTIONS_MATCHER)
      const snap: Snapshot = {
        content: withOptions[0],
      }
      const optionsRaw = withOptions[1]?.trim()
      if (optionsRaw) {
        if (optionsRaw.startsWith('{'))
          snap.options = JSON.parse(optionsRaw)
        else
          snap.options = YAML.load(optionsRaw) as any
      }

      snapshots.push(snap)
    }

    return new Snapshots(...snapshots)
  }

  *steps(): Generator<AnimatorStep> {
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
      const steps = stepsTo(lastContent, snap.content)
      for (const step of steps)
        yield step

      lastContent = snap.content
    }
  }

  typewriter(options?: TypewriterOptions) {
    return typingAnimator(this.steps(), options)
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
