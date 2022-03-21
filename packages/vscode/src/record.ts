import { promises as fs } from 'fs'
import type { Snapshots } from 'retypewriter'
import { SNAP_EXT, getSnapshotPath } from 'retypewriter'
import { window } from 'vscode'
import { manager } from './manager'

export async function snap() {
  const doc = window.activeTextEditor?.document
  if (!doc)
    return
  const path = doc.uri.fsPath
  if (path.endsWith(SNAP_EXT))
    return

  const snaps = await manager.ensure(path)

  snaps.push({ content: doc.getText() })
  await writeSnapshots(path, snaps)

  window.showInformationMessage(`reTypewriter: Snapshot added (${snaps.length})`)
}

async function writeSnapshots(path: string, snap: Snapshots) {
  const filepath = getSnapshotPath(path)
  await fs.writeFile(filepath, snap.toString(), 'utf8')
}
