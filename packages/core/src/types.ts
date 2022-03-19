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

export interface Snapshot {
  content: string
  options?: SnapshotOptions
}

export interface SnapshotOptions {
  wait?: number
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

export type AnimatorStep = AnimatorStepInsert | AnimatorStepRemoval | AnimatorStepInit | AnimatorStepPatch | AnimatorStepSnap
