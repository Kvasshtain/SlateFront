import type React from "react"
import PropTypes from "prop-types"

//import './InputField.sass'

export interface IAuthAndRegFormProps {
  caption: string
  name: string
  placeholder: string
  type: string
  value: string
  onChange: (eventArg: React.ChangeEvent<HTMLInputElement>) => void
}

const InputField = (props: IAuthAndRegFormProps) => {
  const { caption, name, placeholder, type, value, onChange } = props

  return (
    <div className="inputField">
      <label>{caption}</label>
      <input
        name={name}
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}

export default InputField
