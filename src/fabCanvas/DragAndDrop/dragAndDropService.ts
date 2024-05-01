import { fabric } from "fabric"
import { getPointCoordinatesInViewport } from "../canvas-utils"

function makeFromDocumentBodyDropImageZone(
  canvasClickHandler: (x: number, y: number, file: File) => void,
) {
  const dropZone = document.body

  if (!dropZone) return

  dropZone.addEventListener("dragenter", (e: DragEvent) => {
    e.preventDefault()
  })

  dropZone.addEventListener("dragover", (e: DragEvent) => {
    e.preventDefault()
  })

  dropZone.addEventListener("dragleave", (e: DragEvent) => {
    e.preventDefault()
  })

  dropZone.addEventListener("drop", (e: DragEvent) => {
    e.preventDefault()

    const dataTransfer = e.dataTransfer
    const target = e.target

    if (!dataTransfer) return

    if (!target) return

    const files = Array.from(dataTransfer.files)

    if (!FileReader || files.length <= 0) return

    const file = files[0]

    const x = e.pageX - (target as HTMLElement).offsetLeft
    const y = e.pageY - (target as HTMLElement).offsetTop

    canvasClickHandler(x, y, file)
  })
}

function addPictureOnCanvas(canvas: fabric.Canvas, boardPicture: any) {
  if (!canvas) return

  const fileReader = new FileReader()

  fileReader.onload = () => {
    const result = fileReader.result as string

    if (result === null) return

    fabric.util.loadImage(result, (img) => {
      let oImg = new fabric.Image(img)

      const picturePosition = getPointCoordinatesInViewport(
        new fabric.Point(
          boardPicture.coordinates.x,
          boardPicture.coordinates.y,
        ),
        canvas,
      )

      oImg.set({
        left: picturePosition.x,
        top: picturePosition.y,
      })

      canvas.add(oImg)
      canvas.renderAll()
    })
  }

  fileReader.readAsDataURL(boardPicture.file)
}

export { makeFromDocumentBodyDropImageZone, addPictureOnCanvas }
