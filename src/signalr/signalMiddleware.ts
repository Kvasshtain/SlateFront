import type { Middleware } from "redux"
import {
  addCanvasObject,
  startConnecting,
  sendCanvasObject,
} from "../components/Slate/store/slices"
import type { HubConnection } from "redux-signalr"

const createSignalMiddleware = (hubConnection: HubConnection): Middleware => {
  return (store) => (next) => async (action) => {
    if (startConnecting.match(action)) {
      if (hubConnection.state === "Disconnected") {
        await hubConnection.start()
      }

      hubConnection.on("AddObjectOnCanvas", (obj) => {
        store.dispatch(addCanvasObject(obj))
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
