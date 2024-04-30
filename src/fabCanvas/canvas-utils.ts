import type { MiddlewareAPI, UnknownAction } from "@reduxjs/toolkit"
import { Middleware } from "@reduxjs/toolkit"
import type { FabObjectWithId } from "../components/Slate/types"
import type { Dispatch } from "react"
import { fabric } from "fabric"

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

function findById(fabCanvas: fabric.Canvas, id: string) {
  return fabCanvas.getObjects().find((obj: fabric.Object): boolean => {
    let objWithId: FabObjectWithId = obj as FabObjectWithId

    if (objWithId === null) return false

    return objWithId.id === id
  })
}

function removeCanvasMouseEvents(canvas: fabric.Canvas) {
  canvas.off("mouse:down")
  canvas.off("mouse:up")
  canvas.off("mouse:move")
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

export {
  uuidv4,
  ucFirst,
  findById,
  removeCanvasMouseEvents,
  getPointCoordinatesInViewport,
}
