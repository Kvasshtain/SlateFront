export interface IPlaygroundStepsState {
  step: number
  currentValue: string | null
  enteredValue: string | null
  success: boolean | null
}

export interface ISlateState {
  currentStep: number
  steps: IPlaygroundStepsState[]
  totalSuccessful: number
  totalUnsuccessful: number
}
