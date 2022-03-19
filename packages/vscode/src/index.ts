import { Range, Selection, commands, window } from 'vscode'
import { simpleAnimator } from '../../core/src'

export interface Snapshot {
  content: string
  time: number
}

export function activate() {
  window.showInformationMessage('Hi')

  const snapMap = new Map<string, Snapshot[]>()

  commands.registerCommand('retypewriter.snap', () => {
    const doc = window.activeTextEditor?.document
    if (!doc)
      return
    const path = doc.uri.fsPath

    if (!snapMap.has(path))
      snapMap.set(path, [])

    const snaps = snapMap.get(path)!
    snaps.push({
      content: doc.getText(),
      time: Date.now(),
    })

    window.showInformationMessage(`reTypewriter: Snapshot added (${snaps.length})`)
  })

  commands.registerCommand('retypewriter.play', async() => {
    const editor = window.activeTextEditor
    const doc = editor?.document
    if (!doc || !editor)
      return
    const path = doc.uri.fsPath

    const snaps = snapMap.get(path)
    if (!snaps?.length) {
      window.showErrorMessage('reTypewriter: No snapshots found')
      return
    }

    const lastSnap = snaps[snaps.length - 1]
    if (lastSnap.content !== doc.getText()) {
      snaps.push({
        content: doc.getText(),
        time: Date.now(),
      })
    }

    window.showInformationMessage('reTypewriter: Playing...')

    let lastContent: string | undefined
    for (const snap of snaps) {
      if (!lastContent) {
        lastContent = snap.content

        await editor.edit((edit) => {
          edit.replace(new Range(0, 0, Infinity, Infinity), lastContent!)
        })

        continue
      }

      const animator = simpleAnimator(lastContent, snap.content)

      let lastIndex = -1
      for (const result of animator) {
        if (lastIndex !== result.patchIndex)
          await sleep(900)

        const pos = doc.positionAt(result.cursor)
        await editor.edit((edit) => {
          if (result.char != null) {
            edit.insert(doc.positionAt(result.cursor - 1), result.char)
          }
          else {
            const range = new Range(pos, doc.positionAt(result.cursor + 1))
            edit.delete(range)
          }
        })

        editor.selection = new Selection(pos, pos)

        await sleep(Math.random() * 200)
        lastIndex = result.patchIndex
      }

      lastContent = snap.content
    }

    window.showInformationMessage('reTypewriter: Finished...')
  })
}

export function deactivate() {

}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
