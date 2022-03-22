import { getOriginalFilePath } from 'retypewriter'
import type { TextDocument, TextEditor } from 'vscode'
import { Uri, window, workspace } from 'vscode'

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
