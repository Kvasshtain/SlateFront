import { createAction, createSlice } from "@reduxjs/toolkit"

import { EditMode, type ISlateState } from "./types"

export const initialState: ISlateState = {
  connectionState: "Disconnected",
  mainCanvas: null,
  editMode: EditMode.Text, // сделать None и выставлять в не None по запросу пользователя

  currentAddedCanvasObject: null,
  currentObjectMovementData: null,
  currentObjectScaleData: null,
  currentObjectRotationData: null,

  sentBlackboarObjId: null,
  addedBoardText: null,
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

    setConnectionState: (state, action) => {
      state.connectionState = action.payload
    },

    requestAllCanvasObjects: () => {},

    setEditMode: (state, action) => {
      state.editMode = action.payload
    },

    //===================================================
    addObjectOnCanvas: (state, action) => {
      state.currentAddedCanvasObject = action.payload
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

    sendCanvasObjectModification: (state, action) => {
      //!!!!!
    },

    addTextOnCanvas: (state, action) => {
      state.addedBoardText = action.payload
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
  setConnectionState,
  requestAllCanvasObjects,
  setEditMode,

  addObjectOnCanvas,
  moveObjectOnCanvas,
  scaleObjectOnCanvas,
  rotateObjectOnCanvas,

  sendCanvasObject,
  sendCanvasObjectModification,

  addTextOnCanvas,
  setCanvasClickCoordinates,
} = slateSlice.actions
export default slateSlice.reducer
