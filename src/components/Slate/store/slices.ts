import { createAction, createSlice } from "@reduxjs/toolkit"

import { DrawingShapeKind, EditMode, type ISlateState } from "./types"
import { stat } from "fs"

export const initialState: ISlateState = {
  connectionState: "Disconnected",

  isUserAuthenticated: false,
  userId: "TEST USER", //!!! Замени на реальный идентификатор пользователя
  userName: null,
  userEmail: null,
  userPassword: null,
  newUserName: null,
  newUserEmail: null,
  newUserPassword: null,

  otherUserCursorData: null,
  mainCanvas: null,
  editMode: EditMode.None,
  drawingShapeKind: DrawingShapeKind.None,
  currentDrawingColor: "Black",
  currentCanvasZoom: 1,

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
  userInputFieldCoordinates: null,
  presetText: "",
  editedTextId: null,
}

export const slateSlice = createSlice({
  name: "playground",
  initialState,
  reducers: {
    resetStore: () => initialState,

    setIsUserAuthenticated: (state, action) => {
      state.isUserAuthenticated = action.payload
    },

    setUserInfo: (state, action) => {
      state.userId = action.payload.userId
      state.userName = action.payload.userName
      state.userEmail = action.payload.userEmail
    },

    submitUserEmailAndPassword: (state, action) => {
      state.userEmail = action.payload.userEmail
      state.userPassword = action.payload.userPassword
    },

    submitNewUser: (state, action) => {
      state.newUserName = action.payload.newUserName
      state.newUserEmail = action.payload.newUserEmail
      state.newUserPassword = action.payload.newUserPassword
    },

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

    setCanvasZoom: (state, action) => {
      state.currentCanvasZoom = action.payload
    },

    //===================================================
    moveCursorOnCanvas: (state, action) => {
      state.otherUserCursorData = action.payload
    },

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

    sendCursorTrackingData: (state, action) => {},

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

    setUserInputFieldCoordinates: (state, action) => {
      state.userInputFieldCoordinates = action.payload
    },
    setPresetText: (state, action) => {
      state.presetText = action.payload
    },
    setEditedTextId: (state, action) => {
      state.editedTextId = action.payload
    },
  },
})

export const {
  resetStore,
  setMainCanvas,

  setIsUserAuthenticated,
  setUserInfo,

  submitUserEmailAndPassword,
  submitNewUser,

  startConnecting,
  makeFromDocumentBodyDropImageZone,
  initKeyActions,
  setConnectionState,
  requestAllCanvasObjects,
  setEditMode,
  setDrawingShapeKind,
  setDrawingColor,
  setCanvasZoom,

  moveCursorOnCanvas,
  addObjectOnCanvas,
  deleteObjectsFromCanvasByIds,
  moveObjectOnCanvas,
  scaleObjectOnCanvas,
  rotateObjectOnCanvas,

  sendCursorTrackingData,
  sendCanvasObject,
  sendCanvasObjectModification,
  sendDeletedFromCanvasObjectsIds,

  addTextOnCanvas,
  addPictureOnCanvas,
  setCanvasClickCoordinates,
  setUserInputFieldCoordinates,
  setPresetText,
  setEditedTextId,
} = slateSlice.actions
export default slateSlice.reducer
