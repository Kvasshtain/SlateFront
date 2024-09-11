import type { FormEvent} from "react";
import type React from "react";
import { useState } from "react"
import PropTypes from "prop-types"

//import { InputField } from '../InputField/InputField'

//import './AuthenticationAndRegistrationForm.sass'
//import '../SubmitButton/SubmitButton.sass'
//import './__Label/AuthenticationAndRegistrationForm-Label.sass'
import InputField from "../InputField"
import type { LoginData } from "../../../../store/AuthRegApiSlice"

export interface IAuthAndRegFormProps {
  onAuthenticationSubmit: (loginData: LoginData) => void
  onRegistrationSubmit: (user: {
    email: string
    name: string
    password: string
  }) => void
}

const AuthAndRegForm: React.FC<IAuthAndRegFormProps> = (props) => {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [isRegistrationMode, setIsRegistrationMode] = useState(false)

  const onSubmitHandler = (eventArg: FormEvent<HTMLFormElement>) => {
    eventArg.preventDefault()

    const { onAuthenticationSubmit, onRegistrationSubmit } = props

    const user = {
      email,
      name,
      password,
    }

    if (isRegistrationMode) {
      onRegistrationSubmit(user)
    } else {
      onAuthenticationSubmit({ email, password })
    }

    setEmail("")
    setName("")
    setPassword("")
  }

  const updateUserEmailValueHandler = (
    eventArg: React.ChangeEvent<HTMLInputElement>,
  ) => {
    //this.setState({
    setEmail(eventArg.target.value)
    //})
  }

  const updateUserNameValueHandler = (
    eventArg: React.ChangeEvent<HTMLInputElement>,
  ) => {
    //this.setState({
    setName(eventArg.target.value)
    //})
  }

  const updateUserPasswordValueHandler = (
    eventArg: React.ChangeEvent<HTMLInputElement>,
  ) => {
    //this.setState({
    setPassword(eventArg.target.value)
    //})
  }

  const changeMode = (eventArg: React.MouseEvent<HTMLElement>) => {
    const target = eventArg.target

    if (!(target instanceof HTMLInputElement)) return

    setIsRegistrationMode(target.checked)
  }

  const renderHeader = () => {
    let headerText

    if (isRegistrationMode) {
      headerText = "New user registration"
    } else {
      headerText = "Login"
    }

    return (
      <h3 className="authenticationAndRegistrationForm__Header">
        {headerText}
      </h3>
    )
  }

  const renderLabel = () => {
    return (
      <div
        className="authenticationAndRegistrationForm-Label"
        data-align="center"
      ></div>
    )
  }

  const renderUserNameInputField = () => {
    if (isRegistrationMode) {
      return (
        <InputField
          caption="User name"
          name="userName"
          placeholder="User name"
          type="text"
          value={name}
          onChange={updateUserNameValueHandler}
        />
      )
    }
  }

  const renderSubmitButton = () => {
    let buttonText

    if (isRegistrationMode) {
      buttonText = "Sign up"
    } else {
      buttonText = "Sign in"
    }

    return (
      <button className="submitButton" type="submit">
        {buttonText}
      </button>
    )
  }

  return (
    <div className="authenticationAndRegistrationForm">
      <input type="checkbox" name="changeMode" onClick={changeMode} />
      <span>Registration</span>
      <form onSubmit={onSubmitHandler}>
        {renderLabel()}
        <div data-align="center">{renderHeader()}</div>
        {renderUserNameInputField()}
        <InputField
          caption="User email"
          name="userEmail"
          placeholder="User email"
          type="text"
          value={email}
          onChange={updateUserEmailValueHandler}
        />
        <InputField
          caption="User password"
          name="userPassword"
          placeholder="User password"
          type="text"
          value={password}
          onChange={updateUserPasswordValueHandler}
        />
        <div data-align="center">{renderSubmitButton()}</div>
      </form>
    </div>
  )
}

export default AuthAndRegForm
