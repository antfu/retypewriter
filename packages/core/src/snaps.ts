import type { AnimatorStep, Snapshot } from './types'
import { stepsTo } from './steps'
import type { TypewriterOptions } from './typewriter'
import { typingAnimator } from './typewriter'
import { SNAP_EXT, parseSnapshots, stringifySnapshots } from './parse'

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

    const element = this[from]
    this.splice(from, 1)
    this.splice(to, 0, element)
  }

  toString(useYaml = true) {
    return stringifySnapshots(this, useYaml)
  }

  fromString(raw: string) {
    const { snapshots: parsed } = parseSnapshots(raw)
    this.length = 0
    parsed.forEach((p) => {
      this.push({
        content: p.body,
        options: p.options,
      })
    })
    return this
  }

  static fromString(raw: string) {
    return new Snapshots().fromString(raw)
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

export function getSnapshotPath(id: string) {
  if (id.endsWith(SNAP_EXT))
    return id
  return id + SNAP_EXT
}

export function getOriginalFilePath(id: string) {
  if (id.endsWith(SNAP_EXT))
    return id.slice(0, -SNAP_EXT.length)
  return undefined
}
