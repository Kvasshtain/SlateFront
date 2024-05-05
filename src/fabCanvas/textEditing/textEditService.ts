import { fabric } from "fabric"
import type { IBounds } from "../types"
import { getPointCoordinatesInViewport } from "../canvas-utils"

function turnOnTextEditMode(
  canvas: fabric.Canvas,
  canvasClickHandler: (x: number, y: number) => void,
) {
  canvas.on("mouse:down", (e: fabric.IEvent<MouseEvent>) => {
    if (!e.pointer) return

    canvasClickHandler(e.pointer.x, e.pointer.y)
  })
}

function addTextOnCanvas(canvas: fabric.Canvas, boardText: any) {
  if (!canvas) return

  if (!boardText) return

  const text = boardText.text

  if (!text) return

  const coordinates = boardText.coordinates

  if (!coordinates) return

  const textPosition = getPointCoordinatesInViewport(
    new fabric.Point(coordinates.x, coordinates.y),
    canvas,
  )

  const style = boardText.style

  if (!style) return

  var fabText = new fabric.Text(text, {
    left: textPosition.x,
    top: textPosition.y,
    fill: style.color,
    fontSize: parseInt(style.fontSize),
    fontWeight: style.fontWeight,
    shadow: style.shadow,
    fontStyle: style.fontStyle as
      | ""
      | "normal"
      | "italic"
      | "oblique"
      | undefined,
    fontFamily: style.fontFamily,
    stroke: style.stroke,
    strokeWidth: +style.strokeWidth,
    textAlign: style.textAlign,
    lineHeight: +style.lineHeight,
    textBackgroundColor: style.textBackgroundColor,
  })

  canvas.add(fabText)
  canvas.renderAll()
}

export { turnOnTextEditMode, addTextOnCanvas }
