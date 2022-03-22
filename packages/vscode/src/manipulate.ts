import { Snapshots, parseSnapshots } from 'retypewriter'
import type { TextDocument, TextEditor } from 'vscode'
import { Range, Selection, window } from 'vscode'
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
  let editor: TextEditor | undefined
  if (result !== raw) {
    editor = await window.showTextDocument(doc, { preview: false, preserveFocus: false })
    await editor.edit((e) => {
      e.replace(new Range(0, 0, Infinity, Infinity), snaps.toString())
    })
    await updateAnnotation(editor)
  }

  return {
    snaps,
    doc,
    editor,
  }
}

export async function move(doc: TextDocument, index: number, delta = 1) {
  const to = index + delta
  const { editor } = await manipulateSnapshotsInDocument(
    doc,
    snaps => snaps.move(index, to),
  )

  if (editor) {
    // select to highlight the moved block
    const target = parseSnapshots(doc.getText()).snapshots[to]
    if (target) {
      editor.selection = new Selection(
        doc.positionAt(target.start + 1),
        doc.positionAt(target.end),
      )
    }
  }
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
