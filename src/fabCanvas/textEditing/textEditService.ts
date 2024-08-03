import { fabric } from "fabric"
import type { ICanvasState } from "../types"
import type { FabObjectWithId } from "../../components/Slate/types"
import type {
  ICanvasObject,
  IFontProperties,
  IScreenCoordinates,
} from "../../components/Slate/store/types"
import { deleteObjectsFromCanvasByIds } from "../canvasObjectDeletion/selectedObjectsDeletService"
import { tryAddCanvasHandler } from "../canvasEvents/canvasEventsService"

const xIndex = 4
const yIndex = 5
const textEditMarker = "TextEditMarker"
const transparent = "rgba(0,0,0,0)"
let zoomCallback: () => void
let isFirstClick: boolean = true

function ConvertPointIntoCanvasCoordinates(
  p: IScreenCoordinates,
  zoom: number,
  canvas: fabric.Canvas,
): IScreenCoordinates {
  if (!canvas.viewportTransform) return { x: 0, y: 0 }
  if (!p.x || !p.y) return { x: 0, y: 0 }

  return {
    x:
      p.x / zoom +
      fabric.util.invertTransform(canvas.viewportTransform)[xIndex],
    y:
      p.y / zoom +
      fabric.util.invertTransform(canvas.viewportTransform)[yIndex],
  }
}

function ConvertPointIntoScreenCoordinates(
  p: IScreenCoordinates,
  zoom: number,
  canvas: fabric.Canvas,
): IScreenCoordinates {
  if (!canvas.viewportTransform) return { x: 0, y: 0 }
  if (!p.x || !p.y) return { x: 0, y: 0 }

  return {
    x: p.x * zoom + canvas.viewportTransform[xIndex],
    y: p.y * zoom + canvas.viewportTransform[yIndex],
  }
}

function CreateTextEditMarkerShape(canvasClickPoint: IScreenCoordinates) {
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
  eventPoint: IScreenCoordinates,
  zoomCallbacksSet: Set<() => void>,
  text: string | null,
  textId: string | null,
  canvasClickCoordinatesSetter: (canvasClickPoint: IScreenCoordinates) => void,
  userInputFieldCoordinatesSetter: (
    screenClickPoint: IScreenCoordinates,
  ) => void,
  presetTextSetter: (presetText: string | null) => void,
  textIdSetter: (textId: string | null) => void,
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

  canvas.on("object:added", (evt) => {
    if (!canvasState.isSendingBlocked) return

    let target = evt.target as FabObjectWithId

    if (target === undefined) return

    target.id = textEditMarker
  })

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
  canvasClickCoordinatesSetter: (canvasClickPoint: IScreenCoordinates) => void,
  userInputFieldCoordinatesSetter: (
    screenClickPoint: IScreenCoordinates,
  ) => void,
  presetTextSetter: (presetText: string | null) => void,
  textIdSetter: (textId: string | null) => void,
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
    "TextDblClick",
    mouseDblclickHandler,
  )
  //canvas?.on("mouse:dblclick", mouseDblclickHandler)
}

function turnOnTextEditMode(
  canvas: fabric.Canvas,
  canvasState: ICanvasState,
  canvasClickCoordinatesSetter: (canvasClickPoint: IScreenCoordinates) => void,
  userInputFieldCoordinatesSetter: (
    screenClickPoint: IScreenCoordinates,
  ) => void,
  presetTextSetter: (presetText: string | null) => void,
  textIdSetter: (textId: string | null) => void,
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

  canvas.on("mouse:down", mouseDownHandler)
}

function turnOffTextEditMode(canvas: fabric.Canvas) {
  deleteObjectsFromCanvasByIds(canvas, [textEditMarker])
}

function addTextOnCanvas(
  canvas: fabric.Canvas,
  boardText: any,
  zoomCallbacksSet: Set<() => void>,
  userInputFieldCoordinatesSetter: (x: number | null, y: number | null) => void,
  textDeleter: (id: string) => void,
  textDataSender: (canvasObject: ICanvasObject) => void,
) {
  zoomCallbacksSet.delete(zoomCallback)

  deleteObjectsFromCanvasByIds(canvas, [textEditMarker])

  isFirstClick = true

  userInputFieldCoordinatesSetter(null, null)

  const text: string = boardText?.text

  if (!text) return

  const coordinates: IScreenCoordinates = boardText?.coordinates

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

  const editedTextId: string = boardText?.editedTextId

  if (!editedTextId) {
    canvas.add(fabText)
    canvas.renderAll()
    return
  }

  textDeleter(editedTextId)

  textDataSender({
    id: editedTextId,
    data: JSON.stringify(fabText),
    left: fabText.left ?? 0,
    top: fabText.top ?? 0,
    scaleX: fabText.scaleX ?? 0,
    scaleY: fabText.scaleY ?? 0,
    angle: fabText.angle ?? 0,
  })
}

export {
  initTextDblClickEditing,
  turnOnTextEditMode,
  turnOffTextEditMode,
  addTextOnCanvas,
}
