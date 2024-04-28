export interface ICanvasState {
  isSendingBlocked: boolean
}

export interface IPosition {
  x?: number | undefined
  y?: number | undefined
  type?: string | undefined
}

export interface IBounds {
  x: number
  y: number
  width: number
  height: number
}
