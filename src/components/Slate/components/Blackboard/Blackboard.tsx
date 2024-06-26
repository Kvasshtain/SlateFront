import { useEffect, useRef } from "react"
import { useAppDispatch, useAppSelector } from "../../../../app/hooks"
import {
  addTextOnCanvas,
  requestAllCanvasObjects,
  setDrawingColor,
  setDrawingShapeKind,
  setEditMode,
} from "../../store/slices"
import type { IScreenCoordinates } from "../../store/types"
import {
  DrawingShapeKind,
  EditMode,
  type IFontProperties,
} from "../../store/types"
import TextInput from "../TextInput"

import React from "react"
import Dropdown from "../Dropdown"
import MenuItem from "../Dropdown/components/MenuItem"
import { Behaviour, type IDropdownProps } from "../Dropdown/types"

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
    color: state.currentDrawingColor,
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

  const changeColorHandler = (item: Item) => {
    dispatch(setDrawingColor(item.label))
  }

  const addTextButtonClickHandler = () => {
    dispatch(setEditMode(EditMode.Text))
  }

  const lineDrawButtonClickHandler = () => {
    dispatch(setEditMode(EditMode.LineDrawing))
  }

  const resetEditModeButtonHandler = () => {
    dispatch(setEditMode(EditMode.None))
  }

  const addRectButtonClickHandler = () => {
    dispatch(setDrawingShapeKind(DrawingShapeKind.Rect))
    dispatch(setEditMode(EditMode.Shape))
  }

  const addCircleButtonClickHandler = () => {
    dispatch(setDrawingShapeKind(DrawingShapeKind.Ellipse))
    dispatch(setEditMode(EditMode.Shape))
  }

  const addTriangleButtonClickHandler = () => {
    dispatch(setDrawingShapeKind(DrawingShapeKind.Triangle))
    dispatch(setEditMode(EditMode.Shape))
  }

  //Вынеси в отдельный файл
  type Item = {
    label: string
    value: number
    disabled?: boolean
  }

  const items: Item[] = [
    { label: "Red", value: 1 },
    { label: "Green", value: 2 },
    { label: "Blue", value: 3 },
    { label: "Yellow", value: 4 },
    { label: "Black", value: 5 },
  ]
  //Вынеси в отдельный файл

  return (
    <React.Fragment>
      <div style={toolPanelStyle}>
        <Dropdown<Item>
          label="Choose color"
          behaviour={Behaviour.SINGLE}
          value={items[0]}
          onChange={changeColorHandler}
        >
          {items.map((item) => (
            <MenuItem key={item.value} value={item}>
              {item.label}
            </MenuItem>
          ))}
        </Dropdown>
        <button onClick={resetEditModeButtonHandler}> Reset edit mode</button>
        <button onClick={addTextButtonClickHandler}>Add text mode</button>
        <button onClick={lineDrawButtonClickHandler}>Add line mode</button>
        <button onClick={addRectButtonClickHandler}>Add rectangle</button>
        <button onClick={addCircleButtonClickHandler}>Add ellipse</button>
        <button onClick={addTriangleButtonClickHandler}>Add triangle</button>
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
