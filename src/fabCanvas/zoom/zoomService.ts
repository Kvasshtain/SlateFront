import type { fabric } from "fabric"

const maxZoom = 1
const minZoom = 0.1
const zoomFactor = 0.999

function initCanvasZooming(canvas: fabric.Canvas) {
  if (!canvas) return

  canvas.on("mouse:wheel", (opt) => {
    var vpt = canvas.viewportTransform

    if (!vpt) return

    var delta = opt.e.deltaY
    var zoom = canvas.getZoom()
    zoom *= zoomFactor ** delta

    if (zoom > maxZoom) zoom = maxZoom
    if (zoom < minZoom) zoom = minZoom

    canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom)
    opt.e.preventDefault()
    opt.e.stopPropagation()
  })
}

export { initCanvasZooming }
