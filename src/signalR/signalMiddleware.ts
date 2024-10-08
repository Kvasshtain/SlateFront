import type { Middleware } from "redux"
import {
  startConnecting,
  setConnectionState,
  addObjectOnCanvas,
  deleteObjectsFromCanvasByIds,
  requestAllCanvasObjects,
  sendCanvasObject,
  scaleObjectOnCanvas,
  moveObjectOnCanvas,
  rotateObjectOnCanvas,
  sendCanvasObjectModification,
  sendDeletedFromCanvasObjectsIds,
  sendCursorTrackingData,
  moveCursorOnCanvas,
  stopConnecting,
} from "../components/Slate/store/slices"
import type { HubConnection } from "redux-signalr"
import type {
  ICanvasObject,
  ICursorData,
} from "../components/Slate/store/types"

const createSignalMiddleware = (): Middleware => {
  return (store) => (next) => async (action) => {
    const state = store.getState()
    const hubConnection: HubConnection = state.playground.hubConnection

    if (stopConnecting.match(action) && hubConnection) {
      if (hubConnection.state !== "Disconnected") {
        await hubConnection.stop().catch((err) => console.error(err.toString()))

        store.dispatch(setConnectionState(hubConnection.state))
      }
    }

    if (startConnecting.match(action) && hubConnection) {
      if (hubConnection.state === "Disconnected") {
        await hubConnection
          .start()
          .catch((err) => console.error(err.toString()))

        store.dispatch(setConnectionState(hubConnection.state))
      }

      hubConnection.on("AddObjectError", (img) => {
        //Add error handler!!!
      })

      hubConnection.on("DeleteObjectsError", (payload) => {
        //Add error handler!!!
      })

      hubConnection.on("DragObjectError", (img) => {
        //Add error handler!!!
      })

      hubConnection.on("ScaleObjectError", (img) => {
        //Add error handler!!!
      })

      hubConnection.on("RotateObjectError", (img) => {
        //Add error handler!!!
      })

      hubConnection.on("MoveCursorOnCanvas", (obj) => {
        store.dispatch(moveCursorOnCanvas(obj))
      })

      hubConnection.on("AddObjectOnCanvas", (obj) => {
        store.dispatch(addObjectOnCanvas(obj))
      })

      hubConnection.on("DeleteObjectsOnCanvas", (payload) => {
        store.dispatch(deleteObjectsFromCanvasByIds(payload))
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

    if (sendCursorTrackingData.match(action)) {
      const cursorData: ICursorData = action.payload

      hubConnection
        .invoke("MoveCursor", {
          UserName: cursorData.userName,
          Left: cursorData.left,
          Top: cursorData.top,
        })
        .catch(function (err: Error) {
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

    if (sendDeletedFromCanvasObjectsIds.match(action)) {
      const deletedFromCanvasObjectsIds: string[] = action.payload

      hubConnection
        .invoke("DeleteObjectsByIds", deletedFromCanvasObjectsIds)
        .catch(function (err) {
          return console.error(err.toString())
        })
    }

    next(action)
  }
}

export default createSignalMiddleware
