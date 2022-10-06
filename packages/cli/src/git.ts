import { relative, resolve } from 'path'
import { Snapshots } from 'retypewriter'
import Git from 'simple-git'
import type { Snapshot } from 'retypewriter'

export async function loadFromGit(path: string, cwd = process.cwd()) {
  const git = Git(cwd)
  const root = (await git.raw(['rev-parse', '--show-toplevel'])).trim()
  const full = resolve(process.cwd(), path)
  const file = relative(root, full)
  const items = await git.log({
    file,
  })
  const snaps = await Promise.all(items.all.map(async (): Promise<Snapshot> => {
    const content = await git.show(`${items.latest!.hash}:${file}`)
    return {
      content,
    }
  }))
  return new Snapshots(...snaps)
}
