import { commands, workspace } from 'vscode'
import { SNAP_EXT } from '../../core/src'
import { manager } from './manager'
import { play } from './play'
import { snap } from './record'

export function activate() {
  const watcher = workspace.createFileSystemWatcher(`**/*\\${SNAP_EXT}`)
  watcher.onDidChange(uri => manager.delete(uri.path.replace(SNAP_EXT, '')))
  watcher.onDidDelete(uri => manager.delete(uri.path.replace(SNAP_EXT, '')))
  watcher.onDidCreate(uri => manager.delete(uri.path.replace(SNAP_EXT, '')))

  commands.registerCommand('retypewriter.snap', snap)
  commands.registerCommand('retypewriter.play', play)
}

export function deactivate() {

}
