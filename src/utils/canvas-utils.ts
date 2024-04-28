import type { MiddlewareAPI, UnknownAction } from "@reduxjs/toolkit"
import { Middleware } from "@reduxjs/toolkit"
import type { FabObjectWithId } from "../components/Slate/types"
import type { Dispatch } from "react"

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

// function setCanvasTextEditMode(canvas: fabric.Canvas, store: MiddlewareAPI<Dispatch<UnknownAction>, any>) {
//   canvas.on("mouse:down", (options: fabric.IEvent<MouseEvent>) => {
//     if (!options.e) return

//     const evt = options.e

//     store.dispatch(
//       setCanvasClickCoordinates({ x: evt.pageX, y: evt.pageY }),
//     )
//   })
// }

// function update(pointer: {x: number, y: number} ) {
//   if (initialPos.x > pointer.x) {
//     bounds.x = Math.max(0, pointer.x)
//     bounds.width = initialPos.x - bounds.x
//   } else {
//     bounds.x = initialPos.x
//     bounds.width = pointer.x - initialPos.x
//   }
//   if (initialPos.y > pointer.y) {
//     bounds.y = Math.max(0, pointer.y)
//     bounds.height = initialPos.y - bounds.y
//   } else {
//     bounds.height = pointer.y - initialPos.y
//     bounds.y = initialPos.y
//   }
//   if(options.drawRect){
//     rect.left = bounds.x
//     rect.top = bounds.y
//     rect.width = bounds.width
//     rect.height = bounds.height
//     rect.dirty = true
//     fabricCanvas.requestRenderAllBound()
//   }
// }

export { uuidv4, ucFirst, findById, removeCanvasMouseEvents }
