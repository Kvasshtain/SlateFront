import type { Middleware } from "redux"
import {
  startConnecting,
  setConnectionState,
  addCanvasObject,
  requestAllCanvasObjects,
  sendCanvasObject,
} from "../components/Slate/store/slices"
import type { HubConnection } from "redux-signalr"

const createSignalMiddleware = (hubConnection: HubConnection): Middleware => {
  return (store) => (next) => async (action) => {
    if (startConnecting.match(action)) {
      if (hubConnection.state === "Disconnected") {
        await hubConnection.start()

        store.dispatch(setConnectionState(hubConnection.state))
      }

      hubConnection.on("AddObjectOnCanvas", (obj) => {
        store.dispatch(addCanvasObject(obj))
      })
    }

    if (requestAllCanvasObjects.match(action)) {
      hubConnection.invoke("GetAllBoardObjects").catch(function (err: Error) {
        return console.error(err.toString())
      })
    }

    if (sendCanvasObject.match(action)) {
      const blackboardObj = action.payload

      hubConnection
        .invoke("AddObject", {
          Id: blackboardObj.id,
          Data: blackboardObj.jsonData,
          Left: blackboardObj.left,
          Top: blackboardObj.top,
          ScaleX: blackboardObj.scaleX,
          ScaleY: blackboardObj.scaleY,
        })
        .catch(function (err) {
          return console.error(err.toString())
        })
    }

    next(action)
  }
}

export default createSignalMiddleware
