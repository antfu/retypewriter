import { commands, languages, window, workspace } from 'vscode'
import { SNAP_EXT } from '../../core/src'
import { Lens } from './lens'
import { manager } from './manager'
import { moveDown, moveUp } from './move'
import { play } from './play'
import { snap } from './record'

export function activate() {
  const watcher = workspace.createFileSystemWatcher(`**/*\\${SNAP_EXT}`)
  watcher.onDidChange(uri => manager.delete(uri.path.replace(SNAP_EXT, '')))
  watcher.onDidDelete(uri => manager.delete(uri.path.replace(SNAP_EXT, '')))
  watcher.onDidCreate(uri => manager.delete(uri.path.replace(SNAP_EXT, '')))

  commands.registerCommand('retypewriter.snap', snap)
  commands.registerCommand('retypewriter.play', play)
  commands.registerCommand('retypewriter.snap-move-up', moveUp)
  commands.registerCommand('retypewriter.snap-move-down', moveDown)
  commands.registerCommand('retypewriter.snap-delete', (...args: any[]) => window.showInformationMessage(`Delete ${args.join(', ')}`))

  languages.registerCodeLensProvider({ scheme: 'file', language: 'retypewriter' }, new Lens())
}

export function deactivate() {

}
