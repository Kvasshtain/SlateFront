import type React from "react"
//import { useGetBlackboardDataQuery } from "../../../../store/BlackboardsApiSlice"

export interface IBlackboardDescriptionBlockProps {
  id: number
  name: string
  description: string
  onSelectBlackboard: (blackboardId: number, blackboardName: string) => void
  onDeleteBlackboard: (blackboardId: number) => void
}

const BlackboardDescriptionBlock: React.FC<IBlackboardDescriptionBlockProps> = (
  props,
) => {
  const { id, name, description, onSelectBlackboard, onDeleteBlackboard } =
    props

  //const {data = {name: "", description: ""}, isError, isLoading, isSuccess} = useGetBlackboardDataQuery(blackboardId)

  // if (isLoading) {
  //   return (
  //     <div>
  //       <h1>Loading ...</h1>
  //     </div>
  //   )
  // }

  const onGoToBoardClickHandler = () => {
    onSelectBlackboard(id, name)
  }

  const onDeleteClickHandler = () => {
    onDeleteBlackboard(id)
  }

  return (
    <div>
      <span>Name: {name}</span>
      <span>Description: {description}</span>
      <button onClick={onGoToBoardClickHandler}>Go to board</button>
      <button onClick={onDeleteClickHandler}>Delete</button>
    </div>
  )
}

export default BlackboardDescriptionBlock
