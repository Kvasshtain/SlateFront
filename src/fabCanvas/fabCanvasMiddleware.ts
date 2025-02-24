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
  changeObjectOnCanvas as changeObjectOnCanvasAct,
  sendCanvasObjectModification,
  addPictureOnCanvas as addPictureOnCanvasAct,
  makeFromDocumentBodyDropImageZone as makeFromDocumentBodyDropImageZoneAct,
  setEditMode,
  initKeyActions,
  sendDeletedFromCanvasObjectsIds,
  deleteObjectsFromCanvasByIds as deleteObjectsFromCanvasByIdsAct,
  setCanvasZoom,
  setUserInputFieldCoordinates,
  setPresetText,
  setEditedTextId,
  sendCursorTrackingData,
  moveCursorOnCanvas,
} from "../components/Slate/store/slices"
import { fabric } from "fabric"
import {
  /*removeCanvasMouseEvents,*/ setAllObjectsSelection,
} from "./canvas-utils"

import type { DrawingShapeKind } from "../components/Slate/store/types"
import { EditMode } from "../components/Slate/store/types"
import {
  turnOffShapeDrawingMode,
  turnOnShapeDrawingMode,
} from "./shapesDrawing/shapeService"
import type { ICanvasState } from "./types"
import {
  addTextOnCanvas,
  initTextDblClickEditing,
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
  changeObjectOnCanvas,
  scaleObjectOnCanvas,
} from "./objectManipulations/objectManipulationsService"
import { addPictureOnCanvas } from "./picture/pictureService"
import { initDelKeyAction } from "./keyActions/keyActionsService"
import {
  deletSelectedActions,
  deleteObjectsFromCanvasByIds,
} from "./canvasObjectDeletion/selectedObjectsDeletService"
import { initCanvasResizing } from "./canvasResizing/canvasResizingService"
import {
  initCursorTracking,
  moveOtherUserCursor,
} from "./cursorTracking/cursorTrackingService"
import {
  turnOffSvgDrawingMode,
  turnOnSvgDrawingMode,
} from "./svgDrawing/svgService"
//import { initEventHandlers } from "./canvasEvents/canvasEventsService"

//Вынеси это в отдельный файл
//=============================================================================================================
const ukFlagSvgStr: string = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 30" width="1000" height="600">
    <clipPath id="t">
      <path d="M25,15h25v15zv15h-25zh-25v-15zv-15h25z"/>
    </clipPath>
    <path d="M0,0v30h50v-30z" fill="#012169"/>
    <path d="M0,0 50,30M50,0 0,30" stroke="#fff" stroke-width="6"/>
    <path d="M0,0 50,30M50,0 0,30" clip-path="url(#t)" stroke="#C8102E" stroke-width="4"/>
    <path d="M-1 11h22v-12h8v12h22v8h-22v12h-8v-12h-22z" fill="#C8102E" stroke="#FFF" stroke-width="2"/>
  </svg>`

let ukFlagObj: fabric.Object | null = null

fabric.loadSVGFromString(ukFlagSvgStr, function (objects, options) {
  ukFlagObj = fabric.util.groupSVGElements(objects, options)
})
//=============================================================================================================

const canvasState: ICanvasState = { isSendingBlocked: false }

const zoomCallbacksList = new Set<() => void>()

const fabCanvasMiddleware = (): Middleware => {
  return (store) => (next) => async (action) => {
    if (setMainCanvas.match(action)) {
      const canvas: fabric.Canvas = action.payload

      initCanvasResizing(canvas)

      //initEventHandlers(canvas)

      initCursorTracking(
        canvas,
        store.getState().playground?.userName,
        store.getState().playground?.activeBlackboardId,
        (cursorTrackingData) => {
          store.dispatch(sendCursorTrackingData(cursorTrackingData))
        },
      )

      initCanvasManipulation(
        canvas,
        store.getState().playground?.activeBlackboardId,
        canvasState,
        (canvasObject) => store.dispatch(sendCanvasObject(canvasObject)),
        (objectModificationData) =>
          store.dispatch(sendCanvasObjectModification(objectModificationData)),
      )

      initCanvasZooming(
        canvas,
        (zoom) => store.dispatch(setCanvasZoom(zoom)),
        zoomCallbacksList,
      )

      initTextDblClickEditing(
        canvas,
        canvasState,
        () => store.dispatch(setEditMode(EditMode.Text)),
        (canvasClickPoint) => {
          store.dispatch(setCanvasClickCoordinates(canvasClickPoint))
        },
        (screenClickPoint) => {
          store.dispatch(setUserInputFieldCoordinates(screenClickPoint))
        },
        (presetText) => {
          store.dispatch(setPresetText(presetText))
        },
        (textId) => {
          store.dispatch(setEditedTextId(textId))
        },
        zoomCallbacksList,
      )
    }

    if (addTextOnCanvasAct.match(action)) {
      addTextOnCanvas(
        store.getState().playground?.mainCanvas,
        store.getState().playground?.activeBlackboardId,
        action.payload,
        zoomCallbacksList,
        (x, y) => {
          store.dispatch(setUserInputFieldCoordinates({ x: x, y: y }))
        },
        (editedTextId) => {
          store.dispatch(sendDeletedFromCanvasObjectsIds([editedTextId]))
        },
        (canvasObject) => {
          store.dispatch(sendCanvasObject(canvasObject))
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
      const borderColor: string = state.currentBorderColor
      const mainColor: string = state.currentMainColor

      if (!canvas) {
        next(action)
        return
      }

      const canvasFreeDrawingBrush = canvas.freeDrawingBrush

      if (!canvasFreeDrawingBrush) {
        next(action)
        return
      }

      canvas.isDrawingMode = false

      turnOffShapeDrawingMode()
      turnOffSvgDrawingMode()
      //removeCanvasMouseEvents(canvas)
      store.dispatch(setCanvasClickCoordinates(null))

      switch (editMode) {
        case EditMode.None:
          turnOffTextEditMode(canvas)
          break
        case EditMode.LineDrawing:
          canvas.isDrawingMode = true
          canvasFreeDrawingBrush.color = borderColor
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
            (presetText) => {
              store.dispatch(setPresetText(presetText))
            },
            (textId) => {
              store.dispatch(setEditedTextId(textId))
            },
            zoomCallbacksList,
          )
          break
        case EditMode.Shape:
          setAllObjectsSelection(canvas, false)
          turnOnShapeDrawingMode(
            canvas,
            drawingShapeKind,
            canvasState,
            borderColor,
            mainColor,
          )
          break
        case EditMode.Svg:
          setAllObjectsSelection(canvas, false)
          turnOnSvgDrawingMode(canvas, canvasState, ukFlagObj)
          break
      }
    }

    //===================================================
    if (moveCursorOnCanvas.match(action)) {
      moveOtherUserCursor(
        store.getState().playground.mainCanvas,
        action.payload,
      )
    }

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

    if (changeObjectOnCanvasAct.match(action)) {
      changeObjectOnCanvas(
        store.getState().playground.mainCanvas,
        action.payload,
      )
    }
    //===================================================

    next(action)
  }
}

export default fabCanvasMiddleware
