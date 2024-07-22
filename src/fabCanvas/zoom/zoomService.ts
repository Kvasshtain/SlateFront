import type { fabric } from "fabric"

const maxZoom = 1
const minZoom = 0.1
const zoomFactor = 0.999

function initCanvasZooming(
  canvas: fabric.Canvas,
  zoomSetter: (zoom: number) => void,
  zoomCallbacksList: Set<() => void>,
) {
  if (!canvas) return

  canvas.on("mouse:wheel", (opt) => {
    var vpt = canvas.viewportTransform

    if (!vpt) return

    var delta = opt.e.deltaY
    var zoom = canvas.getZoom()
    zoom *= zoomFactor ** delta

    if (zoom > maxZoom) zoom = maxZoom
    if (zoom < minZoom) zoom = minZoom

    zoomSetter(zoom)

    canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom)
    opt.e.preventDefault()
    opt.e.stopPropagation()

    for (const zoomCallback of zoomCallbacksList) {
      zoomCallback()
    }
  })
}

export { initCanvasZooming }
