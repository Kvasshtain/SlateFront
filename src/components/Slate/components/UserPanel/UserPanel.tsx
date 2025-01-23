import { useNavigate } from "react-router"
import { useAppDispatch, useAppSelector } from "../../../../app/hooks"
//import { useSignOutMutation } from "../../store/AuthRegApiSlice";

import type { ISlateState } from "../../store/types"

import type React from "react"
import {
  setHubConnection,
  setIsUserAuthenticated,
  stopConnecting,
} from "../../store/slices"

const tokenKey = "accessToken" //Вынеси в отдельный файл!!!
const userIdKey = "userId"
const userNameKey = "userName"
const userEmailKey = "userEmail"

const UserPanel: React.FC = () => {
  const state: ISlateState = useAppSelector((state) => state.playground)

  //const [sendLogoutData, { data, isLoading }] = useSignOutMutation()

  const navigate = useNavigate()

  const dispatch = useAppDispatch()

  const signOutButtonClickHandler = async () => {
    const userId = sessionStorage.getItem(userIdKey)

    if (!userId) return

    //await sendLogoutData({userId: +userId}).unwrap().catch((error) => {console.log(error.status)})
    //dispatch(setDrawingShapeKind(DrawingShapeKind.Triangle))

    sessionStorage.removeItem(tokenKey)

    sessionStorage.removeItem(userIdKey)
    sessionStorage.removeItem(userNameKey)
    sessionStorage.removeItem(userEmailKey)

    dispatch(setIsUserAuthenticated(false))

    state.hubConnection?.stop()

    dispatch(stopConnecting())
    dispatch(setHubConnection(null))

    navigate("/login")
  }

  return (
    <div>
      <span>{sessionStorage.getItem(userNameKey)}</span>
      <span>Blackboard name: {state.activeBlackboardName}</span>
      <span>Connection state: {state.connectionState}</span>
      <button onClick={signOutButtonClickHandler}>Sign out</button>
    </div>
  )
}

export default UserPanel
