// import styles from "./Blackboard.module.css"

import { useState, useEffect, useRef } from "react"
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react"
import { useAppDispatch, useAppSelector } from "../../../../app/hooks"
import { sendCanvasObject } from "../../store/slices"
import { fabric } from "fabric"
import type { FabObjectWithId } from "../../types"

import { uuidv4 } from "../../../../utils/canvas-utils"

const Blackboard: React.FC = () => {
  const state = useAppSelector((state) => state.playground)

  const { editor, onReady } = useFabricJSEditor()

  const dispatch = useAppDispatch()

  useEffect(() => {
    const canvas = editor?.canvas

    if (canvas === undefined) {
      return
    }

    canvas.setHeight(window.innerHeight)
    canvas.setWidth(window.innerWidth)
    canvas.renderAll()
  })

  useEffect(() => {
    const obj = state.currentAddedCanvasObject

    if (obj === null) {
      return
    }

    const canvas = editor?.canvas

    if (canvas === undefined) {
      return
    }

    let id = obj.id
    let canvasObj = JSON.parse(obj.data)
    let left = obj.left
    let top = obj.top
    let scaleX = obj.scaleX
    let scaleY = obj.scaleY
    let angle = obj.angle

    fabric.util.enlivenObjects(
      [canvasObj],
      function (objects: any[]) {
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
      },
      "",
    )

    canvas.renderAll()
  }, [editor?.canvas, state.currentAddedCanvasObject])

  const onAddCircle = () => {
    editor?.addCircle()
  }

  const onAddRectangle = () => {
    editor?.addRectangle()
  }

  editor?.canvas.on(
    "mouse:down",
    function (options: fabric.IEvent<MouseEvent>) {
      if (!options.e) return

      let evt = options.e
      let textX = evt.pageX
      let textY = evt.pageY
      let value = "TEST TEST TEST"

      editor.addText(value)

      //createTextInput

      console.log("canvas mouse:down event")
    },
  )

  editor?.canvas.on("object:added", (evt) => {
    let target = evt.target as FabObjectWithId

    if (target === undefined) return

    if (target.id === undefined) {
      let id = uuidv4()
      let left = target.left
      let top = target.top
      let scaleX = target.scaleX
      let scaleY = target.scaleY

      let jsonData = JSON.stringify(target)

      editor?.canvas.remove(target)

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

  /*return (
    <div>
      <button onClick={onAddCircle}>Add circle</button>
      <button onClick={onAddRectangle}>Add Rectangle</button>
      <FabricJSCanvas className="sample-canvas" onReady={onReady} />
    </div>
  )*/

  return (
    <div>
      <FabricJSCanvas className="sample-canvas" onReady={onReady} />
    </div>
  )
}

export default Blackboard
