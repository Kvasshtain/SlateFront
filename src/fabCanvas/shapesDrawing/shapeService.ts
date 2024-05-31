import { fabric } from "fabric"
import type { IBounds, ICanvasState, IShapeProps } from "../types"
import {
  getPointCoordinatesInViewport,
  setAllObjectsSelection,
} from "../canvas-utils"
import { DrawingShapeKind } from "../../components/Slate/store/types"

function updateShape(
  canvas: fabric.Canvas,
  pointer: fabric.Point | undefined,
  drawingShapeKind: DrawingShapeKind,
  shape: fabric.Object,
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

  shape.set({ left: bounds.x })
  shape.set({ top: bounds.y })

  if (drawingShapeKind === DrawingShapeKind.Ellipse) {
    let ellips = shape as fabric.Ellipse

    ellips.set({ rx: bounds.width / 2 })
    ellips.set({ ry: bounds.height / 2 })
  } else {
    shape.set({ width: bounds.width })
    shape.set({ height: bounds.height })
  }

  shape.set({ dirty: true })
  canvas.renderAll()
}

const createShape = (
  drawingShapeKind: DrawingShapeKind,
  shapeProps: IShapeProps,
): fabric.Object => {
  switch (drawingShapeKind) {
    case DrawingShapeKind.Rect:
      return new fabric.Rect({
        ...shapeProps,
      })
    case DrawingShapeKind.Ellipse:
      return new fabric.Ellipse({
        rx: shapeProps.width / 2,
        ry: shapeProps.height / 2,
        ...shapeProps,
      })
    case DrawingShapeKind.Triangle:
      return new fabric.Triangle({
        ...shapeProps,
      })
    case DrawingShapeKind.None:
      return new fabric.Text(
        "ERROR: drawingShapeKind = DrawingShapeKind.None!",
        { left: shapeProps.left, top: shapeProps.top },
      )
  }
}

function turnOnShapeDrawingMode(
  canvas: fabric.Canvas,
  drawingShapeKind: DrawingShapeKind,
  canvasState: ICanvasState,
) {
  let shape: fabric.Object
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
    shapeProps: {
      stroke: "red",
      strokeWidth: 1,
      fill: "",
    },
  }

  canvas.on("mouse:down", function (e: fabric.IEvent<MouseEvent>) {
    if (!e.pointer) return

    setAllObjectsSelection(canvas, false)

    dragging = true
    canvasState.isSendingBlocked = true

    initialPos = getPointCoordinatesInViewport(e.pointer, canvas)

    shape = createShape(drawingShapeKind, {
      left: initialPos.x,
      top: initialPos.y,
      width: 0.01,
      height: 0.01,
      ...options.shapeProps,
    })

    shape.selectable = false

    canvas.add(shape)

    canvas.renderAll()
  })

  canvas.on("mouse:move", function (e) {
    if (!dragging) {
      return
    }

    updateShape(canvas, e.pointer, drawingShapeKind, shape, initialPos, bounds)
  })

  canvas.on("mouse:up", function (o) {
    dragging = false
    if (shape && (shape.width === 0 || shape.height === 0)) {
      canvas.remove(shape)
    }
    if (!shape) {
      shape = createShape(drawingShapeKind, {
        ...bounds,
        left: bounds.x,
        top: bounds.y,
        ...options.shapeProps,
      })

      canvas.add(shape)
      shape.dirty = true
      canvas.renderAll()
    }
    shape.setCoords()

    canvas.remove(shape)

    canvasState.isSendingBlocked = false

    canvas.add(shape)

    //shape.selectable = true
  })
}

export { turnOnShapeDrawingMode }
