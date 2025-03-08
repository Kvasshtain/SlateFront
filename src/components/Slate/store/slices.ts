import { createAction, createSlice } from "@reduxjs/toolkit"

import { DrawingShapeKind, EditMode, type ISlateState } from "./types"
import { stat } from "fs"

export const initialState: ISlateState = {
  connectionState: "Disconnected",

  isUserAuthenticated: false,
  userId: null,
  userName: null,
  userEmail: null,
  userPassword: null,
  newUserName: null,
  newUserEmail: null,
  newUserPassword: null,

  activeBlackboardId: null,
  activeBlackboardName: null,

  otherUserCursorData: null,
  mainCanvas: null,
  hubConnection: null,
  editMode: EditMode.None,
  drawingShapeKind: DrawingShapeKind.None,
  currentBorderColor: "Black",
  currentMainColor: "Black",
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
  canvasRightClickCoordinates: null,
  screenRightClickCoordinates: null,
  canvasTextCoordinates: null,
  userTextInputFieldCoordinates: null,
  canvasClickedObject: null,
  rightButtonClickFlag: false,
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

    setActiveBlackboardId: (state, action) => {
      state.activeBlackboardId = action.payload
    },

    setActiveBlackboardName: (state, action) => {
      state.activeBlackboardName = action.payload
    },

    setMainCanvas: (state, action) => {
      state.mainCanvas = action.payload
    },

    startConnecting: () => {},

    stopConnecting: () => {},

    setHubConnection: (state, action) => {
      state.hubConnection = action.payload
    },

    makeFromDocumentBodyDropImageZone: () => {},

    initKeyActions: () => {},

    setConnectionState: (state, action) => {
      state.connectionState = action.payload
    },

    requestAllUsersBlackboard: () => {},

    enterBlackboard: (state, action) => {},

    requestAllCanvasObjects: (state, action) => {},

    setEditMode: (state, action) => {
      state.editMode = action.payload
    },

    setDrawingShapeKind: (state, action) => {
      state.drawingShapeKind = action.payload
    },

    setBorderColor: (state, action) => {
      state.currentBorderColor = action.payload
    },

    setMainColor: (state, action) => {
      state.currentMainColor = action.payload
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

    deleteObjectFromCanvasById: (state, action) => {
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

    changeObjectOnCanvas: (state, action) => {
      state.currentObjectRotationData = action.payload //исправить сохранение в сторе!!!
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

    setCanvasTextCoordinates: (state, action) => {
      state.canvasTextCoordinates = action.payload
    },

    setTextInputFieldCoordinates: (state, action) => {
      state.userTextInputFieldCoordinates = action.payload
    },

    setCanvasRightClickCoordinates: (state, action) => {
      state.canvasRightClickCoordinates = action.payload
    },

    setScreenRightClickCoordinates: (state, action) => {
      state.screenRightClickCoordinates = action.payload
    },

    setCanvasClickedObject: (state, action) => {
      state.canvasClickedObject = action.payload
    },

    setRightButtonClickFlag: (state, action) => {
      state.rightButtonClickFlag = action.payload
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

  setActiveBlackboardId,
  setActiveBlackboardName,

  startConnecting,
  stopConnecting,
  setHubConnection,

  makeFromDocumentBodyDropImageZone,
  initKeyActions,
  setConnectionState,
  requestAllUsersBlackboard,
  enterBlackboard,
  requestAllCanvasObjects,
  setEditMode,
  setDrawingShapeKind,
  setBorderColor,
  setMainColor,
  setCanvasZoom,

  moveCursorOnCanvas,
  addObjectOnCanvas,
  deleteObjectFromCanvasById,
  moveObjectOnCanvas,
  scaleObjectOnCanvas,
  rotateObjectOnCanvas,
  changeObjectOnCanvas,

  sendCursorTrackingData,
  sendCanvasObject,
  sendCanvasObjectModification,
  sendDeletedFromCanvasObjectsIds,

  addTextOnCanvas,
  addPictureOnCanvas,
  setCanvasTextCoordinates,
  setTextInputFieldCoordinates,
  setCanvasRightClickCoordinates,
  setScreenRightClickCoordinates,
  setCanvasClickedObject,
  setRightButtonClickFlag,
  setPresetText,
  setEditedTextId,
} = slateSlice.actions
export default slateSlice.reducer
