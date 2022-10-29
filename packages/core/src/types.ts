export interface InsertPatch {
  type: 'insert'
  cursor: number
  content: string
}

export interface PastePatch {
  type: 'paste'
  cursor: number
  content: string
}

export interface RemovalPatch {
  type: 'removal'
  cursor: number
  length: number
}

export type Patch = InsertPatch | PastePatch | RemovalPatch

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
  paste?: boolean
}

export interface AnimatorStepInsert {
  type: 'insert' | 'delete'
  cursor: number
  content: string
  char: string
}

export interface AnimatorStepPaste {
  type: 'paste'
  cursor: number
  content: string
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
  type: 'patch-start'
  patch: Patch
  index: number
  total: number
}

export interface AnimatorStepSnap {
  type: 'snap-start'
  snap: Snapshot
  index: number
  total: number
}

export interface AnimatorStepSnapFinish {
  type: 'snap-finish'
  snap: Snapshot
  content: string
  index: number
  total: number
}

export interface AnimatorStepPatchFinish {
  type: 'patch-finish'
  content: string
  index: number
  total: number
}

export interface AnimatorStepActionPause {
  type: 'action-pause'
  snap: Snapshot
}

export type AnimatorStep =
  | AnimatorStepInsert
  | AnimatorStepPaste
  | AnimatorStepRemoval
  | AnimatorStepInit
  | AnimatorStepPatch
  | AnimatorStepSnap
  | AnimatorStepSnapFinish
  | AnimatorStepPatchFinish
  | AnimatorStepActionPause

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
