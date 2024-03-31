import { MAP_ARROW_CODES } from "../../../../constants"
import type { IMapArrowCodes } from "../../../../types"
import { useAppSelector } from "../../../../../../app/hooks"
import type { IPlaygroundStepsState } from "../../../../store/types"

import styles from "./RandomArrrows.module.css"

const RandomArrows: React.FC = () => {
  const state = useAppSelector((state) => state.playground)

  const getStylesRandomKeys = (element: IPlaygroundStepsState): string => {
    if (element.success && element.success !== null) {
      return styles.iconSuccess
    }
    if (!element.success && element.success !== null) {
      return styles.iconUnsuccess
    }

    return styles.icon
  }

  return (
    <>
      {state.steps.map((element) => (
        <span key={element.step} className={getStylesRandomKeys(element)}>
          {MAP_ARROW_CODES[element.currentValue as keyof IMapArrowCodes]}
        </span>
      ))}
    </>
  )
}

export default RandomArrows
