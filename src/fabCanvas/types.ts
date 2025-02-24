export interface ICanvasState {
  isSendingBlocked: boolean
}

export interface IPosition {
  x?: number | undefined
  y?: number | undefined
  type?: string | undefined
}

export interface IBounds {
  left: number
  top: number
  width: number
  height: number
}

export interface IShapeProps {
  left: number
  top: number
  width: number
  height: number
  stroke: string
  strokeWidth: number
  fill: string
}
