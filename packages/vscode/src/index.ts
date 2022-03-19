import { existsSync, promises as fs } from 'fs'
import { Range, Selection, commands, window, workspace } from 'vscode'
import { SnapshotManager, Snapshots, simpleAnimator } from '../../core/src'

const snapExt = '.retypewriter'

export function activate() {
  window.showInformationMessage('Hi')

  function getSnapPath(id: string) {
    return id + snapExt
  }

  const manager = new SnapshotManager({
    async ensureFallback(path) {
      const filepath = getSnapPath(path)
      if (existsSync(filepath)) {
        const content = await fs.readFile(filepath, 'utf8')
        const snap = Snapshots.fromString(content)
        window.showInformationMessage('reTypewriter: Snapshots loaded from file')
        return snap
      }
    },
  })

  workspace.createFileSystemWatcher(`**/*\\${snapExt}`)
    .onDidCreate((uri) => {
      // invalidate cache
      manager.delete(uri.path.replace(snapExt, ''))
    })

  async function writeSnapshots(path: string, snap: Snapshots) {
    const filepath = getSnapPath(path)
    await fs.writeFile(filepath, snap.toString(), 'utf8')
  }

  commands.registerCommand('retypewriter.snap', async() => {
    const doc = window.activeTextEditor?.document
    if (!doc)
      return
    const path = doc.uri.fsPath
    if (path.endsWith(snapExt))
      return

    const snaps = await manager.ensure(path)

    snaps.push({ content: doc.getText() })
    await writeSnapshots(path, snaps)

    window.showInformationMessage(`reTypewriter: Snapshot added (${snaps.length})`)
  })

  commands.registerCommand('retypewriter.play', async() => {
    const editor = window.activeTextEditor
    const doc = editor?.document
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

    let lastContent: string | undefined
    for (const snap of snaps) {
      if (lastContent == null) {
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

        await editor.edit((edit) => {
          if (result.char != null) {
            edit.insert(
              doc.positionAt(result.cursor - 1),
              result.char,
            )
          }
          else {
            edit.delete(new Range(
              doc.positionAt(result.cursor),
              doc.positionAt(result.cursor + 1),
            ))
          }
        })

        const pos = doc.positionAt(result.cursor)
        editor.selection = new Selection(pos, pos)

        await sleep(Math.random() * 60)
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
