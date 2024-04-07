export interface IPlaygroundStepsState {
  step: number
  currentValue: string | null
  enteredValue: string | null
  success: boolean | null
}

export interface ICanvasObject {
  id: string
  data: string
  left: number
  top: number
  scaleX: number
  scaleY: number
  angle: number
}

export interface ISlateState {
  currentStep: number
  steps: IPlaygroundStepsState[]
  totalSuccessful: number
  totalUnsuccessful: number
  currentAddedCanvasObject: ICanvasObject | null
  sentBlackboarObjId: string | null
}
