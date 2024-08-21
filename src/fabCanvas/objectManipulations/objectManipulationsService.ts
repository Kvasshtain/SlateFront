import { fabric } from "fabric"
import { findById, ucFirst, uuidv4 } from "../canvas-utils"
import type { FabObjectWithId } from "../../components/Slate/types"
import type {
  ICanvasObject,
  IMovementData,
  IObjectModificationData,
  IRotationData,
  IScaleData,
} from "../../components/Slate/store/types"
import type { ICanvasState } from "../types"
import { tryAddCanvasHandler } from "../canvasEvents/canvasEventsService"

const addNewObjectName = "addNewObject"

function initCanvasManipulation(
  canvas: fabric.Canvas,
  canvasState: ICanvasState,
  addObjectHandler: (canvasObject: ICanvasObject) => void,
  modifyObjectHandler: (
    objectModificationData: IObjectModificationData,
  ) => void,
) {
  if (!canvas) return

  const addNewObjectHandler = (e: fabric.IEvent<MouseEvent>) => {
    if (canvasState.isSendingBlocked) return

    let target = e.target as FabObjectWithId

    if (target === undefined) return

    if (target.id) return

    canvas.remove(target)

    const blackboardObj: ICanvasObject = {
      id: uuidv4(),
      data: JSON.stringify(target),
      left: target.left ?? 0,
      top: target.top ?? 0,
      scaleX: target.scaleX ?? 0,
      scaleY: target.scaleY ?? 0,
      angle: target.angle ?? 0,
    }

    addObjectHandler(blackboardObj)
  }

  tryAddCanvasHandler(
    canvas,
    "object:added",
    addNewObjectName,
    addNewObjectHandler,
  )

  canvas.on("object:modified", (evt) => {
    if (canvasState.isSendingBlocked) return

    const action = evt.action as string

    if (!action) return

    let method = ucFirst(action)

    const modifiedObject = evt.target as FabObjectWithId

    if (!modifiedObject) return

    const id = modifiedObject.get("id")
    const left = modifiedObject.get("left")
    const top = modifiedObject.get("top")
    const scaleX = modifiedObject.get("scaleX")
    const scaleY = modifiedObject.get("scaleY")
    const angle = modifiedObject.get("angle")

    let payload

    switch (method) {
      case "Drag":
        payload = {
          Id: id,
          Left: left,
          Top: top,
        }
        break
      case "Scale":
      case "ScaleX":
      case "ScaleY":
        method = "Scale"
        payload = {
          Id: id,
          Left: left,
          Top: top,
          ScaleX: scaleX,
          ScaleY: scaleY,
        }
        break
      case "Rotate":
        payload = {
          Id: id,
          Angle: angle,
        }
        break
      default:
        return
    }

    const objectModificationData: IObjectModificationData = {
      method: method,
      payload: payload,
    }

    modifyObjectHandler(objectModificationData)
  })
}

const addObjectOnCanvas = (
  canvas: fabric.Canvas,
  currentAddedCanvasObject: ICanvasObject,
) => {
  if (!canvas) return
  if (!currentAddedCanvasObject) return

  const enlivenObjectsCallback = (objects: any[]) => {
    var origRenderOnAddRemove = canvas.renderOnAddRemove
    canvas.renderOnAddRemove = false

    let { data, ...enlivData } = currentAddedCanvasObject

    objects.forEach(function (o: any) {
      o.set({
        ...enlivData,
      })

      canvas.add(o)
    })

    canvas.renderOnAddRemove = origRenderOnAddRemove
    canvas.renderAll()
  }

  fabric.util.enlivenObjects(
    [JSON.parse(currentAddedCanvasObject.data)],
    enlivenObjectsCallback,
    "",
  )

  canvas.renderAll()
}

const moveObjectOnCanvas = (
  canvas: fabric.Canvas,
  movementData: IMovementData,
) => {
  if (!canvas) return
  if (!movementData) return

  let obj = findById(canvas, movementData.id)

  if (!obj) return

  obj.set({
    left: movementData.left,
    top: movementData.top,
  })

  canvas.renderAll()
}

const scaleObjectOnCanvas = (canvas: fabric.Canvas, scaleData: IScaleData) => {
  if (!canvas) return
  if (!scaleData) return

  let obj = findById(canvas, scaleData.id)

  if (!obj) return

  obj.set({
    left: scaleData.left,
    top: scaleData.top,
    scaleX: scaleData.scaleX,
    scaleY: scaleData.scaleY,
  })

  canvas.renderAll()
}

const rotateObjectOnCanvas = (
  canvas: fabric.Canvas,
  rotationData: IRotationData,
) => {
  if (!canvas) return
  if (!rotationData) return

  let obj = findById(canvas, rotationData.id)

  if (!obj) return

  obj.set({
    angle: rotationData.angle,
  })

  canvas.renderAll()
}

export {
  initCanvasManipulation,
  addObjectOnCanvas,
  moveObjectOnCanvas,
  scaleObjectOnCanvas,
  rotateObjectOnCanvas,
}
