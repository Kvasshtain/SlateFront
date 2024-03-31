// import styles from "./ResultMessage.module.css"

export interface IResultMessageProps {
  isSuccessEndGame: boolean
}

const ResultMessage: React.FC<IResultMessageProps> = (props) => {
  const { isSuccessEndGame } = props

  return isSuccessEndGame ? (
    <span>
      Congratulations! <br /> You are winnner!
    </span>
  ) : (
    <span>
      My regrets. <br /> You are looser!
    </span>
  )
}

export default ResultMessage
