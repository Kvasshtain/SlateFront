import { useAppDispatch, useAppSelector } from "../../../../app/hooks"
import {
  enterBlackboard,
  setActiveBlackboardId,
  setActiveBlackboardName,
  setHubConnection,
  setIsUserAuthenticated,
  stopConnecting,
} from "../../store/slices"
import { useNavigate } from "react-router"

import type {
  BlackboardData,
  NewBlackboardData,
} from "../../store/BlackboardsApiSlice"
import {
  useCreateNewBlackboardMutation,
  useGetUserBlackboardsQuery,
  useDeleteBlackboardMutation,
} from "../../store/BlackboardsApiSlice"

import type { ISlateState } from "../../store/types"

import type React from "react"
import { useState } from "react"
import BlackboardDescriptionBlock from "./components/BlackboardDescriptionBlock/BlackboardDescriptionBlock"
import NewBlackboardForm from "./components/NewBlackboardForm"
import Blackboard from "../Blackboard"

const tokenKey = "accessToken" //Вынеси в отдельный файл!!!
const userIdKey = "userId"
const userNameKey = "userName"
const userEmailKey = "userEmail"

const MainWindow: React.FC = () => {
  const [isRenderNewBlackboardForm, setIsRenderNewBlackboardForm] =
    useState(false)

  const state: ISlateState = useAppSelector((state) => state.playground)

  const navigate = useNavigate()

  //const state: ISlateState = useAppSelector((state) => state.playground)

  const dispatch = useAppDispatch()

  //let userId = state.userId //!!!!!!DELETE FROM APP STORE!!!

  let userToken = sessionStorage.getItem(tokenKey)
  let userId = sessionStorage.getItem(userIdKey)

  if (!userToken || !userId) {
    userId = ""
    navigate("/login")
  }

  const { data, isError, isLoading, isSuccess } =
    useGetUserBlackboardsQuery(userId)

  const [
    sendNewBlackboardData,
    { data: newBlackboardData, isLoading: newBlackboardIsLoading },
  ] = useCreateNewBlackboardMutation()

  const [deleteBlackboard] = useDeleteBlackboardMutation()

  //const [enterBlackboard] = useEnterBlackboardMutation()

  const onNewBlackboardSubmitHandler = async (
    newBlackboardData: NewBlackboardData,
  ) => {
    setIsRenderNewBlackboardForm(false)

    await sendNewBlackboardData(newBlackboardData).unwrap()
    // .catch((error) => {
    //   console.log(error.status)
    // }) // !!! необходимо сделать оповещение пользователя о ошибке создания новой рабочей доски
  }

  const newBlackboardBtnClickHandler = () => {
    setIsRenderNewBlackboardForm(true)
  }

  const deleteBlackboardBtnClickHandler = async (id: number) => {
    await deleteBlackboard(id).unwrap()
    // .catch((error) => {
    //   console.log(error.status)
    // }) // !!! необходимо сделать оповещение пользователя о ошибке удаления рабочей доски
  }

  const onSelectBlackboardHandler = async (
    blackboardId: number,
    blackboardName: string,
  ) => {
    //dispatch(enterBlackboard(blackboardId))
    dispatch(setActiveBlackboardId(blackboardId))
    dispatch(setActiveBlackboardName(blackboardName))
    navigate("/blackboard")
  }

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

  const renderNewBlackboardForm = () => {
    if (isRenderNewBlackboardForm) {
      return (
        <NewBlackboardForm
          onNewBlackboardSubmit={onNewBlackboardSubmitHandler}
        />
      )
    }
  }

  if (isError) {
    return <h1>Error!</h1>
  }

  if (isLoading) {
    return <h1>Loading ...</h1>
  }

  if (!data) {
    return <h1>Error!</h1>
  }

  return (
    <div>
      {renderNewBlackboardForm()}
      {data.map((item: BlackboardData) => (
        <BlackboardDescriptionBlock
          id={item.id}
          name={item.name}
          description={item.description}
          onSelectBlackboard={onSelectBlackboardHandler}
          onDeleteBlackboard={deleteBlackboardBtnClickHandler}
        />
      ))}
      <button onClick={newBlackboardBtnClickHandler}>New blackboard</button>
      <button onClick={signOutButtonClickHandler}>Sign out</button>
    </div>
  )
}

export default MainWindow
