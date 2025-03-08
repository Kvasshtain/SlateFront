import type { FabObjectWithId } from "../components/Slate/types"
import { fabric } from "fabric"
import type { ICoordinates } from "../components/Slate/store/types"

function uuidv4(): string {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c: string) =>
    (
      +c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))
    ).toString(16),
  )
}

function ucFirst(str: string) {
  if (!str) return str

  return str[0].toUpperCase() + str.slice(1)
}

function findById(fabCanvas: fabric.Canvas, id: number) {
  return fabCanvas.getObjects().find((obj: fabric.Object): boolean => {
    let objWithId: FabObjectWithId = obj as FabObjectWithId

    if (objWithId === null) return false

    return objWithId.id === id
  })
}

function getPointCoordinatesInViewport(
  point: fabric.Point,
  canvas: fabric.Canvas,
): fabric.Point {
  if (!canvas.viewportTransform) return point
  const invertViewPortTransform = fabric.util.invertTransform(
    canvas.viewportTransform,
  )
  return fabric.util.transformPoint(point, invertViewPortTransform)
}

const setAllObjectsSelection = (canvas: fabric.Canvas, selectable: boolean) => {
  const allObjects = canvas.getObjects()

  allObjects.map((o) => {
    return (o.selectable = selectable)
  })
}

const xIndex = 4
const yIndex = 5

function ConvertPointIntoCanvasCoordinates(
  p: ICoordinates,
  zoom: number,
  canvas: fabric.Canvas,
): ICoordinates {
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
  p: ICoordinates,
  zoom: number,
  canvas: fabric.Canvas,
): ICoordinates {
  if (!canvas.viewportTransform) return { x: 0, y: 0 }
  if (!p.x || !p.y) return { x: 0, y: 0 }

  return {
    x: p.x * zoom + canvas.viewportTransform[xIndex],
    y: p.y * zoom + canvas.viewportTransform[yIndex],
  }
}

export {
  uuidv4,
  ucFirst,
  findById,
  getPointCoordinatesInViewport,
  setAllObjectsSelection,
  ConvertPointIntoCanvasCoordinates,
  ConvertPointIntoScreenCoordinates,
}
