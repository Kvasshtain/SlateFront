import { useEffect, useRef } from "react"
import { useNavigate } from "react-router"
import { useAppDispatch, useAppSelector } from "../../../../app/hooks"
import {
  addTextOnCanvas,
  deleteObjectFromCanvasById,
  enterBlackboard,
  requestAllCanvasObjects,
  sendDeletedFromCanvasObjectsIds,
  setBorderColor,
  setDrawingShapeKind,
  setEditMode,
  setHubConnection,
  setMainColor,
  setRightButtonClickFlag,
  startConnecting,
} from "../../store/slices"
//import type { IScreenCoordinates } from "../../store/types"
import type { ISlateState } from "../../store/types"
import {
  DrawingShapeKind,
  EditMode,
  type IFontProperties,
} from "../../store/types"
import TextInput from "../TextInput"

import React from "react"
import Dropdown from "../Dropdown"
import { Behaviour, type IDropdownProps } from "../Dropdown/types"
import UserPanel from "../UserPanel"
import createHubConnection from "../../../../signalR/createHubConnection"
import styled from "styled-components"
import { stat } from "fs"
import { FabObjectWithId } from "../../types"
import MenuItem from "../Dropdown/components/MenuItem"
import CanvasContextMenu from "../CanvasContextMenu"

const tokenKey = "accessToken"

const Blackboard: React.FC = () => {
  const state: ISlateState = useAppSelector((state) => state.playground)

  const dispatch = useAppDispatch()
  const navigate = useNavigate()

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
    fontSize: 16,
    fontWeight: "normal",
    color: state.currentBorderColor,
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

  // useEffect(() => {
  //   if (!firstRender.current) return

  //   if (state.hubConnection?.state !== "Connected") return

  //   firstRender.current = false

  //   dispatch(requestAllCanvasObjects())
  // }, [state, dispatch])

  useEffect(() => {
    const hubConnection = state.hubConnection
    const token = sessionStorage.getItem(tokenKey)

    if (!token) {
      navigate("/login")
      return
    }

    if (!state.hubConnection) {
      dispatch(setHubConnection(createHubConnection(token)))
      return
    }

    if (state.connectionState !== "Connected") {
      dispatch(startConnecting())
      return
    }

    if (firstRender.current) {
      dispatch(enterBlackboard(state.activeBlackboardId))
      dispatch(requestAllCanvasObjects(state.activeBlackboardId))
      firstRender.current = false
      return
    }
  }, [state, dispatch, navigate])

  const onEndTextEditingHandler = (text: string): void => {
    dispatch(setEditMode(EditMode.None))

    dispatch(
      addTextOnCanvas({
        text: text.trim(),
        coordinates: state.canvasTextCoordinates,
        style: fontProperty,
        editedTextId: state.editedTextId,
      }),
    )
  }

  const changeBorderColorHandler = (item: Item) => {
    dispatch(setBorderColor(item.label))
  }

  const changeMainColorHandler = (item: Item) => {
    dispatch(setMainColor(item.label))
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

  const addSvgButtonClickHandler = () => {
    dispatch(setEditMode(EditMode.Svg))
  }

  const deleteObjectButtonHandler = () => {
    const obj = state.canvasClickedObject

    if (!obj) return

    const deletedObjId = obj.id

    dispatch(sendDeletedFromCanvasObjectsIds([deletedObjId]))
    dispatch(setRightButtonClickFlag(false))
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
    { label: "White", value: 0 },
  ]
  //Вынеси в отдельный файл

  return (
    <React.Fragment>
      <div style={toolPanelStyle}>
        <Dropdown<Item>
          label="Choose border color"
          behaviour={Behaviour.SINGLE}
          value={items[0]}
          onChange={changeBorderColorHandler}
        >
          {items.map((item) => (
            <MenuItem key={item.value} value={item}>
              {item.label}
            </MenuItem>
          ))}
        </Dropdown>
        <Dropdown<Item>
          label="Choose main color"
          behaviour={Behaviour.SINGLE}
          value={items[0]}
          onChange={changeMainColorHandler}
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
        <button onClick={addSvgButtonClickHandler}>Add svg flag</button>
        <UserPanel />
      </div>
      {state.userTextInputFieldCoordinates?.x &&
        state.userTextInputFieldCoordinates?.y &&
        state.editMode === EditMode.Text && (
          <TextInput
            textX={state.userTextInputFieldCoordinates.x}
            textY={state.userTextInputFieldCoordinates.y}
            value={state.presetText}
            fontProperty={fontProperty}
            onEndTextEditing={onEndTextEditingHandler}
          />
        )}
      <CanvasContextMenu />
    </React.Fragment>
  )
}

export default Blackboard
