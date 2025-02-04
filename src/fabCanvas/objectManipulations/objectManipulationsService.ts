import { fabric } from "fabric"
import { findById, ucFirst, uuidv4 } from "../canvas-utils"
import type { FabObjectWithId } from "../../components/Slate/types"
import type {
  ICanvasObject,
  IMovementData,
  IObjectModificationData,
  IRotationAndMovementData,
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
        angle: number | undefined,
      ]
    | null,
  modifyObjectHandler: (
    objectModificationData: IObjectModificationData,
  ) => void,
) {
  if (!modifiedObject) return
  if (!objProps) return

  const [left, top, scaleX, scaleY, angle] = objProps

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
      }
      break
    case "Rotate":
      payload = {
        Id: id,
        Angle: angle,
      }
      break
    case "RotateAndDrag":
      payload = {
        Id: id,
        Left: left,
        Top: top,
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
}

function getObjectFinalPropertiesInGroup(
  modifiedObject: FabObjectWithId,
  activeSelection: fabric.ActiveSelection,
):
  | [left: number, top: number, scaleX: number, scaleY: number, angle: number]
  | null {
  if (!modifiedObject) return null

  const modifiedObjectLeft = modifiedObject.left
  const modifiedObjectTop = modifiedObject.top

  if (modifiedObjectLeft === undefined || modifiedObjectTop === undefined)
    return null

  const activeSelectionAngle = activeSelection.angle
  const modifiedObjectAngle = modifiedObject.angle

  if (activeSelectionAngle === undefined || modifiedObjectAngle === undefined)
    return null

  const modifiedObjectScaleX = modifiedObject.scaleX
  const activeSelectionScaleX = activeSelection.scaleX

  if (modifiedObjectScaleX === undefined || activeSelectionScaleX === undefined)
    return null

  const modifiedObjectScaleY = modifiedObject.scaleY
  const activeSelectionScaleY = activeSelection.scaleY

  if (modifiedObjectScaleY === undefined || activeSelectionScaleY === undefined)
    return null

  const matrix = activeSelection.calcTransformMatrix()

  const finalPosition = fabric.util.transformPoint(
    new fabric.Point(modifiedObjectLeft, modifiedObjectTop),
    matrix,
  )

  const scaleX = calcDimensionScale(modifiedObjectScaleX, activeSelectionScaleX)
  const scaleY = calcDimensionScale(modifiedObjectScaleY, activeSelectionScaleY)

  const angle = modifiedObjectAngle + activeSelectionAngle

  // const x = modifiedObjectLeft
  // const y = modifiedObjectTop

  // const newX = x * Math.cos(degToRad(activeSelectionAngle)) - y * Math.sin(degToRad(activeSelectionAngle))
  // const newY = x * Math.sin(degToRad(activeSelectionAngle)) + y * Math.cos(degToRad(activeSelectionAngle))

  // const newLeft = activeSelection.getCenterPoint().x + newX
  // const newTop = activeSelection.getCenterPoint().y + newY

  //return [newLeft, newTop, scaleX, scaleY, angle]
  return [finalPosition.x, finalPosition.y, scaleX, scaleY, angle]
}

// const degToRad = (deg: number): number => {
//   return deg * (Math.PI / 180.0)
// }

const calcDimensionScale = (
  modifiedObjectScale: number,
  activeSelectionScale: number,
): number => {
  return activeSelectionScale * modifiedObjectScale
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
    // в старой версии fabric js было fabric.IEvent<MouseEvent>
    if (canvasState.isSendingBlocked) return

    let target = e.target as FabObjectWithId

    if (target === undefined) return

    if (target.id) return

    canvas.remove(target)

    const blackboardObj: ICanvasObject = {
      id: defaultId, //uuidv4(),
      data: JSON.stringify(target),
      left: target.left ?? 0,
      top: target.top ?? 0,
      scaleX: target.scaleX ?? 0,
      scaleY: target.scaleY ?? 0,
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

    const activeSelection = evt.target as fabric.ActiveSelection

    if (activeSelection._objects) {
      const modifiedObjects = activeSelection._objects

      modifiedObjects.forEach((object) => {
        const modifiedObject = object as FabObjectWithId

        const finalPositionAndScale = getObjectFinalPropertiesInGroup(
          modifiedObject,
          activeSelection,
        )

        method = method === "Rotate" ? "RotateAndDrag" : method

        applyCanvasManipulation(
          modifiedObject,
          method,
          finalPositionAndScale,
          modifyObjectHandler,
        )
      })

      return
    }

    const modifiedObject = evt.target as FabObjectWithId

    if (!modifiedObject) return
    const left = modifiedObject.get("left")
    const top = modifiedObject.get("top")
    const scaleX = modifiedObject.get("scaleX")
    const scaleY = modifiedObject.get("scaleY")

    applyCanvasManipulation(
      modifiedObject,
      method,
      [
        modifiedObject.left,
        modifiedObject.top,
        modifiedObject.scaleX,
        modifiedObject.scaleY,
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

  // obj.set({
  //   angle: rotationData.angle,
  // })

  canvas.renderAll()
}

const rotateAndMoveObjectOnCanvas = (
  canvas: fabric.Canvas,
  rotationAndMovementData: IRotationAndMovementData,
) => {
  if (!canvas) return
  if (!rotationAndMovementData) return

  let obj = findById(canvas, rotationAndMovementData.id)

  if (!obj) return

  obj.set({
    left: rotationAndMovementData.left,
    top: rotationAndMovementData.top,
  })

  obj.set({
    angle: rotationAndMovementData.angle,
  })

  canvas.renderAll()
}

export {
  initCanvasManipulation,
  addObjectOnCanvas,
  moveObjectOnCanvas,
  scaleObjectOnCanvas,
  rotateObjectOnCanvas,
  rotateAndMoveObjectOnCanvas,
}
