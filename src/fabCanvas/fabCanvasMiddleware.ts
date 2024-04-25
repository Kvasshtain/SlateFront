import type { Middleware } from "redux"
import {
  addObjectOnCanvas,
  sendCanvasObject,
  addTextOnCanvas,
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
import { findById, ucFirst, uuidv4 } from "../utils/canvas-utils"
import type { FabObjectWithId } from "../components/Slate/types"
import type {
  IMovementData,
  IObjectModificationData,
  IRotationData,
  IScaleData} from "../components/Slate/store/types";
import {
  EditMode
} from "../components/Slate/store/types"

const fabCanvasMiddleware = (): Middleware => {
  return (store) => (next) => async (action) => {
    if (setMainCanvas.match(action)) {
      const canvas: fabric.Canvas = action.payload

      if (!canvas) {
        next(action)
        return
      }

      canvas.on("mouse:down", (options: fabric.IEvent<MouseEvent>) => {
        if (!options.e) return

        const evt = options.e

        store.dispatch(
          setCanvasClickCoordinates({ x: evt.pageX, y: evt.pageY }),
        )
      })

      canvas.on("object:added", (evt) => {
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
    }

    if (addTextOnCanvas.match(action)) {
      const boardText = action.payload
      const state = store.getState()

      if (!boardText) {
        next(action)
        return
      }

      const text = boardText.text

      if (!text) {
        next(action)
        return
      }

      const coordinates = boardText.coordinates

      if (!coordinates) {
        next(action)
        return
      }

      const style = boardText.style

      if (!style) {
        next(action)
        return
      }

      const canvas: fabric.Canvas = state.playground.mainCanvas

      if (!canvas) {
        next(action)
        return
      }

      var fabText = new fabric.Text(text, {
        left: coordinates.x,
        top: coordinates.y,
        fill: style.color,
        fontSize: parseInt(style.fontSize),
        fontWeight: style.fontWeight,
        shadow: style.shadow,
        fontStyle: style.fontStyle as
          | ""
          | "normal"
          | "italic"
          | "oblique"
          | undefined,
        fontFamily: style.fontFamily,
        stroke: style.stroke,
        strokeWidth: +style.strokeWidth,
        textAlign: style.textAlign,
        lineHeight: +style.lineHeight,
        textBackgroundColor: style.textBackgroundColor,
      })

      canvas.add(fabText)
      canvas.renderAll()
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
      const editMode: EditMode = action.payload

      const canvas: fabric.Canvas = store.getState().playground.mainCanvas

      if (!canvas) {
        next(action)
        return
      }

      if (editMode !== EditMode.LineDrawing) {
        canvas.isDrawingMode = false
      } else {
        canvas.isDrawingMode = true
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
