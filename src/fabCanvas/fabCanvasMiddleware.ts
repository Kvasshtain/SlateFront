import type { Middleware } from "redux"
import {
  addObjectOnCanvas,
  sendCanvasObject,
  addTextOnCanvas as addTextOnCanvasAct,
  setMainCanvas,
  setCanvasClickCoordinates,
  moveObjectOnCanvas,
  scaleObjectOnCanvas,
  rotateObjectOnCanvas,
  sendCanvasObjectModification,
  addPictureOnCanvas,
  makeFromDocumentBodyDropImageZone,
  setEditMode,
} from "../components/Slate/store/slices"
import { fabric } from "fabric"
import {
  findById,
  removeCanvasMouseEvents,
  ucFirst,
  uuidv4,
} from "./canvas-utils"
import type { FabObjectWithId } from "../components/Slate/types"
import type {
  IMovementData,
  IObjectModificationData,
  IRotationData,
  IScaleData,
} from "../components/Slate/store/types"
import { EditMode } from "../components/Slate/store/types"
import { turnOnRectDrawingMode } from "./ShapesDrawing/rectangleService"
import type { ICanvasState } from "./types"
import {
  addTextOnCanvas,
  turnOnTextEditMode,
} from "./TextEditing/textEditService"

let canvasState: ICanvasState = { isSendingBlocked: false }

