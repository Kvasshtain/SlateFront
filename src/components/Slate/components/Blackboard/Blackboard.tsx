import { useEffect, useRef } from "react"
import { useAppDispatch, useAppSelector } from "../../../../app/hooks"
import {
  addTextOnCanvas,
  requestAllCanvasObjects,
  setEditMode,
} from "../../store/slices"
import type { IScreenCoordinates } from "../../store/types"
import { EditMode, type IFontProperties } from "../../store/types"
import TextInput from "../TextInput"

import React from "react"

const Blackboard: React.FC = () => {
  const state = useAppSelector((state) => state.playground)

  const dispatch = useAppDispatch()

  const firstRender = useRef(true)

  const fontProperty: IFontProperties = {
    // перенеси в state приложения и сделай настраиваемым и изменяемым
    fontSize: 16 + "px",
    fontWeight: "normal",
    color: "red",
    textDecoration: "rgba(0,0,0,0) 0 0 0px",
    shadow: "rgba(0,0,0,0) 0px 0px 0px",
    fontStyle: "normal",
    fontFamily: "Times New Roman",
    stroke: "",
    strokeWidth: "",
    textAlign: "left",
    lineHeight: 1,
    textBackgroundColor: "rgba(0,0,0,0)",
  }

  useEffect(() => {
    if (!firstRender.current) return
    firstRender.current = false

    dispatch(requestAllCanvasObjects())
  }, [dispatch])

  const onEndTextEditingHandler = (
    text: string,
    textCoordinates: IScreenCoordinates,
  ): void => {
    dispatch(setEditMode(EditMode.None))

    dispatch(
      addTextOnCanvas({
        text: text.trim(),
        coordinates: textCoordinates,
        style: fontProperty,
      }),
    )
  }

  const addTextButtonClickHandler = () => {
    dispatch(setEditMode(EditMode.Text))
  }

  const lineDrawButtonClickHandler = () => {
    dispatch(setEditMode(EditMode.LineDrawing))
  }

  const resetEditModeButton = () => {
    dispatch(setEditMode(EditMode.None))
  }

  return (
    <React.Fragment>
      <button onClick={addTextButtonClickHandler}>Add text mode</button>
      <button onClick={lineDrawButtonClickHandler}>Add line mode</button>
      <button onClick={resetEditModeButton}> Reset edit mode</button>
      {state.canvasClickCoordinates && state.editMode === EditMode.Text && (
        <TextInput
          textX={state.canvasClickCoordinates.x}
          textY={state.canvasClickCoordinates.y}
          value={""}
          fontProperty={fontProperty}
          onEndTextEditing={onEndTextEditingHandler}
        />
      )}
    </React.Fragment>
  )
}

export default Blackboard
