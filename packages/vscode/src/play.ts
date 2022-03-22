import type { TextDocument, Uri } from 'vscode'
import { Range, Selection, commands, window } from 'vscode'
import { manager } from './manager'
import { resolveDoc } from './utils'

export async function play(arg?: TextDocument | Uri) {
  const { doc, editor } = await resolveDoc(arg)
  if (!doc || !editor)
    return

  const path = doc.uri.fsPath

  const snaps = await manager.ensure(path)
  if (!snaps?.length) {
    window.showErrorMessage('reTypewriter: No snapshots found')
    return
  }

  const lastSnap = snaps[snaps.length - 1]
  if (lastSnap.content !== doc.getText()) {
    const take = 'Take Snapshot'
    const discard = 'Discard'
    const cancel = 'Cancel'

    const result = await window.showInformationMessage(
      'The current document has been modified since last snapshot. Do you want take another snapshot?',
      { modal: true },
      take,
      discard,
      cancel,
    )
    if (!result || result === cancel)
      return
    if (result === take)
      await commands.executeCommand('retypewriter.snap')
  }

  window.showInformationMessage('reTypewriter: Playing...')

  const setCursor = (index: number) => {
    const pos = doc.positionAt(index)
    editor.selection = new Selection(pos, pos)
  }

  for await (const snap of snaps.typewriter()) {
    switch (snap.type) {
      case 'init':
        await editor.edit(edit => edit.replace(new Range(0, 0, Infinity, Infinity), snap.content))
        break

      case 'insert':
        await editor.edit(edit => edit.insert(
          doc.positionAt(snap.cursor - 1),
          snap.char,
        ))
        setCursor(snap.cursor)
        break

      case 'removal':
        await editor.edit(edit => edit.delete(new Range(
          doc.positionAt(snap.cursor),
          doc.positionAt(snap.cursor + 1),
        )))
        setCursor(snap.cursor)
        break
    }
  }

  window.showInformationMessage('reTypewriter: Finished')
}
