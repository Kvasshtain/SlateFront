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
import type { LoginData} from "../../store/AuthRegApiSlice";
import { useGetAuthDataMutation } from "../../store/AuthRegApiSlice"
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

  const [sendLoginData, { data, isLoading }] = useGetAuthDataMutation()

  const dispatch = useAppDispatch()

  const navigate = useNavigate()

  useEffect(() => {
    if (!sessionStorage.getItem(tokenKey)) return

    navigate("/blackboard")
  })

  const onAuthenticationSubmit = async (loginData: LoginData) => {
    await sendLoginData(loginData)
      .unwrap()
      .catch((error) => {
        console.log(error.status)
      }) // !!! необходимо сделать оповещение пользователя о ошибке аутентификации
  }

  useEffect(() => {
    let accessToken = data?.accessToken

    if (!accessToken) return

    sessionStorage.setItem(tokenKey, accessToken)

    sessionStorage.setItem(userIdKey, data?.id ? data?.id.toString() : "")
    sessionStorage.setItem(userNameKey, data?.userName ? data?.userName : "")
    sessionStorage.setItem(
      userEmailKey,
      data?.userEmail ? data?.userEmail.toString() : "",
    )

    dispatch(setIsUserAuthenticated(true))
    dispatch(
      setUserInfo({
        userId: data?.id,
        userName: data?.userName,
        userEmail: data?.userEmail,
      }),
    )

    navigate("/login")
  }, [data, dispatch])

  return (
    <div>
      <AuthAndRegForm
        onAuthenticationSubmit={onAuthenticationSubmit}
        onRegistrationSubmit={submitNewUser}
      />
      <div>{data?.id}</div>
      <div>{data?.userName}</div>
      <div>{data?.userEmail}</div>
      <div>{data?.accessToken}</div>
    </div>
  )
}

export default AuthAndRegWindow
