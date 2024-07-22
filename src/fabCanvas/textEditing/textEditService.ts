import { fabric } from "fabric"
import type { ICanvasState } from "../types"
import type { FabObjectWithId } from "../../components/Slate/types"
import type {
  IFontProperties,
  IScreenCoordinates,
} from "../../components/Slate/store/types"
import { deleteObjectsFromCanvasByIds } from "../canvasObjectDeletion/selectedObjectsDeletService"

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
    x: p.x / zoom + fabric.util.invertTransform(canvas.viewportTransform)[4],
    y: p.y / zoom + fabric.util.invertTransform(canvas.viewportTransform)[5],
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
    x: p.x * zoom + canvas.viewportTransform[4],
    y: p.y * zoom + canvas.viewportTransform[5],
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

function turnOnTextEditMode(
  canvas: fabric.Canvas,
  canvasState: ICanvasState,
  canvasClickCoordinatesSetter: (canvasClickPoint: IScreenCoordinates) => void,
  userInputFieldCoordinatesSetter: (
    screenClickPoint: IScreenCoordinates,
  ) => void,
  zoomCallbacksSet: Set<() => void>,
) {
  const mouseDownHandler = (e: fabric.IEvent<MouseEvent>) => {
    if (!e.pointer) return

    if (!isFirstClick) return
    isFirstClick = false

    const canvasClickPoint = ConvertPointIntoCanvasCoordinates(
      e.pointer,
      canvas.getZoom(),
      canvas,
    )

    userInputFieldCoordinatesSetter(e.pointer)
    canvasClickCoordinatesSetter(canvasClickPoint)

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

  canvas.add(fabText)
  canvas.renderAll()
}

export { turnOnTextEditMode, turnOffTextEditMode, addTextOnCanvas }
