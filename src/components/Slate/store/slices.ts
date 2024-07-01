import { createAction, createSlice } from "@reduxjs/toolkit"

import { DrawingShapeKind, EditMode, type ISlateState } from "./types"

export const initialState: ISlateState = {
  connectionState: "Disconnected",
  mainCanvas: null,
  editMode: EditMode.None,
  drawingShapeKind: DrawingShapeKind.None,
  currentDrawingColor: "Black",

  currentAddedCanvasObject: null,
  currentDeletedCanvasObjectsIds: null,
  currentObjectMovementData: null,
  currentObjectScaleData: null,
  currentObjectRotationData: null,

  sentBlackboarObjId: null,
  deletedFromCanvasObjectsIds: null,
  addedBoardText: null,
  addedBoardPicture: null,
  canvasClickCoordinates: null,
}

export const slateSlice = createSlice({
  name: "playground",
  initialState,
  reducers: {
    resetStore: () => initialState,

    setMainCanvas: (state, action) => {
      state.mainCanvas = action.payload
    },

    startConnecting: () => {},

    makeFromDocumentBodyDropImageZone: () => {},

    initKeyActions: () => {},

    setConnectionState: (state, action) => {
      state.connectionState = action.payload
    },

    requestAllCanvasObjects: () => {},

    setEditMode: (state, action) => {
      state.editMode = action.payload
    },

    setDrawingShapeKind: (state, action) => {
      state.drawingShapeKind = action.payload
    },

    setDrawingColor: (state, action) => {
      state.currentDrawingColor = action.payload
    },

    //===================================================
    addObjectOnCanvas: (state, action) => {
      state.currentAddedCanvasObject = action.payload
    },

    deleteObjectsFromCanvasByIds: (state, action) => {
      state.currentDeletedCanvasObjectsIds = action.payload
    },

    moveObjectOnCanvas: (state, action) => {
      state.currentObjectMovementData = action.payload
    },

    scaleObjectOnCanvas: (state, action) => {
      state.currentObjectScaleData = action.payload
    },

    rotateObjectOnCanvas: (state, action) => {
      state.currentObjectRotationData = action.payload
    },
    //===================================================

    sendCanvasObject: (state, action) => {
      const blackboardObj = action.payload

      state.sentBlackboarObjId = blackboardObj.id
    },

    sendCanvasObjectModification: (state, action) => {},

    sendDeletedFromCanvasObjectsIds: (state, action) => {
      state.deletedFromCanvasObjectsIds = action.payload
    },

    addTextOnCanvas: (state, action) => {
      state.addedBoardText = action.payload
    },

    addPictureOnCanvas: (state, action) => {
      state.addedBoardPicture = action.payload
    },

    setCanvasClickCoordinates: (state, action) => {
      state.canvasClickCoordinates = action.payload
    },
  },
})

export const {
  resetStore,
  setMainCanvas,
  startConnecting,
  makeFromDocumentBodyDropImageZone,
  initKeyActions,
  setConnectionState,
  requestAllCanvasObjects,
  setEditMode,
  setDrawingShapeKind,
  setDrawingColor,

  addObjectOnCanvas,
  deleteObjectsFromCanvasByIds,
  moveObjectOnCanvas,
  scaleObjectOnCanvas,
  rotateObjectOnCanvas,

  sendCanvasObject,
  sendCanvasObjectModification,
  sendDeletedFromCanvasObjectsIds,

  addTextOnCanvas,
  addPictureOnCanvas,
  setCanvasClickCoordinates,
} = slateSlice.actions
export default slateSlice.reducer
