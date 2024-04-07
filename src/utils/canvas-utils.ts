import type { FabObjectWithId } from "../components/Slate/types"

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

export { uuidv4, ucFirst, findById }