const fabCanvasMiddleware = (): Middleware => {
  return (store) => (next) => async (action) => {
    if (setMainCanvas.match(action)) {
      const canvas: fabric.Canvas = action.payload

      if (!canvas) {
        next(action)
        return
      }

      canvas.on("object:added", (evt) => {
        if (canvasState.isSendingBlocked) return

        let target = evt.target as FabObjectWithId

        if (target === undefined) return

        if (target.id === undefined) {
          let id = uuidv4()
          let left = target.left
          let top = target.top
          let scaleX = target.scaleX
          let scaleY = target.scaleY

          let jsonData = JSON.stringify(target)

          canvas.remove(target)

          const blackboardObj = {
            id: id,
            jsonData: jsonData,
            left: left,
            top: top,
            scaleX: scaleX,
            scaleY: scaleY,
          }

          store.dispatch(sendCanvasObject(blackboardObj))
        }
      })

      canvas.on("object:modified", (evt) => {
        if (canvasState.isSendingBlocked) return

        const action = evt.action as string

        if (action === null) return

        let method = ucFirst(action)

        const modifiedObject = evt.target as FabObjectWithId

        if (modifiedObject === undefined || modifiedObject === null) return

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

        store.dispatch(sendCanvasObjectModification(objectModificationData))
      })

      canvas.on("mouse:wheel", (opt) => {
        var vpt = canvas.viewportTransform

        if (!vpt) return

        var delta = opt.e.deltaY
        var zoom = canvas.getZoom()
        zoom *= 0.999 ** delta
        if (zoom > 1) zoom = 1
        if (zoom < 0.1) zoom = 0.1
        canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom)
        opt.e.preventDefault()
        opt.e.stopPropagation()
      })
    }

    if (addTextOnCanvasAct.match(action)) {
      addTextOnCanvas(store.getState().playground?.mainCanvas, action.payload)
    }

    if (makeFromDocumentBodyDropImageZone.match(action)) {
      const dropZone = document.body

      if (!dropZone) return

      dropZone.addEventListener("dragenter", (e: DragEvent) => {
        e.preventDefault()
        //dropZone.classList.add(hoverClassName);
      })

      dropZone.addEventListener("dragover", (e: DragEvent) => {
        e.preventDefault()
        //dropZone.classList.add(hoverClassName);
      })

      dropZone.addEventListener("dragleave", (e: DragEvent) => {
        e.preventDefault()
        //dropZone.classList.remove(hoverClassName);
      })

      dropZone.addEventListener("drop", (e: DragEvent) => {
        e.preventDefault()

        const dataTransfer = e.dataTransfer
        const target = e.target

        if (!dataTransfer) return

        if (!target) return

        const files = Array.from(dataTransfer.files)

        if (!FileReader || files.length <= 0) return

        const file = files[0]

        const left = e.pageX - (target as HTMLElement).offsetLeft
        const top = e.pageY - (target as HTMLElement).offsetTop

        store.dispatch(
          addPictureOnCanvas({
            file: file,
            coordinates: {
              x: left,
              y: top,
            },
          }),
        )
      })
    }

    if (addPictureOnCanvas.match(action)) {
      const boardPicture = action.payload

      const state = store.getState()

      const canvas: fabric.Canvas = state.playground.mainCanvas

      if (!canvas) {
        next(action)
        return
      }

      const fileReader = new FileReader()

      fileReader.onload = () => {
        const result = fileReader.result as string

        if (result === null) return

        fabric.util.loadImage(result, (img) => {
          let oImg = new fabric.Image(img)

          oImg.set({
            left: boardPicture.coordinates.x,
            top: boardPicture.coordinates.y,
          })

          canvas.add(oImg)
          canvas.renderAll()
        })
      }

      fileReader.readAsDataURL(boardPicture.file)
    }

    if (setEditMode.match(action)) {
      canvasState.isSendingBlocked = false

      const editMode: EditMode = action.payload

      const canvas: fabric.Canvas = store.getState().playground.mainCanvas

      if (!canvas) {
        next(action)
        return
      }

      canvas.isDrawingMode = false
      canvas.selection = true

      removeCanvasMouseEvents(canvas)
      store.dispatch(setCanvasClickCoordinates(null))

      switch (editMode) {
        case EditMode.None:
          //removeCanvasMouseEvents(canvas)
          break
        case EditMode.LineDrawing:
          canvas.isDrawingMode = true
          break
        case EditMode.Text:
          turnOnTextEditMode(canvas, (x, y) => {
            store.dispatch(setCanvasClickCoordinates({ x: x, y: y }))
          })
          break
        case EditMode.Rectangle:
          turnOnRectDrawingMode(canvas, canvasState)
          break
      }
    }

    //===================================================
    if (addObjectOnCanvas.match(action)) {
      const currentAddedCanvasObject = action.payload
      const state = store.getState()

      if (!currentAddedCanvasObject) {
        next(action)
        return
      }

      const canvas: fabric.Canvas = state.playground.mainCanvas

      if (!canvas) {
        next(action)
        return
      }

      const id = currentAddedCanvasObject.id
      const obj = JSON.parse(currentAddedCanvasObject.data)
      const left = currentAddedCanvasObject.left
      const top = currentAddedCanvasObject.top
      const scaleX = currentAddedCanvasObject.scaleX
      const scaleY = currentAddedCanvasObject.scaleY
      const angle = currentAddedCanvasObject.angle

      const enlivenObjectsCallback = (objects: any[]) => {
        var origRenderOnAddRemove = canvas.renderOnAddRemove
        canvas.renderOnAddRemove = false

        objects.forEach(function (o: any) {
          o.set({
            id: id,
            left: left,
            top: top,
            scaleX: scaleX,
            scaleY: scaleY,
            angle: angle,
          })

          canvas.add(o)
        })

        canvas.renderOnAddRemove = origRenderOnAddRemove
        canvas.renderAll()
      }

      fabric.util.enlivenObjects([obj], enlivenObjectsCallback, "")

      canvas.renderAll()
    }

    if (moveObjectOnCanvas.match(action)) {
      const movementData: IMovementData = action.payload
      const state = store.getState()

      if (!movementData) {
        next(action)
        return
      }

      const canvas: fabric.Canvas = state.playground.mainCanvas

      if (!canvas) {
        next(action)
        return
      }

      let obj = findById(canvas, movementData.id)

      if (!obj) return

      obj.set({
        left: movementData.left,
        top: movementData.top,
      })

      canvas.renderAll()
    }

    if (scaleObjectOnCanvas.match(action)) {
      const scaleData: IScaleData = action.payload

      if (!scaleData) {
        next(action)
        return
      }

      const state = store.getState()

      const canvas: fabric.Canvas = state.playground.mainCanvas

      if (!canvas) {
        next(action)
        return
      }

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

    if (rotateObjectOnCanvas.match(action)) {
      const rotationData: IRotationData = action.payload

      if (!rotationData) {
        next(action)
        return
      }

      const state = store.getState()

      const canvas: fabric.Canvas = state.playground.mainCanvas

      if (!canvas) {
        next(action)
        return
      }

      let obj = findById(canvas, rotationData.id)

      if (!obj) return

      obj.set({
        angle: rotationData.angle,
      })

      canvas.renderAll()
    }
    //===================================================

    next(action)
  }
}

export default fabCanvasMiddleware
