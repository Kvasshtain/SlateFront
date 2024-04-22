import type { TextAlign } from "csstype"
import type { fabric } from "fabric"

export interface ICanvasObject {
  id: string
  data: string
  left: number
  top: number
  scaleX: number
  scaleY: number
  angle: number
}

export interface IMovementData {
  id: string
  left: number
  top: number
}

export interface IScaleData {
  id: string
  left: number
  top: number
  scaleX: number
  scaleY: number
}

export interface IRotationData {
  id: string
  angle: number
}

export interface IObjectModificationData {
  method: string
  payload: any
}

export interface IBoardText {
  text: string | null
  coordinates: IScreenCoordinates | null
  style: IFontProperties | null
}

export interface IBoardPicture {
  file: File | null
  coordinates: IScreenCoordinates | null
}

export interface ISlateState {
  connectionState: string
  mainCanvas: fabric.Canvas | null
  editMode: EditMode

  currentAddedCanvasObject: ICanvasObject | null
  currentObjectMovementData: IMovementData | null
  currentObjectScaleData: IScaleData | null
  currentObjectRotationData: IRotationData | null

  sentBlackboarObjId: string | null
  addedBoardText: IBoardText | null
  addedBoardPicture: IBoardPicture | null
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
