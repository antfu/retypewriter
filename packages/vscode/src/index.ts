import { existsSync, promises as fs } from 'fs'
import { Range, Selection, commands, window, workspace } from 'vscode'
import { SNAP_EXT, SnapshotManager, Snapshots, getSnapshotPath } from '../../core/src'

export function activate() {
  const manager = new SnapshotManager({
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

  // invalidate cache
  const watcher = workspace.createFileSystemWatcher(`**/*\\${SNAP_EXT}`)
  watcher.onDidChange(uri => manager.delete(uri.path.replace(SNAP_EXT, '')))
  watcher.onDidDelete(uri => manager.delete(uri.path.replace(SNAP_EXT, '')))
  watcher.onDidCreate(uri => manager.delete(uri.path.replace(SNAP_EXT, '')))

  async function writeSnapshots(path: string, snap: Snapshots) {
    const filepath = getSnapshotPath(path)
    await fs.writeFile(filepath, snap.toString(), 'utf8')
  }

  commands.registerCommand('retypewriter.snap', async() => {
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
  })
}

export function deactivate() {

}
