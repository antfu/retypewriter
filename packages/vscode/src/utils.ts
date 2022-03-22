import type { TextDocument, TextEditor } from 'vscode'
import { Uri, window, workspace } from 'vscode'
import { getOriginalFilePath } from '../../core/src'

export async function resolveDoc(doc?: TextDocument | Uri): Promise<{
  doc?: TextDocument
  editor?: TextEditor
}> {
  if (doc instanceof Uri) {
    const path = getOriginalFilePath(doc.fsPath) || doc.fsPath
    doc = await workspace.openTextDocument(Uri.file(path))
  }
  doc = doc || window.activeTextEditor?.document
  if (!doc)
    return {}
  const editor = await window.showTextDocument(doc)
  return {
    doc,
    editor,
  }
}

export async function reveal(uri: Uri) {
  const doc = await workspace.openTextDocument(uri)
  await window.showTextDocument(doc)
}
