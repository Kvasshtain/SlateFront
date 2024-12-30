import { useState, type FormEvent } from "react"
import type React from "react"

import InputField from "../../../InputField"
import type { NewBlackboardData } from "../../../../store/BlackboardsApiSlice"
import { useAppSelector } from "../../../../../../app/hooks"
import type { ISlateState } from "../../../../store/types"

export interface IAuthAndRegFormProps {
  onNewBlackboardSubmit: (newBlackboardData: NewBlackboardData) => void
}

const NewBlackboardForm: React.FC<IAuthAndRegFormProps> = (props) => {
  const state: ISlateState = useAppSelector((state) => state.playground)

  const [newBlackboardName, setNewBlackboardName] = useState("")
  const [newBlackboardDescription, setNewBlackboardDescription] = useState("")

  const onSubmitHandler = (eventArg: FormEvent<HTMLFormElement>) => {
    eventArg.preventDefault()
    const { onNewBlackboardSubmit } = props
    onNewBlackboardSubmit({
      name: newBlackboardName,
      description: newBlackboardDescription,
      ownerId: state.userId?.toString() ?? "",
    })
  }

  const updateBlackboardNameValueHandler = (
    eventArg: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setNewBlackboardName(eventArg.target.value)
  }

  const updateBlackboardDescriptionValueHandler = (
    eventArg: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setNewBlackboardDescription(eventArg.target.value)
  }

  return (
    <div className="authenticationAndRegistrationForm">
      <h3 className="authenticationAndRegistrationForm__Header">
        "New blackboard creation"
      </h3>
      <form onSubmit={onSubmitHandler}>
        <InputField
          caption="New blackboard name"
          name="newBlackboardName"
          placeholder="New blackboard name"
          type="text"
          value={newBlackboardName}
          onChange={updateBlackboardNameValueHandler}
        />
        <InputField
          caption="New blackboard description"
          name="newBlackboardDescription"
          placeholder="New blackboard description"
          type="text"
          value={newBlackboardDescription}
          onChange={updateBlackboardDescriptionValueHandler}
        />
        <button className="submitButton" type="submit">
          "Create new blackboard"
        </button>
      </form>
    </div>
  )
}

export default NewBlackboardForm
