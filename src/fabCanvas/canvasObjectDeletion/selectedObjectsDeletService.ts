import type { FabObjectWithId } from "../../components/Slate/types"

const deletSelectedActions = (
  canvas: fabric.Canvas,
  delFunc: (deletedFromCanvasObjectsIds: string[]) => void,
) => {
  if (!canvas) return

  if (canvas.getActiveObjects()) {
    const selectedObjects = canvas.getActiveObjects()

    delFunc(
      selectedObjects
        .filter((obj): obj is FabObjectWithId => "id" in obj)
        .map((obj) => obj.id),
    )
  }
}

const deleteObjectsFromCanvasByIds = (canvas: fabric.Canvas, ids: string[]) => {
  if (!canvas) return

  const objects = canvas.getObjects()

  const objWithId = objects.filter((obj): obj is FabObjectWithId => "id" in obj)

  const objLength = objWithId.length

  const idsLength = ids.length

  for (let i = 0; i < objLength; i++) {
    for (let j = 0; j < idsLength; j++) {
      if (objWithId[i].id === ids[j]) {
        canvas.remove(objWithId[i])
      }
    }
  }

  canvas.renderAll()
}

export { deletSelectedActions, deleteObjectsFromCanvasByIds }
