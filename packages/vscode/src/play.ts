import type { StatusBarItem, TextDocument, Uri } from 'vscode'
import { CancellationTokenSource, Range, Selection, StatusBarAlignment, ThemeColor, commands, window } from 'vscode'
import type { ControlledPromise } from '@antfu/utils'
import { createControlledPromise } from '@antfu/utils'
import { manager } from './manager'
import { resolveDoc } from './utils'

let token: CancellationTokenSource | undefined
let pausePromise: ControlledPromise<void> | undefined
let status: StatusBarItem | undefined

export async function playAbort(prompts = false) {
  if (token) {
    if (prompts && await window.showInformationMessage('Abort playing?', 'Yes', 'Cancel') !== 'Yes')
      return
    continuePause()
    token.cancel()
    token = undefined
    if (status) {
      status.dispose()
      status = undefined
    }
    updateContext()
  }
}

export function updateContext() {
  const playing = isPlaying()
  commands.executeCommand('setContext', 'reTypewriter.isPlaying', playing)
  commands.executeCommand('setContext', 'reTypewriter.isNotPlaying', !playing)
}

export function isPlaying() {
  return token !== undefined
}

export async function continuePause() {
  pausePromise?.resolve()
}

export async function playStart(arg?: TextDocument | Uri) {
  const { doc, editor } = await resolveDoc(arg)
  if (!doc || !editor)
    return

  if (token) {
    window.showErrorMessage('reTypewriter: Already playing')
    return
  }
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

  const setCursor = (index: number) => {
    const pos = doc.positionAt(index)
    editor.selection = new Selection(pos, pos)
  }

  const total = snaps.length - 1
  let message = `Step 0 of ${total}`
  const spin = '$(loading~spin) '

  token = new CancellationTokenSource()
  status = window.createStatusBarItem(StatusBarAlignment.Left, Number.POSITIVE_INFINITY)
  status.show()
  updateContext()

  let lastProgress = 0
  function updateProgress(index = lastProgress) {
    lastProgress = index
    message = `Step ${index} of ${total}`
    if (status) {
      status.color = new ThemeColor('terminal.ansiBrightGreen')
      status.text = spin + message
      status.backgroundColor = undefined
      status.command = {
        title: 'Abort',
        command: 'retypewriter.abort',
        arguments: [true],
      }
    }
  }
  async function pause() {
    pausePromise = createControlledPromise()
    if (status) {
      status.backgroundColor = new ThemeColor('statusBarItem.warningBackground')
      status.color = undefined
      status.text = '$(debug-pause) Paused, press any key to continue'
      status.command = {
        title: 'Continue',
        command: 'retypewriter.continue',
      }
    }
    const command = commands.registerCommand('type', ({ text } = {}) => {
      if (!text)
        return
      continuePause()
      command.dispose()
    })
    await pausePromise

    pausePromise = undefined
    updateProgress()
    command.dispose()
  }

  updateProgress(0)

  for await (const snap of snaps.typewriter()) {
    if (!token)
      break
    if (token.token.isCancellationRequested)
      break
    switch (snap.type) {
      case 'snap-start':
        updateProgress(snap.index)
        break

      case 'patch-finish':
        updateProgress(snap.index)
        break

      case 'init':
        await editor.edit(edit => edit.replace(new Range(0, 0, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY), snap.content))
        break

      case 'paste':
        await editor.edit(edit => edit.insert(
          doc.positionAt(snap.cursor - snap.content.length),
          snap.content,
        ))
        setCursor(snap.cursor)
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
        await pause()
        break
    }
  }

  status?.dispose()
  token = undefined
  updateContext()
}
