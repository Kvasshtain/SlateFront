let currentCanvas: fabric.Canvas // Пока приходится делать так. В дальнейшем необходимо разобраться с однократным рендерингом холста

const canvasHandlers = new Map<
  fabric.EventName,
  Map<string, (e: fabric.IEvent<MouseEvent>) => void>
>()

const tryAddCanvasHandler = (
  canvas: fabric.Canvas,
  eventName: fabric.EventName,
  name: string,
  handler: (e: fabric.IEvent<MouseEvent>) => void,
) => {
  if (currentCanvas !== canvas) {
    currentCanvas = canvas
    canvasHandlers.clear()
  }

  if (!canvasHandlers.has(eventName)) {
    canvasHandlers.set(
      eventName,
      new Map<string, (e: fabric.IEvent<MouseEvent>) => void>(),
    )

    const aggregatedHandler = (e: fabric.IEvent<MouseEvent>) => {
      const handlers = canvasHandlers.get(eventName)

      if (!handlers) return

      for (const locHandler of handlers.values()) {
        locHandler(e)
      }
    }

    canvas?.on(eventName, aggregatedHandler)
  }

  canvasHandlers.get(eventName)?.set(name, handler)

  return true
}

const removeCanvasHandler = (eventName: fabric.EventName, name: string) => {
  canvasHandlers.get(eventName)?.delete(name)
}

export { tryAddCanvasHandler, removeCanvasHandler }
