export const syntaxMaps: [string, string, string, string][] = [
  ['', '', 'source.text', ''],
  ['js', 'javascript', 'source.js', 'JavaScript'],
  ['jsx', 'javascriptreact', 'source.jsx', 'JSX'],
  ['ts', 'typescript', 'source.ts', 'TypeScript'],
  ['tsx', 'typescriptreact', 'source.jsx', 'TSX'],
  ['vue', 'vue', 'source.vue', 'Vue'],
  ['html', 'html', 'source.html', 'HTML'],
]

export function getSyntaxInfo(ext: string) {
  return syntaxMaps.find(item => item[0] === ext) || syntaxMaps[0]
}

export const langageIds = syntaxMaps.map(item => item[0] ? `retypewriter-${item[0]}` : item[0])
