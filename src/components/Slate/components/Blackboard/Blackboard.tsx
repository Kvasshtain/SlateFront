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

  const toolPanelStyle: React.CSSProperties = {
    //transfer to css
    position: "absolute",
    zIndex: "1000",

    left: 0,
    top: 0,
  }

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

  const addRectButtonClickHandler = () => {
    dispatch(setEditMode(EditMode.Rectangle))
  }

  return (
    <React.Fragment>
      <div style={toolPanelStyle}>
        <button onClick={resetEditModeButton}> Reset edit mode</button>
        <button onClick={addTextButtonClickHandler}>Add text mode</button>
        <button onClick={lineDrawButtonClickHandler}>Add line mode</button>
        <button onClick={addRectButtonClickHandler}>Add rectangle</button>
      </div>
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
