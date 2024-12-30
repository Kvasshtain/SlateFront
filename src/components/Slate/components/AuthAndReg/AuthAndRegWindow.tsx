import { useEffect, useState } from "react"
import type React from "react"
import { useNavigate } from "react-router"

//import './AuthenticationAndRegistrationWindow.sass'
import { useAppDispatch, useAppSelector } from "../../../../app/hooks"
import type { ISlateState } from "../../store/types"
import {
  setIsUserAuthenticated,
  setUserInfo,
  submitNewUser,
  submitUserEmailAndPassword,
} from "../../store/slices"
import AuthAndRegForm from "./components/AuthAndRegForm"
import type { LoginData, User } from "../../store/AuthRegApiSlice"
import {
  useGetAuthDataMutation,
  useRegNewUserMutation,
} from "../../store/AuthRegApiSlice"
//import { AuthAndRegForm } from './components/AuthAndRegForm/AuthAndRegForm';

// export interface IAuthAndRegWindowProps {
//   isUserAuthenticated: boolean
// }

const tokenKey = "accessToken"
const userIdKey = "userId"
const userNameKey = "userName"
const userEmailKey = "userEmail"

const AuthAndRegWindow: React.FC = () => {
  const state: ISlateState = useAppSelector((state) => state.playground)

  const [sendNewUserData, { data: regData, isLoading: regIsLoading }] =
    useRegNewUserMutation()
  const [sendLoginData, { data: logData, isLoading: logIsLoading }] =
    useGetAuthDataMutation()

  const dispatch = useAppDispatch()

  const navigate = useNavigate()

  useEffect(() => {
    if (!sessionStorage.getItem(tokenKey)) return

    //navigate("/blackboard")
    navigate("/mainWindow")
  })

  const onRegUser = async (userData: User) => {
    await sendNewUserData(userData)
      .unwrap()
      .catch((error) => {
        console.log(error.status)
      }) // !!! необходимо сделать оповещение пользователя о ошибке регистрации
  }

  const onAuthenticationSubmit = async (loginData: LoginData) => {
    await sendLoginData(loginData)
      .unwrap()
      .catch((error) => {
        console.log(error.status)
      }) // !!! необходимо сделать оповещение пользователя о ошибке аутентификации
  }

  useEffect(() => {
    let accessToken = logData?.accessToken

    if (!accessToken) return

    sessionStorage.setItem(tokenKey, accessToken)

    sessionStorage.setItem(userIdKey, logData?.id ? logData?.id.toString() : "")
    sessionStorage.setItem(
      userNameKey,
      logData?.userName ? logData?.userName : "",
    )
    sessionStorage.setItem(
      userEmailKey,
      logData?.userEmail ? logData?.userEmail.toString() : "",
    )

    dispatch(setIsUserAuthenticated(true))
    dispatch(
      setUserInfo({
        userId: logData?.id,
        userName: logData?.userName,
        userEmail: logData?.userEmail,
      }),
    )
  }, [logData, dispatch])

  return (
    <div>
      <AuthAndRegForm
        onAuthenticationSubmit={onAuthenticationSubmit}
        onRegistrationSubmit={onRegUser}
      />
      <div>{logData?.id}</div>
      <div>{logData?.userName}</div>
      <div>{logData?.userEmail}</div>
      <div>{logData?.accessToken}</div>
    </div>
  )
}

export default AuthAndRegWindow
