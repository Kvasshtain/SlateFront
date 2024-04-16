import type { TextAlign } from "csstype"

export interface ICanvasObject {
  id: string
  data: string
  left: number
  top: number
  scaleX: number
  scaleY: number
  angle: number
}

export interface IBoardText {
  text: string | null
  coordinates: IScreenCoordinates | null
  style: IFontProperties | null
}

export interface ISlateState {
  connectionState: string
  editMode: EditMode
  currentAddedCanvasObject: ICanvasObject | null
  sentBlackboarObjId: string | null
  addedBoardText: IBoardText | null
  canvasClickCoordinates: IScreenCoordinates | null
}

export enum EditMode {
  None,
  Text,
  //LineDrawing,
}

export interface IScreenCoordinates {
  x: number
  y: number
}

export interface IFontProperties {
  fontSize: string
  fontWeight: string
  color: string
  textDecoration: string
  shadow: string
  fontStyle: string
  fontFamily: string
  stroke: string
  strokeWidth: string
  textAlign: TextAlign | undefined
  lineHeight: number
  textBackgroundColor: string
}
