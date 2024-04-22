// import styles from "./FabJSCanvas.module.css"

import React from "react"

import { useEffect, useRef } from "react"
import { useAppDispatch } from "../../../../app/hooks"
import { addPictureOnCanvas, setMainCanvas } from "../../store/slices"
import { fabric } from "fabric"

const FabJSCanvas: React.FC = () => {
  const dispatch = useAppDispatch()

  const canvasRef: React.MutableRefObject<HTMLCanvasElement | null> =
    useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas: fabric.Canvas = new fabric.Canvas(canvasRef.current)

    canvas.setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    })

    dispatch(setMainCanvas(canvas))

    return () => {
      canvas.dispose()

      dispatch(setMainCanvas(null))
    }
  }, [dispatch])

  return <canvas ref={canvasRef} />
}

export default React.memo(FabJSCanvas)
