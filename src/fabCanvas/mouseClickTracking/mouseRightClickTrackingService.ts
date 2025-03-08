import type { ICoordinates } from "../../components/Slate/store/types"
import { ConvertPointIntoCanvasCoordinates } from "../canvas-utils"
import { tryAddCanvasHandler } from "../canvasEvents/canvasEventsService"

const mouseClickTrackingName = "mouseClickTracking"
const rightButtonNumber = 3

function turnOnMouseRightClickTracking(
  canvas: fabric.Canvas,
  rightButtonClickFlagSetter: (rightButtonClickFlag: boolean) => void,
  canvasRightClickCoordinatesSetter: (canvasClickPoint: ICoordinates) => void,
  screenRightClickCoordinatesSetter: (screenClickPoint: ICoordinates) => void,
  canvasClickedObjectSetter: (
    canvasClickedObject: fabric.Object | undefined,
  ) => void,
) {
  const mouseDownHandler = (e: fabric.IEvent<MouseEvent>) => {
    if (!e.pointer) return

    const canvasClickPoint = ConvertPointIntoCanvasCoordinates(
      e.pointer,
      canvas.getZoom(),
      canvas,
    )

    rightButtonClickFlagSetter(e.button === rightButtonNumber)

    screenRightClickCoordinatesSetter(e.pointer)
    canvasRightClickCoordinatesSetter(canvasClickPoint)
    canvasClickedObjectSetter(e.target)
  }

  tryAddCanvasHandler(
    canvas,
    "mouse:down",
    mouseClickTrackingName,
    mouseDownHandler,
  )
}

export { turnOnMouseRightClickTracking }
