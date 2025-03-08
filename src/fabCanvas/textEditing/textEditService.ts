import { fabric } from "fabric"
import type { ICanvasState } from "../types"
import type { FabObjectWithId } from "../../components/Slate/types"
import type {
  ICanvasObject,
  IFontProperties,
  ICoordinates,
} from "../../components/Slate/store/types"
import { deleteObjectFromCanvasById } from "../canvasObjectDeletion/selectedObjectsDeletService"
import {
  removeCanvasHandler,
  tryAddCanvasHandler,
} from "../canvasEvents/canvasEventsService"
import {
  ConvertPointIntoCanvasCoordinates,
  ConvertPointIntoScreenCoordinates,
} from "../canvas-utils"

const textMouseDownName = "TextMouseDown"
const textDblClickName = "TextDblClick"
const textAddName = "textAdd"

const textEditMarker = "TextEditMarker"
const transparent = "rgba(0,0,0,0)"
let zoomCallback: () => void
let isFirstClick: boolean = true

function CreateTextEditMarkerShape(canvasClickPoint: ICoordinates) {
  return new fabric.Ellipse({
    left: canvasClickPoint.x,
    top: canvasClickPoint.y,
    rx: 1,
    ry: 1,
    stroke: transparent,
    strokeWidth: 1,
    fill: transparent,
    selectable: false,
  })
}

function initTextEditing(
  canvas: fabric.Canvas,
  canvasState: ICanvasState,
  eventPoint: ICoordinates,
  zoomCallbacksSet: Set<() => void>,
  text: string | null,
  textId: number | string | null,
  canvasClickCoordinatesSetter: (canvasClickPoint: ICoordinates) => void,
  userInputFieldCoordinatesSetter: (screenClickPoint: ICoordinates) => void,
  presetTextSetter: (presetText: string | null) => void,
  textIdSetter: (textId: number | string | null) => void,
) {
  const canvasClickPoint = ConvertPointIntoCanvasCoordinates(
    eventPoint,
    canvas.getZoom(),
    canvas,
  )

  userInputFieldCoordinatesSetter(eventPoint)
  canvasClickCoordinatesSetter(canvasClickPoint)
  presetTextSetter(text)
  textIdSetter(textId)

  canvasState.isSendingBlocked = true

  const addTextHandler = (e: fabric.IEvent<MouseEvent>) => {
    if (!canvasState.isSendingBlocked) return

    let target = e.target as FabObjectWithId

    if (target === undefined) return

    target.id = textEditMarker
  }

  tryAddCanvasHandler(canvas, "object:added", textAddName, addTextHandler)

  canvas.add(CreateTextEditMarkerShape(canvasClickPoint))

  canvas.renderAll()

  zoomCallback = () => {
    const marker = canvas.getObjects().find((obj) => {
      const objWithId = obj as FabObjectWithId
      return objWithId.id === textEditMarker
    })

    if (!marker?.top || !marker?.left) return

    const screenPoint = ConvertPointIntoScreenCoordinates(
      { x: marker.left, y: marker.top },
      canvas.getZoom(),
      canvas,
    )

    userInputFieldCoordinatesSetter(screenPoint)
    canvasClickCoordinatesSetter({ x: marker.left, y: marker.top })
  }

  zoomCallbacksSet.add(zoomCallback)

  canvasState.isSendingBlocked = false
}

function initTextDblClickEditing(
  canvas: fabric.Canvas,
  canvasState: ICanvasState,
  textEditModeSetter: () => void,
  canvasClickCoordinatesSetter: (canvasClickPoint: ICoordinates) => void,
  userInputFieldCoordinatesSetter: (screenClickPoint: ICoordinates) => void,
  presetTextSetter: (presetText: string | null) => void,
  textIdSetter: (textId: number | string | null) => void,
  zoomCallbacksSet: Set<() => void>,
) {
  const mouseDblclickHandler = (e: fabric.IEvent<MouseEvent>) => {
    const target = e.target

    if (target?.type !== "text") return

    if (!isFirstClick) return
    isFirstClick = false

    textEditModeSetter()

    initTextEditing(
      canvas,
      canvasState,
      { x: target.left, y: target.top },
      zoomCallbacksSet,
      (target as fabric.Text).text ?? "",
      (target as FabObjectWithId).id,
      canvasClickCoordinatesSetter,
      userInputFieldCoordinatesSetter,
      presetTextSetter,
      textIdSetter,
    )
  }

  tryAddCanvasHandler(
    canvas,
    "mouse:dblclick",
    textDblClickName,
    mouseDblclickHandler,
  )
}

