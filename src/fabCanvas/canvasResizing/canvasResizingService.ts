const initCanvasResizing = (canvas: fabric.Canvas) => {
  if (!canvas) return

  window.addEventListener("resize", (e) => {
    canvas.setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    })
  })
}

export { initCanvasResizing }
