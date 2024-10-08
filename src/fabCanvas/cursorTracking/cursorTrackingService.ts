import { fabric } from "fabric"
import type {
  ICursorData,
  IScreenCoordinates,
} from "../../components/Slate/store/types"
import { ConvertPointIntoCanvasCoordinates } from "../canvas-utils"
import { FabObjectWithId } from "../../components/Slate/types"
import { deleteObjectsFromCanvasByIds } from "../canvasObjectDeletion/selectedObjectsDeletService"
import { tryAddCanvasHandler } from "../canvasEvents/canvasEventsService"

const cursorTrackingName = "CursorTracking"
const cursorMarker = "CursorMarker"

function CreateCursorTrackingMarkerShape(
  uaerName: string,
  canvasCursorPoint: IScreenCoordinates,
) {
  var cursorLabel = new fabric.Text(uaerName, {
    left: canvasCursorPoint.x,
    top: canvasCursorPoint.y,
    fill: "rgba(0, 0, 255, 0.5)",
    fontSize: 16,
    fontWeight: "normal",
    shadow: "rgba(0,0,0,0) 0px 0px 0px",
    fontStyle: "normal",
    fontFamily: "Times New Roman",
    stroke: "",
    strokeWidth: 0,
    textAlign: "left",
    lineHeight: 1,
    textBackgroundColor: "rgba(0, 0, 255, 0.1)",
  })

  const cursorWithId = new FabObjectWithId(cursorLabel)

  cursorWithId.id = cursorMarker

  return cursorWithId
}

function initCursorTracking(
  canvas: fabric.Canvas,
  userName: string,
  cursorTrackingHandler: (cursorTrackingData: ICursorData) => void,
) {
  const mouseMoveHandler = (e: fabric.IEvent<MouseEvent>) => {
    if (!e.pointer) return

    const canvasCursorPoint = ConvertPointIntoCanvasCoordinates(
      e.pointer,
      canvas.getZoom(),
      canvas,
    )

    if (!canvasCursorPoint.x || !canvasCursorPoint.y) return

    const cursorTrackingData: ICursorData = {
      userName: userName,
      left: canvasCursorPoint.x,
      top: canvasCursorPoint.y,
    }

    cursorTrackingHandler(cursorTrackingData)
  }

  tryAddCanvasHandler(
    canvas,
    "mouse:move",
    cursorTrackingName,
    mouseMoveHandler,
  )
}

const moveOtherUserCursor = (
  canvas: fabric.Canvas,
  cursorData: ICursorData,
) => {
  if (!canvas) return
  if (!cursorData) return

  deleteObjectsFromCanvasByIds(canvas, [cursorMarker])
  canvas.add(
    CreateCursorTrackingMarkerShape(cursorData.userName, {
      x: cursorData.left,
      y: cursorData.top,
    }),
  )
  canvas.renderAll()
}

export { initCursorTracking, moveOtherUserCursor }