function turnOnTextEditMode(
  canvas: fabric.Canvas,
  canvasState: ICanvasState,
  canvasClickCoordinatesSetter: (canvasClickPoint: ICoordinates) => void,
  userInputFieldCoordinatesSetter: (screenClickPoint: ICoordinates) => void,
  presetTextSetter: (presetText: string | null) => void,
  textIdSetter: (textId: number | string | null) => void,
  zoomCallbacksSet: Set<() => void>,
) {
  const mouseDownHandler = (e: fabric.IEvent<MouseEvent>) => {
    if (!e.pointer) return

    if (!isFirstClick) return
    isFirstClick = false

    initTextEditing(
      canvas,
      canvasState,
      e.pointer,
      zoomCallbacksSet,
      "",
      null,
      canvasClickCoordinatesSetter,
      userInputFieldCoordinatesSetter,
      presetTextSetter,
      textIdSetter,
    )
  }

  tryAddCanvasHandler(canvas, "mouse:down", textMouseDownName, mouseDownHandler)
}

function turnOffTextEditMode(canvas: fabric.Canvas) {
  deleteObjectFromCanvasById(canvas, textEditMarker)

  removeCanvasHandler("mouse:down", textMouseDownName)
  removeCanvasHandler("object:added", textAddName)

  isFirstClick = true
}

function addTextOnCanvas(
  canvas: fabric.Canvas,
  blackboardId: number,
  boardText: any,
  zoomCallbacksSet: Set<() => void>,
  userInputFieldCoordinatesSetter: (x: number | null, y: number | null) => void,
  textDeleter: (id: string) => void,
  textDataSender: (canvasObject: ICanvasObject) => void,
) {
  zoomCallbacksSet.delete(zoomCallback)

  deleteObjectFromCanvasById(canvas, textEditMarker)

  isFirstClick = true

  userInputFieldCoordinatesSetter(null, null)

  const text: string = boardText?.text

  if (!text) return

  const coordinates: ICoordinates = boardText?.coordinates

  if (!coordinates) return

  const style: IFontProperties = boardText?.style

  if (!style) return

  var fabText = new fabric.Text(text, {
    left: coordinates.x,
    top: coordinates.y,
    fill: style.color,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    shadow: style.shadow,
    fontStyle: style.fontStyle as
      | ""
      | "normal"
      | "italic"
      | "oblique"
      | undefined,
    fontFamily: style.fontFamily,
    stroke: style.stroke,
    strokeWidth: +style.strokeWidth,
    textAlign: style.textAlign,
    lineHeight: +style.lineHeight,
    textBackgroundColor: style.textBackgroundColor,
  })

  const editedTextIdStr: string = boardText?.editedTextId

  if (!editedTextIdStr) {
    canvas.add(fabText)
    canvas.renderAll()
    return
  }

  const editedTextId: number = Number(editedTextIdStr)

  if (!Number.isInteger(editedTextId)) {
    return
  }

  textDeleter(editedTextIdStr)

  textDataSender({
    id: editedTextId,
    data: JSON.stringify(fabText),
    left: fabText.left ?? 0,
    top: fabText.top ?? 0,
    scaleX: fabText.scaleX ?? 0,
    scaleY: fabText.scaleY ?? 0,
    skewX: fabText.skewX ?? 0,
    skewY: fabText.skewY ?? 0,
    angle: fabText.angle ?? 0,
    blackboardId: blackboardId,
  })
}

export {
  initTextDblClickEditing,
  turnOnTextEditMode,
  turnOffTextEditMode,
  addTextOnCanvas,
}
