import type { TextDocument, Uri } from 'vscode'
import { window } from 'vscode'
import { SNAP_EXT } from '../../core/src'
import { manager, writeSnapshots } from './manager'
import { resolveDoc } from './utils'

export async function snap(arg?: TextDocument | Uri) {
  const { doc, editor } = await resolveDoc(arg)
  if (!doc || !editor)
    return

  const path = doc.uri.fsPath
  if (path.endsWith(SNAP_EXT))
    return

  const snaps = await manager.ensure(path)

  snaps.push({ content: doc.getText() })
  await writeSnapshots(path, snaps)

  window.showInformationMessage(`reTypewriter: Snapshot added (${snaps.length})`)
}
