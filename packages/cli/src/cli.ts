import { parse as parsePath, resolve } from 'path'
import { promises as fs } from 'fs'
import cac from 'cac'
import { Snapshots, getSnapshotPath } from 'retypewriter'
import { version } from '../package.json'
import { loadFromGit } from './git'
import { playInTerminal } from './terminal'

const cli = cac('retypewriter')

cli
  .version(version)
  .option('-r, --root <path>', 'root path')
  .option('--git', 'Read from Git history')
  .option('--lang <lang>', 'language id for syntax highlighting')
  .help()

cli
  .command('play <file>')
  .action(play)

cli
  .command('')
  .action(() => {
    cli.outputHelp()
  })

cli.parse()

export interface CliOptions {
  git?: string
  root?: string
}

async function play(file: string, options: CliOptions) {
  const {
    root = process.cwd(),
    git,
  } = options

  const absolute = resolve(root, file)
  const snaps = git
    ? await loadFromGit(absolute, root)
    : await loadFromFile(absolute)

  const { ext } = parsePath(file)
  playInTerminal(snaps, ext.slice(1))
}

async function loadFromFile(file: string) {
  return Snapshots.fromString(await fs.readFile(getSnapshotPath(file), 'utf-8'))
}
