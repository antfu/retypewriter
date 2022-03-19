export interface InsertPatch {
  type: 'insert'
  from: number
  text: string
}

export interface RemovalPatch {
  type: 'removal'
  from: number
  length: number
}

export type Patch = InsertPatch | RemovalPatch
