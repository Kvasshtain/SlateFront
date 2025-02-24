import { fabric } from "fabric"
import type { IBounds, ICanvasState, IShapeProps } from "../types"
import {
  getPointCoordinatesInViewport,
  setAllObjectsSelection,
} from "../canvas-utils"
import { DrawingShapeKind } from "../../components/Slate/store/types"
import {
  removeCanvasHandler,
  tryAddCanvasHandler,
} from "../canvasEvents/canvasEventsService"

const startShapeDrawingName = "StartShapeDrawing"
const shapeDrawingInProgressName = "ShapeDrawingInProgress"
const stopShapeDrawingName = "StopShapeDrawing"

// const ukFlagSvgStr: string =
//   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 30" width="1000" height="600">
//     <clipPath id="t">
//       <path d="M25,15h25v15zv15h-25zh-25v-15zv-15h25z"/>
//     </clipPath>
//     <path d="M0,0v30h50v-30z" fill="#012169"/>
//     <path d="M0,0 50,30M50,0 0,30" stroke="#fff" stroke-width="6"/>
//     <path d="M0,0 50,30M50,0 0,30" clip-path="url(#t)" stroke="#C8102E" stroke-width="4"/>
//     <path d="M-1 11h22v-12h8v12h22v8h-22v12h-8v-12h-22z" fill="#C8102E" stroke="#FFF" stroke-width="2"/>
//   </svg>`

// let ukFlagObj: fabric.Object | null = null

// fabric.loadSVGFromString(
//   ukFlagSvgStr,
//   function(objects, options) {
//     ukFlagObj = fabric.util.groupSVGElements(objects, options);
//     //canvas.add(svgObj).renderAll();
//   }
// )

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

  shape.set({ left: bounds.left })
  shape.set({ top: bounds.top })

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
  borderColor: string,
  mainColor: string,
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
      stroke: borderColor,
      strokeWidth: 1,
      fill: mainColor,
    },
  }

  const mouseDownHandler = (e: fabric.IEvent<MouseEvent>) => {
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
  }

  tryAddCanvasHandler(
    canvas,
    "mouse:down",
    startShapeDrawingName,
    mouseDownHandler,
  )

  const mouseMoveHandler = (e: fabric.IEvent<MouseEvent>) => {
    if (!dragging) {
      return
    }

    updateShape(canvas, e.pointer, drawingShapeKind, shape, initialPos, bounds)
  }

  tryAddCanvasHandler(
    canvas,
    "mouse:move",
    shapeDrawingInProgressName,
    mouseMoveHandler,
  )

  const mouseUpHandler = (e: fabric.IEvent<MouseEvent>) => {
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
  }

  tryAddCanvasHandler(canvas, "mouse:up", stopShapeDrawingName, mouseUpHandler)
}

function turnOffShapeDrawingMode() {
  removeCanvasHandler("mouse:down", startShapeDrawingName)
  removeCanvasHandler("mouse:move", shapeDrawingInProgressName)
  removeCanvasHandler("mouse:up", stopShapeDrawingName)
}

export { turnOnShapeDrawingMode, turnOffShapeDrawingMode }
