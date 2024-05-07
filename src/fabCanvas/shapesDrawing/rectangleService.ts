import { fabric } from "fabric"
import type { IBounds, ICanvasState } from "../types"
import { getPointCoordinatesInViewport } from "../canvas-utils"

function updateRect(
  canvas: fabric.Canvas,
  pointer: fabric.Point | undefined,
  rect: fabric.Rect,
  initialPos: fabric.Point,
  bounds: IBounds,
) {
  if (!initialPos.x) return
  if (!initialPos.y) return
  if (!pointer) return

  let transformedPointer = getPointCoordinatesInViewport(pointer, canvas)

  if (initialPos.x > transformedPointer.x) {
    bounds.x = transformedPointer.x
    bounds.width = initialPos.x - bounds.x
  } else {
    bounds.x = initialPos.x
    bounds.width = transformedPointer.x - initialPos.x
  }
  if (initialPos.y > transformedPointer.y) {
    bounds.y = transformedPointer.y
    bounds.height = initialPos.y - bounds.y
  } else {
    bounds.height = transformedPointer.y - initialPos.y
    bounds.y = initialPos.y
  }

  rect.set({ left: bounds.x })
  rect.set({ top: bounds.y })
  rect.set({ width: bounds.width })
  rect.set({ height: bounds.height })
  rect.set({ dirty: true })
  canvas.renderAll()
}

function turnOnRectDrawingMode(
  canvas: fabric.Canvas,
  canvasState: ICanvasState,
) {
  let rect: fabric.Rect
  let dragging: boolean

  let initialPos: fabric.Point

  let bounds: {
    x: number
    y: number
    width: number
    height: number
  } = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  }

  const options = {
    rectProps: {
      stroke: "red",
      strokeWidth: 1,
      fill: "",
    },
  }

  canvas.selection = false

  canvas.on("mouse:down", function (e: fabric.IEvent<MouseEvent>) {
    if (!e.pointer) return

    dragging = true
    canvasState.isSendingBlocked = true

    initialPos = getPointCoordinatesInViewport(e.pointer, canvas)

    rect = new fabric.Rect({
      left: initialPos.x,
      top: initialPos.y,
      width: 0.01,
      height: 0.01,
      ...options.rectProps,
    })
    canvas.add(rect)

    canvas.renderAll()
  })

  canvas.on("mouse:move", function (e) {
    if (!dragging) {
      return
    }

    updateRect(canvas, e.pointer, rect, initialPos, bounds)
  })

  canvas.on("mouse:up", function (o) {
    dragging = false
    if (rect && (rect.width === 0 || rect.height === 0)) {
      canvas.remove(rect)
    }
    if (!rect) {
      rect = new fabric.Rect({
        ...bounds,
        left: bounds.x,
        top: bounds.y,
        ...options.rectProps,
      })
      canvas.add(rect)
      rect.dirty = true
      canvas.renderAll()
    }
    rect.setCoords()

    canvas.remove(rect)

    canvasState.isSendingBlocked = false

    canvas.add(rect)
  })
}

export { turnOnRectDrawingMode }
