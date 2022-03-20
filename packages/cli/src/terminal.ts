/* eslint-disable no-console */
import type { Snapshots } from 'retypewriter'
import { highlight } from 'cli-highlight'
import { createLogUpdate } from 'log-update'
import cliCursor from 'cli-cursor'

const langMap: Record<string, string> = {
  ts: 'typescript',
}

export async function playInTerminal(snaps: Snapshots, lang?: string) {
  console.clear()
  const log = createLogUpdate(
    process.stdout,
    { showCursor: true },
  )

  for await (const snap of snaps.typewriter()) {
    switch (snap.type) {
      case 'init':
      case 'insert':
      case 'removal':
      case 'snap-finish':
        // reset cursor
        cliCursor.hide()
        process.stdout.cursorTo(0, snap.content.split('\n').length - 1)
        // log
        log(highlight(snap.content, {
          language: lang ? langMap[lang] : lang,
          ignoreIllegals: true,
        }))
        // cursor
        if (snap.type !== 'init' && snap.type !== 'snap-finish') {
          const pre = snap.content.slice(0, snap.cursor)
          const lines = pre.split('\n')
          const char = lines[lines.length - 1].length
          process.stdout.cursorTo(char, lines.length - 1)
          cliCursor.show()
        }
        break
    }
  }

  log.done()
}
