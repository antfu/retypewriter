import { existsSync, promises as fs } from 'fs'
import { window } from 'vscode'
import { SnapshotManager, Snapshots, getSnapshotPath } from '../../core/src'

export const manager = new SnapshotManager({
  async ensureFallback(path) {
    const filepath = getSnapshotPath(path)
    if (existsSync(filepath)) {
      const content = await fs.readFile(filepath, 'utf8')
      const snap = Snapshots.fromString(content)
      window.showInformationMessage('reTypewriter: Snapshots loaded from file')
      return snap
    }
  },
})

export async function writeSnapshots(path: string, snap: Snapshots) {
  const filepath = getSnapshotPath(path)
  await fs.writeFile(filepath, snap.toString(), 'utf8')
}
