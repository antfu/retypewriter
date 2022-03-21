import { Snapshots } from 'retypewriter'
import type { TextDocument } from 'vscode'
import { Range, window } from 'vscode'
import { manager } from './manager'

export async function move(doc: TextDocument, index: number, delta = 1) {
  const snaps = Snapshots.fromString(doc.getText())
  snaps.move(index, index + delta)
  manager.set(doc.uri.fsPath, snaps)
  const editor = await window.showTextDocument(doc, { preview: false, preserveFocus: false })
  await editor.edit((e) => {
    e.replace(new Range(0, 0, Infinity, Infinity), snaps.toString())
  })
}

export const moveUp = (doc: TextDocument, index: number) => move(doc, index, -1)
export const moveDown = (doc: TextDocument, index: number) => move(doc, index, 1)
