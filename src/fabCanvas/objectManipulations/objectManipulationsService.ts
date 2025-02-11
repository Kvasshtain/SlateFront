import { fabric } from "fabric"
import { findById, ucFirst, uuidv4 } from "../canvas-utils"
import type { FabObjectWithId } from "../../components/Slate/types"
import type {
  ICanvasObject,
  IMovementData,
  IObjectModificationData,
  IObjectPropertyData,
  IRotationData,
  IScaleData,
} from "../../components/Slate/store/types"
import type { ICanvasState } from "../types"
import { tryAddCanvasHandler } from "../canvasEvents/canvasEventsService"

const addNewObjectName = "addNewObject"
const defaultId = 0

function applyCanvasManipulation(
  modifiedObject: FabObjectWithId,
  method: string,
  objProps:
    | [
        left: number | undefined,
        top: number | undefined,
        scaleX: number | undefined,
        scaleY: number | undefined,
        skewX: number | undefined,
        skewY: number | undefined,
        angle: number | undefined,
      ]
    | null,
  modifyObjectHandler: (
    objectModificationData: IObjectModificationData,
  ) => void,
) {
  if (!modifiedObject) return
  if (!objProps) return

  const [left, top, scaleX, scaleY, skewX, skewY, angle] = objProps

  const id = modifiedObject.get("id")

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
        SkewX: skewX,
        SkewY: skewY,
      }
      break
    case "Rotate":
      payload = {
        Id: id,
        Angle: angle,
      }
      break
    case "Change":
      payload = {
        Id: id,
        Left: left,
        Top: top,
        Angle: angle,
        ScaleX: scaleX,
        ScaleY: scaleY,
        SkewX: skewX,
        SkewY: skewY,
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
}

function getObjectFinalPropertiesInGroup(
  modifiedObject: FabObjectWithId,
): [
  left: number | undefined,
  top: number | undefined,
  scaleX: number | undefined,
  scaleY: number | undefined,
  skewX: number | undefined,
  skewY: number | undefined,
  angle: number | undefined,
] {
  const canvas = modifiedObject.canvas

  const id = parseInt(modifiedObject.id.toString(), 10)

  let obj = canvas ? findById(canvas, id) : null

  return [
    obj?.left,
    obj?.top,
    obj?.scaleX,
    obj?.scaleY,
    obj?.skewX,
    obj?.skewY,
    obj?.angle,
  ]
}

function initCanvasManipulation(
  canvas: fabric.Canvas,
  blackboardId: number,
  canvasState: ICanvasState,
  addObjectHandler: (canvasObject: ICanvasObject) => void,
  modifyObjectHandler: (
    objectModificationData: IObjectModificationData,
  ) => void,
) {
  if (!canvas) return

  const addNewObjectHandler = (e: any) => {
    if (canvasState.isSendingBlocked) return

    let target = e.target as FabObjectWithId

    if (target === undefined) return

    if (target.id) return

    canvas.remove(target)

    const blackboardObj: ICanvasObject = {
      id: defaultId,
      data: JSON.stringify(target),
      left: target.left ?? 0,
      top: target.top ?? 0,
      scaleX: target.scaleX ?? 0,
      scaleY: target.scaleY ?? 0,
      skewX: target.skewX ?? 0,
      skewY: target.skewY ?? 0,
      angle: target.angle ?? 0,
      blackboardId: blackboardId,
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

    let activeSelection = evt.target as fabric.ActiveSelection

    if (activeSelection._objects) {
      const modifiedObjects = activeSelection._objects

      const objects = activeSelection.getObjects()
      canvas.discardActiveObject().renderAll()

      modifiedObjects.forEach((object) => {
        const modifiedObject = object as FabObjectWithId

        const finalObjectProperties =
          getObjectFinalPropertiesInGroup(modifiedObject)

        applyCanvasManipulation(
          modifiedObject,
          "Change",
          finalObjectProperties,
          modifyObjectHandler,
        )
      })

      activeSelection = new fabric.ActiveSelection(objects, { canvas: canvas })
      canvas.setActiveObject(activeSelection)
      canvas.requestRenderAll()

      return
    }

    const modifiedObject = evt.target as FabObjectWithId

    if (!modifiedObject) return

    applyCanvasManipulation(
      modifiedObject,
      method,
      [
        modifiedObject.left,
        modifiedObject.top,
        modifiedObject.scaleX,
        modifiedObject.scaleY,
        modifiedObject.skewX,
        modifiedObject.skewY,
        modifiedObject.angle,
      ],
      modifyObjectHandler,
    )
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
    skewX: scaleData.skewX,
    skewY: scaleData.skewY,
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

  obj.rotate(rotationData.angle)

  canvas.renderAll()
}

const changeObjectOnCanvas = (
  canvas: fabric.Canvas,
  objectPropertyData: IObjectPropertyData,
) => {
  if (!canvas) return
  if (!objectPropertyData) return

  let obj = findById(canvas, objectPropertyData.id)

  if (!obj) return

  obj.set({
    angle: objectPropertyData.angle,
    left: objectPropertyData.left,
    top: objectPropertyData.top,
    scaleX: objectPropertyData.scaleX,
    scaleY: objectPropertyData.scaleY,
    skewX: objectPropertyData.skewX,
    skewY: objectPropertyData.skewY,
  })

  obj.set({})

  canvas.renderAll()
}

export {
  initCanvasManipulation,
  addObjectOnCanvas,
  moveObjectOnCanvas,
  scaleObjectOnCanvas,
  rotateObjectOnCanvas,
  changeObjectOnCanvas,
}
