// import styles from "./FabJSCanvas.module.css"

// import {
//   Canvas,
//   util,
//   Rect,
// } from "fabric" //vite не хочет подцеплять по-нормальному :(

import React from "react"

import { useState, useEffect, useRef } from "react"
import { useAppDispatch, useAppSelector } from "../../../../app/hooks"
import {
  requestAllCanvasObjects,
  sendCanvasObject,
  setCanvasClickCoordinates,
  setEditMode,
} from "../../store/slices"
import type { FabObjectWithId } from "../../types"
import { uuidv4 } from "../../../../utils/canvas-utils"
import { fabric } from "fabric"
import { EditMode } from "../../store/types"

export interface IFabJSCanvasProps {
  //
}

const FabJSCanvas: React.FC<IFabJSCanvasProps> = (props) => {
  const state = useAppSelector((state) => state.playground)
  const dispatch = useAppDispatch()

  const {} = props

  const fabricRef: React.MutableRefObject<fabric.Canvas | null> =
    React.useRef(null)
  const canvasRef: React.MutableRefObject<HTMLCanvasElement | null> =
    React.useRef(null)
  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) {
      dispatch(requestAllCanvasObjects())

      firstRender.current = false
    }
  }, [])

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = new fabric.Canvas(canvasRef.current)

    fabricRef.current = canvas

    canvas.setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    })

    canvas.on("mouse:down", (options: fabric.IEvent<MouseEvent>) => {
      if (!options.e) return

      const evt = options.e

      dispatch(setCanvasClickCoordinates({ x: evt.pageX, y: evt.pageY }))
    })

    canvas.on("object:added", (evt) => {
      let target = evt.target as FabObjectWithId

      if (target === undefined) return

      if (target.id === undefined) {
        let id = uuidv4()
        let left = target.left
        let top = target.top
        let scaleX = target.scaleX
        let scaleY = target.scaleY

        let jsonData = JSON.stringify(target)

        canvas.remove(target)

        const blackboardObj = {
          id: id,
          jsonData: jsonData,
          left: left,
          top: top,
          scaleX: scaleX,
          scaleY: scaleY,
        }

        dispatch(sendCanvasObject(blackboardObj))
      }
    })

    return () => {
      canvas.dispose()
    }
  })

  useEffect(() => {
    const obj = state.currentAddedCanvasObject

    if (!obj) return

    const canvas = fabricRef.current

    if (!canvas) return

    let id = obj.id
    let canvasObj = JSON.parse(obj.data)
    let left = obj.left
    let top = obj.top
    let scaleX = obj.scaleX
    let scaleY = obj.scaleY
    let angle = obj.angle

    const enlivenObjectsCallback = (objects: any[]) => {
      var origRenderOnAddRemove = canvas.renderOnAddRemove
      canvas.renderOnAddRemove = false

      objects.forEach(function (o: any) {
        o.set({
          id: id,
          left: left,
          top: top,
          scaleX: scaleX,
          scaleY: scaleY,
          angle: angle,
        })

        canvas.add(o)
      })

      canvas.renderOnAddRemove = origRenderOnAddRemove
      canvas.renderAll()
    }

    fabric.util.enlivenObjects([canvasObj], enlivenObjectsCallback, "")

    canvas.renderAll()
  })

  useEffect(() => {
    if (state.editMode !== EditMode.Text) return

    const boardText = state.addedBoardText

    if (!boardText) return

    const text = boardText.text

    if (!text) return

    const coordinates = boardText.coordinates

    if (!coordinates) return

    const style = boardText.style

    if (!style) return

    const canvas = fabricRef.current

    if (!canvas) return

    var fabText = new fabric.Text(text, {
      left: coordinates.x,
      top: coordinates.y,
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

    dispatch(setEditMode(EditMode.None))
  })

  return <canvas ref={canvasRef} />
}

export default FabJSCanvas
