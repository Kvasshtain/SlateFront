import { useState, useEffect, useRef } from "react"
import { useAppDispatch, useAppSelector } from "../../../../app/hooks"
import { addTextOnCanvas, setEditMode } from "../../store/slices"
import type { IScreenCoordinates } from "../../store/types"
import { EditMode, type IFontProperties } from "../../store/types"
import TextInput from "../TextInput"

import React from "react"

const Blackboard: React.FC = () => {
  const state = useAppSelector((state) => state.playground)

  const dispatch = useAppDispatch()

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

  const onEndTextEditingHandler = (
    text: string,
    textCoordinates: IScreenCoordinates,
  ): void => {
    let val = text

    if (val !== null && typeof val !== "undefined") {
      val = val.trim()
    }

    if (!val) return

    dispatch(
      addTextOnCanvas({
        text: text,
        coordinates: textCoordinates,
        style: fontProperty,
      }),
    )
  }

  return (
    <React.Fragment>
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
