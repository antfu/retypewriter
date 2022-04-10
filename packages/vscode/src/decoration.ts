import { DecorationRangeBehavior, Range, ThemeColor, window, workspace } from 'vscode'
import { calculatePatch, diff, parseSnapshots } from '../../core/src'

const DecorationInserted = window.createTextEditorDecorationType({
  // color: new ThemeColor('terminal.ansiGreen'),
  backgroundColor: new ThemeColor('diffEditor.insertedTextBackground'),
  rangeBehavior: DecorationRangeBehavior.ClosedClosed,
})
const DecorationRemoved = window.createTextEditorDecorationType({
  // color: new ThemeColor('terminal.ansiRed'),
  backgroundColor: new ThemeColor('diffEditor.removedTextBackground'),
  rangeBehavior: DecorationRangeBehavior.ClosedClosed,
})

export async function updateAnnotation(editor = window.activeTextEditor) {
  const doc = editor?.document
  if (!doc || !doc.languageId.includes('retypewriter'))
    return reset()

  const code = doc.getText()
  const snaps = parseSnapshots(code).snapshots

  const removed: Range[] = []
  const inserted: Range[] = []

  snaps.forEach((snap, index) => {
    if (index === 0)
      return
    const prev = snaps[index - 1]

    calculatePatch(diff(prev.body, snap.body))
      .forEach((patch) => {
        if (patch.type === 'insert') {
          inserted.push(new Range(
            doc.positionAt(snap.bodyStart + patch.cursor),
            doc.positionAt(snap.bodyStart + patch.cursor + patch.content.length),
          ))
        }
      })

    calculatePatch(diff(snap.body, prev.body))
      .forEach((patch) => {
        if (patch.type === 'insert') {
          removed.push(new Range(
            doc.positionAt(prev.bodyStart + patch.cursor),
            doc.positionAt(prev.bodyStart + patch.cursor + patch.content.length),
          ))
        }
      })
  })

  function reset() {
    editor?.setDecorations(DecorationInserted, [])
    editor?.setDecorations(DecorationRemoved, [])
  }
  editor.setDecorations(DecorationInserted, inserted)
  editor.setDecorations(DecorationRemoved, removed)
}

export function registerAnnonations() {
  const throttledUpdateAnnotation = throttle(updateAnnotation, 200)

  updateAnnotation()

  return [
    window.onDidChangeActiveTextEditor(updateAnnotation),
    workspace.onDidChangeTextDocument((e) => {
      if (e.document === window.activeTextEditor?.document)
        throttledUpdateAnnotation()
    }),
  ]
}

export function throttle<T extends((...args: any) => any)>(func: T, timeFrame: number): T {
  let lastTime = 0
  let timer: any
  return function() {
    const now = Date.now()
    clearTimeout(timer)
    if (now - lastTime >= timeFrame) {
      lastTime = now
      return func()
    }
    else {
      timer = setTimeout(func, timeFrame)
    }
  } as T
}
