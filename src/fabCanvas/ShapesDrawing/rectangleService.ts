import { fabric } from "fabric"
import type { IBounds, ICanvasState /*, IPosition*/ } from "../types"
import {
  getPointCoordinatesInViewport,
  //removeCanvasMouseEvents,
} from "../canvas-utils"

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

  //if (options.drawRect) {
  rect.set({ left: bounds.x })
  rect.set({ top: bounds.y })
  rect.set({ width: bounds.width })
  rect.set({ height: bounds.height })
  rect.set({ dirty: true })
  canvas.renderAll() // canvas.requestRenderAllBound() //!!!!!!!
  //}
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
    //drawRect: drawRect.checked,
    //onlyOne: onlyOne.checked,
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

    // if (!freeDrawing) {
    //   return
    // }

    initialPos = getPointCoordinatesInViewport(e.pointer, canvas)

    //initialPos.x = e.pointer.x
    //initialPos.y = e.pointer.y

    //if (options.drawRect) {
    rect = new fabric.Rect({
      left: initialPos.x,
      top: initialPos.y,
      width: 0.01,
      height: 0.01,
      ...options.rectProps,
    })
    canvas.add(rect)

    canvas.renderAll()
    //}
  })

  canvas.on("mouse:move", function (e) {
    if (!dragging /*|| !freeDrawing*/) {
      return
    }

    updateRect(canvas, e.pointer, rect, initialPos, bounds)
    // requestAnimationFrame(() =>
    //   updateRect(canvas, e.pointer, rect, initialPos, bounds),
    // )
  })

  canvas.on("mouse:up", function (o) {
    dragging = false
    // if (!freeDrawing) {
    //   return
    // }
    if (
      //options.drawRect &&
      rect &&
      (rect.width === 0 || rect.height === 0)
    ) {
      canvas.remove(rect)
    }
    if (/*!options.drawRect ||*/ !rect) {
      rect = new fabric.Rect({
        ...bounds,
        left: bounds.x,
        top: bounds.y,
        ...options.rectProps,
      })
      canvas.add(rect)
      rect.dirty = true
      canvas.renderAll() //canvas.requestRenderAllBound() //!!!!!!!
    }
    rect.setCoords() // important!
    //options.onlyOne && uninstall()

    canvas.remove(rect)

    canvasState.isSendingBlocked = false

    canvas.add(rect)
  })
}

// function turnOfRectDrawingMode(canvas: fabric.Canvas) {
//   removeCanvasMouseEvents(canvas)
// }

export { turnOnRectDrawingMode /*, turnOfRectDrawingMode*/ }
