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
const defaultId = 0

function applyCanvasManipulation(
  modifiedObject: FabObjectWithId,
  method: string,
  position: [
    left: number | null | undefined,
    top: number | null | undefined,
    scaleX: number | null | undefined,
    scaleY: number | null | undefined,
  ],
  modifyObjectHandler: (
    objectModificationData: IObjectModificationData,
  ) => void,
) {
  if (!modifiedObject) return

  const [left, top, scaleX, scaleY] = position

  if (!left) return
  if (!top) return

  const id = modifiedObject.get("id")
  // const scaleX = modifiedObject.get("scaleX")
  // const scaleY = modifiedObject.get("scaleY")
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
}

function getObjectFinalPositionAndScaleInGroup(
  modifiedObject: FabObjectWithId,
  activeSelection: fabric.ActiveSelection,
): [
  left: number | null | undefined,
  top: number | null | undefined,
  scaleX: number | null | undefined,
  scaleY: number | null | undefined,
] {
  if (!modifiedObject) return [null, null, null, null]

  const matrix = activeSelection.calcTransformMatrix()

  let left = modifiedObject.get("left")
  let top = modifiedObject.get("top")

  if (!left) return [null, null, null, null]
  if (!top) return [null, null, null, null]

  const finalPosition = fabric.util.transformPoint(
    new fabric.Point(left, top),
    matrix,
  )

  left = finalPosition.x
  top = finalPosition.y

  const scaleX = CalcDimensionScale(
    modifiedObject.scaleX,
    activeSelection.scaleX,
  )
  const scaleY = CalcDimensionScale(
    modifiedObject.scaleY,
    activeSelection.scaleY,
  )

  return [left, top, scaleX, scaleY]
}

function CalcDimensionScale(
  modifiedObjectScale: number | undefined,
  activeSelectionScale: number | undefined,
): number | null {
  let scale: number | null

  if (!activeSelectionScale || !modifiedObjectScale) scale = null
  else scale = activeSelectionScale * modifiedObjectScale

  return scale
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

  const addNewObjectHandler = (e: fabric.IEvent<MouseEvent>) => {
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

        const finalPositionAndScale = getObjectFinalPositionAndScaleInGroup(
          modifiedObject,
          activeSelection,
        )

        // if (!modifiedObject) return

        // const matrix = activeSelection.calcTransformMatrix()

        // let left = modifiedObject.get("left")
        // let top = modifiedObject.get("top")

        // if (!left) return
        // if (!top) return

        // const finalPosition = fabric.util.transformPoint(new fabric.Point( left, top ), matrix)

        // left = finalPosition.x
        // top = finalPosition.y

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
      [left, top, scaleX, scaleY],
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
