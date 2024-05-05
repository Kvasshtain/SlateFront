import type { Middleware } from "redux"
import {
  startConnecting,
  setConnectionState,
  addObjectOnCanvas,
  requestAllCanvasObjects,
  sendCanvasObject,
  scaleObjectOnCanvas,
  moveObjectOnCanvas,
  rotateObjectOnCanvas,
  sendCanvasObjectModification,
} from "../components/Slate/store/slices"
import type { HubConnection } from "redux-signalr"
import type { ICanvasObject } from "../components/Slate/store/types"

const createSignalMiddleware = (hubConnection: HubConnection): Middleware => {
  return (store) => (next) => async (action) => {
    if (startConnecting.match(action)) {
      if (hubConnection.state === "Disconnected") {
        await hubConnection.start()

        store.dispatch(setConnectionState(hubConnection.state))
      }

      hubConnection.on("AddObjectError", (img) => {
        //Add error handler!!!
      })

      hubConnection.on("AddObjectOnCanvas", (obj) => {
        store.dispatch(addObjectOnCanvas(obj))
      })

      hubConnection.on("MoveObjectOnCanvas", (payload) => {
        store.dispatch(moveObjectOnCanvas(payload))
      })

      hubConnection.on("ScaleObjectOnCanvas", (payload) => {
        store.dispatch(scaleObjectOnCanvas(payload))
      })

      hubConnection.on("RotateObjectOnCanvas", (payload) => {
        store.dispatch(rotateObjectOnCanvas(payload))
      })
    }

    if (requestAllCanvasObjects.match(action)) {
      hubConnection.invoke("GetAllBoardObjects").catch(function (err: Error) {
        return console.error(err.toString())
      })
    }

    if (sendCanvasObject.match(action)) {
      const blackboardObj: ICanvasObject = action.payload

      hubConnection
        .invoke("AddObject", {
          Id: blackboardObj.id,
          Data: blackboardObj.data,
          Left: blackboardObj.left,
          Top: blackboardObj.top,
          ScaleX: blackboardObj.scaleX,
          ScaleY: blackboardObj.scaleY,
          Angle: blackboardObj.angle,
        })
        .catch(function (err) {
          return console.error(err.toString())
        })
    }

    if (sendCanvasObjectModification.match(action)) {
      const objectModificationData = action.payload

      hubConnection
        .invoke(objectModificationData.method, objectModificationData.payload)
        .catch(function (err) {
          return console.error(err.toString())
        })
    }

    next(action)
  }
}

export default createSignalMiddleware
