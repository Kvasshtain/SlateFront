import { createAction, createSlice } from "@reduxjs/toolkit"

import { EditMode, type ISlateState } from "./types"

export const initialState: ISlateState = {
  connectionState: "Disconnected",
  editMode: EditMode.Text, // сделать None и выставлять в не None по запросу пользователя
  currentAddedCanvasObject: null,
  sentBlackboarObjId: null,
  addedBoardText: null,
  canvasClickCoordinates: null,
}

export const slateSlice = createSlice({
  name: "playground",
  initialState,
  reducers: {
    resetStore: () => initialState,

    startConnecting: () => {},

    setConnectionState: (state, action) => {
      state.connectionState = action.payload
    },

    requestAllCanvasObjects: () => {},

    setEditMode: (state, action) => {
      state.editMode = action.payload
    },

    addCanvasObject: (state, action) => {
      state.currentAddedCanvasObject = action.payload
    },

    sendCanvasObject: (state, action) => {
      const blackboardObj = action.payload

      state.sentBlackboarObjId = blackboardObj.id
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
  startConnecting,
  setConnectionState,
  requestAllCanvasObjects,
  setEditMode,
  addCanvasObject,
  sendCanvasObject,
  addTextOnCanvas,
  setCanvasClickCoordinates,
} = slateSlice.actions
export default slateSlice.reducer
