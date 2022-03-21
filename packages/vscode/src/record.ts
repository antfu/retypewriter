import { window } from 'vscode'
import { SNAP_EXT } from '../../core/src'
import { manager, writeSnapshots } from './manager'

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
