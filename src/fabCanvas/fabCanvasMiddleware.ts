import type { Middleware } from "redux"
import {
  addObjectOnCanvas as addObjectOnCanvasAct,
  sendCanvasObject,
  addTextOnCanvas as addTextOnCanvasAct,
  setMainCanvas,
  setCanvasClickCoordinates,
  moveObjectOnCanvas as moveObjectOnCanvasAct,
  scaleObjectOnCanvas as scaleObjectOnCanvasAct,
  rotateObjectOnCanvas as rotateObjectOnCanvasAct,
  sendCanvasObjectModification,
  addPictureOnCanvas as addPictureOnCanvasAct,
  makeFromDocumentBodyDropImageZone as makeFromDocumentBodyDropImageZoneAct,
  setEditMode,
  initKeyActions,
  sendDeletedFromCanvasObjectsIds,
  deleteObjectsFromCanvasByIds as deleteObjectsFromCanvasByIdsAct,
  setCanvasZoom,
  setUserInputFieldCoordinates,
} from "../components/Slate/store/slices"
import type { fabric } from "fabric"
import { removeCanvasMouseEvents, setAllObjectsSelection } from "./canvas-utils"

import type { DrawingShapeKind } from "../components/Slate/store/types"
import { EditMode } from "../components/Slate/store/types"
import { turnOnShapeDrawingMode } from "./shapesDrawing/shapeService"
import type { ICanvasState } from "./types"
import {
  addTextOnCanvas,
  turnOffTextEditMode,
  turnOnTextEditMode,
} from "./textEditing/textEditService"
import { makeFromDocumentBodyDropImageZone } from "./dragAndDrop/dragAndDropService"
import { initCanvasZooming } from "./zoom/zoomService"
import {
  addObjectOnCanvas,
  initCanvasManipulation,
  moveObjectOnCanvas,
  rotateObjectOnCanvas,
  scaleObjectOnCanvas,
} from "./objectManipulations/objectManipulationsService"
import { addPictureOnCanvas } from "./picture/pictureService"
import { initDelKeyAction } from "./keyActions/keyActionsService"
import {
  deletSelectedActions,
  deleteObjectsFromCanvasByIds,
} from "./canvasObjectDeletion/selectedObjectsDeletService"
import { initCanvasResizing } from "./canvasResizing/canvasResizingService"

const canvasState: ICanvasState = { isSendingBlocked: false }
const zoomCallbacksList: Set<() => void> = new Set<() => void>()

const fabCanvasMiddleware = (): Middleware => {
  return (store) => (next) => async (action) => {
    if (setMainCanvas.match(action)) {
      const canvas: fabric.Canvas = action.payload

      initCanvasResizing(canvas)

      initCanvasManipulation(
        canvas,
        canvasState,
        (addObjectHandler) =>
          store.dispatch(sendCanvasObject(addObjectHandler)),
        (objectModificationData) =>
          store.dispatch(sendCanvasObjectModification(objectModificationData)),
      )

      initCanvasZooming(
        canvas,
        (zoom) => store.dispatch(setCanvasZoom(zoom)),
        zoomCallbacksList,
      )
    }

    if (addTextOnCanvasAct.match(action)) {
      addTextOnCanvas(
        store.getState().playground?.mainCanvas,
        action.payload,
        zoomCallbacksList,
        (x, y) => {
          store.dispatch(setUserInputFieldCoordinates({ x: x, y: y }))
        },
      )
    }

    if (makeFromDocumentBodyDropImageZoneAct.match(action)) {
      makeFromDocumentBodyDropImageZone((x, y, file) => {
        store.dispatch(
          addPictureOnCanvasAct({
            file: file,
            coordinates: {
              x: x,
              y: y,
            },
          }),
        )
      })
    }

    if (initKeyActions.match(action)) {
      initDelKeyAction(() => {
        deletSelectedActions(
          store.getState().playground?.mainCanvas,
          (deletedFromCanvasObjectsIds) =>
            store.dispatch(
              sendDeletedFromCanvasObjectsIds(deletedFromCanvasObjectsIds),
            ),
        )
      })
    }

    if (addPictureOnCanvasAct.match(action)) {
      addPictureOnCanvas(store.getState().playground.mainCanvas, action.payload)
    }

    if (setEditMode.match(action)) {
      canvasState.isSendingBlocked = false

      const editMode: EditMode = action.payload

      const state = store.getState().playground

      const canvas: fabric.Canvas = state.mainCanvas
      setAllObjectsSelection(canvas, true)
      const drawingShapeKind: DrawingShapeKind = state.drawingShapeKind
      const color: string = state.currentDrawingColor

      if (!canvas) {
        next(action)
        return
      }

      canvas.isDrawingMode = false

      removeCanvasMouseEvents(canvas)
      store.dispatch(setCanvasClickCoordinates(null))

      switch (editMode) {
        case EditMode.None:
          turnOffTextEditMode(canvas)
          break
        case EditMode.LineDrawing:
          canvas.isDrawingMode = true
          canvas.freeDrawingBrush.color = color
          break
        case EditMode.Text:
          turnOnTextEditMode(
            canvas,
            canvasState,
            (canvasClickPoint) => {
              store.dispatch(setCanvasClickCoordinates(canvasClickPoint))
            },
            (screenClickPoint) => {
              store.dispatch(setUserInputFieldCoordinates(screenClickPoint))
            },
            zoomCallbacksList,
          )
          break
        case EditMode.Shape:
          setAllObjectsSelection(canvas, false)
          turnOnShapeDrawingMode(canvas, drawingShapeKind, canvasState, color)
          break
      }
    }

    //===================================================
    if (addObjectOnCanvasAct.match(action)) {
      addObjectOnCanvas(store.getState().playground.mainCanvas, action.payload)
    }

    if (deleteObjectsFromCanvasByIdsAct.match(action)) {
      deleteObjectsFromCanvasByIds(
        store.getState().playground.mainCanvas,
        action.payload,
      )
    }

    if (moveObjectOnCanvasAct.match(action)) {
      moveObjectOnCanvas(store.getState().playground.mainCanvas, action.payload)
    }

    if (scaleObjectOnCanvasAct.match(action)) {
      scaleObjectOnCanvas(
        store.getState().playground.mainCanvas,
        action.payload,
      )
    }

    if (rotateObjectOnCanvasAct.match(action)) {
      rotateObjectOnCanvas(
        store.getState().playground.mainCanvas,
        action.payload,
      )
    }
    //===================================================

    next(action)
  }
}

export default fabCanvasMiddleware
