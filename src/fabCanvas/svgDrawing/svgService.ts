import type { fabric } from "fabric"
import type { IBounds, ICanvasState } from "../types"
import {
  getPointCoordinatesInViewport,
  setAllObjectsSelection,
} from "../canvas-utils"
import {
  removeCanvasHandler,
  tryAddCanvasHandler,
} from "../canvasEvents/canvasEventsService"

const startSvgDrawingName = "StartSvgDrawing"
const svgDrawingInProgressName = "SvgDrawingInProgress"
const stopSvgDrawingName = "StopSvgDrawing"

function updateSvg(
  canvas: fabric.Canvas,
  pointer: fabric.Point | undefined,
  svg: fabric.Object,
  initialPos: fabric.Point,
  bounds: IBounds,
) {
  if (!initialPos.x) return
  if (!initialPos.y) return
  if (!pointer) return

  let transformedPointer = getPointCoordinatesInViewport(pointer, canvas)

  if (initialPos.x > transformedPointer.x) {
    bounds.left = transformedPointer.x
    bounds.width = initialPos.x - bounds.left
  } else {
    bounds.left = initialPos.x
    bounds.width = transformedPointer.x - initialPos.x
  }

  if (initialPos.y > transformedPointer.y) {
    bounds.top = transformedPointer.y
    bounds.height = initialPos.y - bounds.top
  } else {
    bounds.height = transformedPointer.y - initialPos.y
    bounds.top = initialPos.y
  }

  setObjProps(svg, bounds)

  svg.set({ dirty: true })
  canvas.renderAll()
}

const setObjProps = (obj: fabric.Object, bounds: IBounds) => {
  const originalWidth = obj?.width ?? 0
  const originalHeight = obj?.height ?? 0

  obj.set({ left: bounds.left })
  obj.set({ top: bounds.top })

  obj.set({ scaleX: bounds.width / originalWidth })
  obj.set({ scaleY: bounds.height / originalHeight })
}

function turnOnSvgDrawingMode(
  canvas: fabric.Canvas,
  canvasState: ICanvasState,
  svg: fabric.Object | null,
) {
  if (!svg) return

  let dragging: boolean

  let initialPos: fabric.Point

  let bounds: IBounds = {
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  }

  const mouseDownHandler = (e: fabric.IEvent<MouseEvent>) => {
    if (!e.pointer) return

    setAllObjectsSelection(canvas, false)

    dragging = true
    canvasState.isSendingBlocked = true

    initialPos = getPointCoordinatesInViewport(e.pointer, canvas)

    bounds = {
      left: initialPos.x,
      top: initialPos.y,
      width: 0.01,
      height: 0.01,
    }

    setObjProps(svg, bounds)

    svg.selectable = false

    canvas.add(svg)

    canvas.renderAll()
  }

  tryAddCanvasHandler(
    canvas,
    "mouse:down",
    startSvgDrawingName,
    mouseDownHandler,
  )

  const mouseMoveHandler = (e: fabric.IEvent<MouseEvent>) => {
    if (!dragging) {
      return
    }

    updateSvg(canvas, e.pointer, svg, initialPos, bounds)
  }

  tryAddCanvasHandler(
    canvas,
    "mouse:move",
    svgDrawingInProgressName,
    mouseMoveHandler,
  )

  const mouseUpHandler = (e: fabric.IEvent<MouseEvent>) => {
    dragging = false
    if (svg && (svg.width === 0 || svg.height === 0)) {
      canvas.remove(svg)
    }

    svg.setCoords()

    canvas.remove(svg)

    canvasState.isSendingBlocked = false

    canvas.add(svg)
  }

  tryAddCanvasHandler(canvas, "mouse:up", stopSvgDrawingName, mouseUpHandler)
}

function turnOffSvgDrawingMode() {
  removeCanvasHandler("mouse:down", startSvgDrawingName)
  removeCanvasHandler("mouse:move", svgDrawingInProgressName)
  removeCanvasHandler("mouse:up", stopSvgDrawingName)
}

export { turnOnSvgDrawingMode, turnOffSvgDrawingMode }
