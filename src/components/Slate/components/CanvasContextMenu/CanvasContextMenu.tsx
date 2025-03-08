import styled from "styled-components"
import {
  sendDeletedFromCanvasObjectsIds,
  setRightButtonClickFlag,
} from "../../store/slices"
import type { ISlateState } from "../../store/types"
import { useAppDispatch, useAppSelector } from "../../../../app/hooks"

const CanvasContextMenu = () => {
  const state: ISlateState = useAppSelector((state) => state.playground)
  const dispatch = useAppDispatch()

  const deleteObjectButtonHandler = () => {
    const obj = state.canvasClickedObject

    if (!obj) return

    const deletedObjId = obj.id

    dispatch(sendDeletedFromCanvasObjectsIds([deletedObjId]))
    dispatch(setRightButtonClickFlag(false))
  }

  if (
    state.screenRightClickCoordinates?.x &&
    state.screenRightClickCoordinates?.y &&
    state.rightButtonClickFlag
  )
    return (
      <Container
        x={state.screenRightClickCoordinates.x}
        y={state.screenRightClickCoordinates.y}
      >
        <ContextMenu>
          <ContextMenuItem>
            <button onClick={deleteObjectButtonHandler}>Delet object</button>
          </ContextMenuItem>
        </ContextMenu>
      </Container>
    )
}

const Container = styled.div<{ x: number; y: number }>`
  position: fixed;
  zindex: 1000;
  left: ${({ x = 0 }) => x}px;
  top: ${({ y = 0 }) => y}px;
`

const ContextMenu = styled.ul`
  margin: 0;
  padding: 0;
`

const ContextMenuItem = styled.li`
  list-style-type: none;
`

export default CanvasContextMenu
