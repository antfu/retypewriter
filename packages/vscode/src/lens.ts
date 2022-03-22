import type { CodeLensProvider, Event, ProviderResult, TextDocument } from 'vscode'
import { CodeLens, EventEmitter, Range, Uri } from 'vscode'
import { getOriginalFilePath, parseSnapshots } from '../../core/src'

export class Lens implements CodeLensProvider {
  private _onDidChangeCodeLenses: EventEmitter<void> = new EventEmitter<void>()
  public readonly onDidChangeCodeLenses: Event<void> = this._onDidChangeCodeLenses.event

  provideCodeLenses(document: TextDocument): ProviderResult<CodeLens[]> {
    const {
      snapshots,
    } = parseSnapshots(document.getText())

    const head: CodeLens[] = [
      new CodeLens(
        new Range(0, 0, 0, 0),
        {
          title: 'Play',
          tooltip: 'Play',
          command: 'retypewriter.play',
          arguments: [Uri.file(getOriginalFilePath(document.uri.fsPath)!)],
        },
      ),
      new CodeLens(
        new Range(0, 0, 0, 0),
        {
          title: 'Reverse',
          tooltip: 'Revese items',
          command: 'retypewriter.snap-reverse',
          arguments: [document],
        },
      ),
    ]

    const items = snapshots.flatMap((i, idx) => {
      const start = document.positionAt(i.start + 1)
      const end = document.positionAt(i.start + i.raw.length - 1)
      const range = new Range(start, end)
      const lens: CodeLens[] = []

      if (idx > 0) {
        lens.push(new CodeLens(range, {
          title: '△',
          tooltip: 'Move up',
          command: 'retypewriter.snap-move-up',
          arguments: [document, idx],
        }))
      }
      if (idx < snapshots.length - 1) {
        lens.push(new CodeLens(range, {
          title: '▽',
          tooltip: 'Move down',
          command: 'retypewriter.snap-move-down',
          arguments: [document, idx],
        }))
      }

      lens.push(new CodeLens(range, {
        title: 'Remove',
        tooltip: 'Remove',
        command: 'retypewriter.snap-remove',
        arguments: [document, idx],
      }))

      lens.push(new CodeLens(range, {
        title: '+',
        tooltip: 'Duplicate',
        command: 'retypewriter.snap-duplicate',
        arguments: [document, idx],
      }))

      return lens
    })

    return [
      ...head,
      ...items,
    ]
  }
}
