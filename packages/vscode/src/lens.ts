import { parseSnapshots } from 'retypewriter'
import type { CodeLensProvider, Event, ProviderResult, TextDocument } from 'vscode'
import { CodeLens, EventEmitter, Range } from 'vscode'

export class Lens implements CodeLensProvider {
  private _onDidChangeCodeLenses: EventEmitter<void> = new EventEmitter<void>()
  public readonly onDidChangeCodeLenses: Event<void> = this._onDidChangeCodeLenses.event

  provideCodeLenses(document: TextDocument): ProviderResult<CodeLens[]> {
    const {
      snapshots,
    } = parseSnapshots(document.getText())

    return snapshots.flatMap((i, idx) => {
      const start = document.positionAt(i.start + 1)
      const end = document.positionAt(i.start + i.raw.length - 1)
      const range = new Range(start, end)
      return [
        new CodeLens(range, {
          title: '△',
          tooltip: 'Move up',
          command: 'retypewriter.snap-move-up',
          arguments: [document, idx],
        }),
        new CodeLens(range, {
          title: '▽',
          tooltip: 'Move down',
          command: 'retypewriter.snap-move-down',
          arguments: [document, idx],
        }),
      ]
    })
  }
}
