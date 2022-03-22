import type { ExtensionContext } from 'vscode'
import { commands, languages, workspace } from 'vscode'
import { SNAP_EXT } from '../../core/src'
import { registerAnnonations } from './decoration'
import { Lens } from './lens'
import { manager } from './manager'
import { duplicate, moveDown, moveUp, remove, reverse } from './manipulate'
import { play } from './play'
import { snap } from './record'

export function activate(ctx: ExtensionContext) {
  const watcher = workspace.createFileSystemWatcher(`**/*\\${SNAP_EXT}`)

  ctx.subscriptions.push(
    watcher,
    watcher.onDidChange(uri => manager.delete(uri.path.replace(SNAP_EXT, ''))),
    watcher.onDidDelete(uri => manager.delete(uri.path.replace(SNAP_EXT, ''))),
    watcher.onDidCreate(uri => manager.delete(uri.path.replace(SNAP_EXT, ''))),

    commands.registerCommand('retypewriter.snap', snap),
    commands.registerCommand('retypewriter.play', play),
    commands.registerCommand('retypewriter.snap-move-up', moveUp),
    commands.registerCommand('retypewriter.snap-move-down', moveDown),
    commands.registerCommand('retypewriter.snap-remove', remove),
    commands.registerCommand('retypewriter.snap-reverse', reverse),
    commands.registerCommand('retypewriter.snap-duplicate', duplicate),

    languages.registerCodeLensProvider({ scheme: 'file', language: 'retypewriter' }, new Lens()),

    ...registerAnnonations(),
  )
}

export function deactivate() {

}
