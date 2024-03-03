import { promises as fs } from 'node:fs'
import { join, resolve } from 'node:path'
import { syntaxMaps } from '../src/syntaxes'

const root = resolve(__dirname, '..')

export async function run() {
  const pkg = JSON.parse(await fs.readFile(join(root, 'package.json'), 'utf8'))
  pkg.contributes.grammars = []
  pkg.contributes.languages = []
  for (const [e, langId, langScope, display] of syntaxMaps) {
    const language = e ? `retypewriter-${e}` : 'retypewriter'
    const scopeName = `source.${language}`
    const filename = `${langId || 'default'}.json`
    const content = generateSyntax(scopeName, langScope)
    await fs.writeFile(join(root, 'syntaxes', filename), `${JSON.stringify(content, null, 2)}\n`)
    pkg.contributes.grammars.push({
      language,
      scopeName,
      path: `./syntaxes/${filename}`,
    })
    pkg.contributes.languages.push({
      id: language,
      aliases: [
        `reTypewriter ${display}`.trim(),
      ],
      extensions: [
        e ? `.${e}.retypewriter` : '.retypewriter',
      ],
    })
  }
  await fs.writeFile(join(root, 'package.json'), `${JSON.stringify(pkg, null, 2)}\n`)
}

export function generateSyntax(scopeName: string, langScope: string) {
  return {
    $schema: 'https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json',
    scopeName,
    patterns: [
      {
        include: '#options',
      },
      {
        include: '#snapshot',
      },
      {
        include: '#seperators',
      },
      {
        include: langScope,
      },
    ],
    repository: {
      snapshot: {
        name: 'punctuation.separator',
        begin: '--[\\d-]{2}----------',
        end: '(-----options--|--[\\d-]{2}----------)',
        patterns: [
          {
            include: langScope,
          },
        ],
      },
      options: {
        name: 'punctuation.separator',
        begin: '-----options--',
        end: '--[\\d-]{2}----------',
        patterns: [
          {
            include: 'source.yaml',
          },
        ],
      },
      seperators: {
        name: 'punctuation.separator',
        match: '(--[\\d-]{2}----------|-----options--|reTypewriter Snapshots v\\d)',
      },
    },
  }
}

run()
