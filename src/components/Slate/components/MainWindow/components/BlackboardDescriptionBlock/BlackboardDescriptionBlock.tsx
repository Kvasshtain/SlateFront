import type React from "react"
//import { useGetBlackboardDataQuery } from "../../../../store/BlackboardsApiSlice"

export interface IBlackboardDescriptionBlockProps {
  id: string
  name: string
  description: string
  onSelectBlackboard: (blackboardId: string) => void
  onDeleteBlackboard: (blackboardId: string) => void
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
    onSelectBlackboard(id)
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
