import type { TextDocument, Uri } from 'vscode'
import { ProgressLocation, Range, Selection, commands, window } from 'vscode'
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

  await window.withProgress({
    location: ProgressLocation.Notification,
    title: '',
    cancellable: true,
  }, async(progress, token) => {
    const setCursor = (index: number) => {
      const pos = doc.positionAt(index)
      editor.selection = new Selection(pos, pos)
    }

    const total = snaps.length - 1
    const perSnap = 100 / total

    let message = `Step 0 of ${total}`
    progress.report({
      message,
      increment: 0,
    })

    for await (const snap of snaps.typewriter()) {
      if (token.isCancellationRequested)
        return
      switch (snap.type) {
        case 'snap-start':
          message = `Step ${snap.index} of ${total}`
          progress.report({
            message,
          })
          break

        case 'patch-finish':
          progress.report({ message, increment: perSnap / snap.total })
          break

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

        case 'action-pause':
          await window.showInformationMessage('Action paused', 'OK')
          break
      }
    }
  })
}
