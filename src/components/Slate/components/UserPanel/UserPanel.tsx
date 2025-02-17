import { useNavigate } from "react-router"
import { useAppDispatch, useAppSelector } from "../../../../app/hooks"

import type { ISlateState } from "../../store/types"

import type React from "react"

const userNameKey = "userName"

const UserPanel: React.FC = () => {
  const state: ISlateState = useAppSelector((state) => state.playground)

  const navigate = useNavigate()

  const goToMainWindowButtonClickHandler = async () => {
    navigate("/mainWindow")
  }

  return (
    <div>
      <span>{sessionStorage.getItem(userNameKey)}</span>
      <span>Blackboard name: {state.activeBlackboardName}</span>
      <span>Connection state: {state.connectionState}</span>
      <button onClick={goToMainWindowButtonClickHandler}>
        Go to main window
      </button>
    </div>
  )
}

export default UserPanel
