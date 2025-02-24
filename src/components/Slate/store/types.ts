import type { Property } from "csstype"
import type { fabric } from "fabric"
import type { HubConnection } from "redux-signalr"

export interface ICursorData {
  userName: string
  left: number
  top: number
  blackboardId: number
}

export interface ICanvasObject {
  id: number
  data: string
  left: number
  top: number
  scaleX: number
  scaleY: number
  skewX: number
  skewY: number
  angle: number
  blackboardId: number
}

export interface IMovementData {
  id: number
  left: number
  top: number
}

export interface IScaleData {
  id: number
  left: number
  top: number
  scaleX: number
  scaleY: number
  skewX: number
  skewY: number
}

export interface IRotationData {
  id: number
  angle: number
}

export interface IObjectPropertyData {
  id: number
  left: number
  top: number
  angle: number
  scaleX: number
  scaleY: number
  skewX: number
  skewY: number
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

  isUserAuthenticated: boolean
  userId: string | null
  userName: string | null
  userEmail: string | null
  userPassword: string | null
  newUserName: string | null
  newUserEmail: string | null
  newUserPassword: string | null

  activeBlackboardId: string | null
  activeBlackboardName: string | null

  mainCanvas: fabric.Canvas | null
  hubConnection: HubConnection | null
  editMode: EditMode
  drawingShapeKind: DrawingShapeKind
  currentBorderColor: string
  currentMainColor: string
  currentCanvasZoom: number

  otherUserCursorData: ICursorData | null
  currentAddedCanvasObject: ICanvasObject | null
  currentDeletedCanvasObjectsIds: string[] | null
  currentObjectMovementData: IMovementData | null
  currentObjectScaleData: IScaleData | null
  currentObjectRotationData: IRotationData | null

  sentBlackboarObjId: string | null
  deletedFromCanvasObjectsIds: string[] | null
  addedBoardText: IBoardText | null
  addedBoardPicture: IBoardPicture | null
  canvasClickCoordinates: IScreenCoordinates | null
  userInputFieldCoordinates: IScreenCoordinates | null
  presetText: string
  editedTextId: string | null
}

export enum EditMode {
  None,
  Shape,
  Svg,
  Text,
  LineDrawing,
}

export enum DrawingShapeKind {
  None,
  Rect,
  Ellipse,
  Triangle,
}

export interface IScreenCoordinates {
  x: number | undefined
  y: number | undefined
}

export interface IFontProperties {
  fontSize: number
  fontWeight: string
  color: string
  textDecoration: string
  shadow: string
  fontStyle: string
  fontFamily: string
  stroke: string
  strokeWidth: string
  textAlign: Property.TextAlign | undefined
  lineHeight: number
  textBackgroundColor: string
}
