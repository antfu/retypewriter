import { existsSync, promises as fs } from 'fs'
import { SnapshotManager, Snapshots, getSnapshotPath } from 'retypewriter'
import { window } from 'vscode'

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
