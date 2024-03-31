// import styles from "./KeyPressed.module.css"

import { useEffect, useCallback } from "react"

import { useAppDispatch } from "../../../../app/hooks"
import { setEnteredValue } from "../../store/slices"
import { MAP_ARROW_CODES } from "../../constants"
import { useKeyPressedElement } from "./hooks"

export interface IKeyPressedProps {
  isTimerActive: boolean
}

const KeyPressed: React.FC<IKeyPressedProps> = (props) => {
  const { isTimerActive } = props

  const KeyPressedElement = useKeyPressedElement()

  const dispatch = useAppDispatch()

  const handelKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (
        Object.prototype.hasOwnProperty.call(MAP_ARROW_CODES, e.key) &&
        isTimerActive
      ) {
        dispatch(setEnteredValue(e.key))
      }
    },
    [dispatch, isTimerActive],
  )

  useEffect(() => {
    window.addEventListener("keydown", handelKeyDown)

    return () => {
      window.removeEventListener("keydown", handelKeyDown)
    }
  })

  return (
    <div>
      <h3>KeyPressed</h3>
      <span>{KeyPressedElement}</span>
    </div>
  )
}

export default KeyPressed
