import { createAction, createSlice } from "@reduxjs/toolkit"

import { ARR_ARROW_CODES, MAP_ARROW_CODES } from "../constants"
import type { ISlateState } from "./types"

import { hubConnection } from "../../../app/store"

export const initialState: ISlateState = {
  currentStep: 0,
  steps: [],
  totalSuccessful: 0,
  totalUnsuccessful: 0,
  currentAddedCanvasObject: null,
  sentBlackboarObjId: null,
}

export const slateSlice = createSlice({
  name: "playground",
  initialState,
  reducers: {
    setCurrentStep: (state) => {
      state.currentStep += 1
    },

    setSteps: (state) => {
      const randomKeys = Math.floor(Math.random() * ARR_ARROW_CODES.length)

      state.steps.push({
        step: state.currentStep,
        currentValue: ARR_ARROW_CODES[randomKeys],
        enteredValue: null,
        success: null,
      })
    },

    setEnteredValue: (state, action) => {
      if (state.steps.length) {
        const step = state.steps[state.currentStep - 1]
        const isSuccess = step.currentValue === action.payload

        if (step.enteredValue === null) {
          state.steps[state.currentStep - 1] = {
            ...step,
            enteredValue: action.payload,
            success: isSuccess,
          }
        }

        if (isSuccess) {
          state.totalSuccessful += 1
        } else {
          state.totalUnsuccessful += 1
          state.totalSuccessful = 0
        }
      }
    },

    setUnsuccess: (state) => {
      if (state.steps.length) {
        const step = state.steps[state.currentStep - 1]

        if (step.enteredValue === null) {
          state.totalUnsuccessful += 1
          state.totalSuccessful = 0

          state.steps[state.currentStep - 1] = {
            ...step,
            success: false,
          }
        }
      }
    },

    resetStore: () => initialState,

    startConnecting: () => {},

    addCanvasObject: (state, action) => {
      state.currentAddedCanvasObject = action.payload
    },

    sendCanvasObject: (state, action) => {
      const blackboardObj = action.payload

      state.sentBlackboarObjId = blackboardObj.id

      // hubConnection
      //   .invoke("AddObject", {
      //     Id: blackboardObj.id,
      //     Data: blackboardObj.jsonData,
      //     Left: blackboardObj.left,
      //     Top: blackboardObj.top,
      //     ScaleX: blackboardObj.scaleX,
      //     ScaleY: blackboardObj.scaleY,
      //   })
      //   .catch(function (err) {
      //     return console.error(err.toString())
      //   })
    },
  },
})

export const {
  setCurrentStep,
  setSteps,
  setEnteredValue,
  setUnsuccess,
  resetStore,
  startConnecting,
  addCanvasObject,
  sendCanvasObject,
} = slateSlice.actions
export default slateSlice.reducer
