import { Snapshots } from 'retypewriter'
import type { TextDocument } from 'vscode'
import { Range, window } from 'vscode'
import { updateAnnotation } from './decoration'
import { manager } from './manager'

export async function manipulateSnapshotsInDocument(
  doc: TextDocument,
  fn: ((snaps: Snapshots) => Promise<any> | any),
) {
  const raw = doc.getText()
  const snaps = Snapshots.fromString(raw)

  await fn(snaps)

  manager.set(doc.uri.fsPath, snaps)
  const result = snaps.toString()
  if (result !== raw) {
    const editor = await window.showTextDocument(doc, { preview: false, preserveFocus: false })
    await editor.edit((e) => {
      e.replace(new Range(0, 0, Infinity, Infinity), snaps.toString())
    })
    await updateAnnotation(editor)
  }
}

export async function move(doc: TextDocument, index: number, delta = 1) {
  return manipulateSnapshotsInDocument(
    doc,
    snaps => snaps.move(index, index + delta),
  )
}

export const moveUp = (doc: TextDocument, index: number) => move(doc, index, -1)
export const moveDown = (doc: TextDocument, index: number) => move(doc, index, 1)

export const remove = (doc: TextDocument, index: number) => {
  return manipulateSnapshotsInDocument(
    doc,
    snaps => snaps.remove(index),
  )
}

export const duplicate = (doc: TextDocument, index: number) => {
  return manipulateSnapshotsInDocument(
    doc,
    snaps => snaps.duplicate(index),
  )
}

export const reverse = (doc: TextDocument) => {
  return manipulateSnapshotsInDocument(
    doc,
    snaps => snaps.reverse(),
  )
}
