export interface InsertPatch {
  type: 'insert'
  cursor: number
  content: string
}

export interface RemovalPatch {
  type: 'removal'
  cursor: number
  length: number
}

export type Patch = InsertPatch | RemovalPatch

export interface Slice {
  content: string
  order: number
  cursor: number
}

export interface Snapshot {
  content: string
  options?: SnapshotOptions
}

export interface SnapshotOptions {
  wait?: number
  pause?: boolean
}

export interface AnimatorStepInsert {
  type: 'insert' | 'delete'
  cursor: number
  content: string
  char: string
}

export interface AnimatorStepRemoval {
  type: 'removal'
  cursor: number
  content: string
}

export interface AnimatorStepInit {
  type: 'init'
  content: string
}

export interface AnimatorStepPatch {
  type: 'new-patch'
  patch: Patch
  index: number
}

export interface AnimatorStepSnap {
  type: 'new-snap'
  snap: Snapshot
  index: number
}

export interface AnimatorStepSnapFinish {
  type: 'snap-finish'
  content: string
}

export type AnimatorStep =
  | AnimatorStepInsert
  | AnimatorStepRemoval
  | AnimatorStepInit
  | AnimatorStepPatch
  | AnimatorStepSnap
  | AnimatorStepSnapFinish

export interface ParsedSnaphot {
  raw: string
  start: number
  end: number
  body: string
  bodyStart: number
  bodyEnd: number
  optionsRaw?: string
  options?: SnapshotOptions
}

export interface ParsedHead {
  options?: SnapshotOptions
}
