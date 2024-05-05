import { fabric } from "fabric"
import { getPointCoordinatesInViewport } from "../canvas-utils"

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

export { addPictureOnCanvas }
