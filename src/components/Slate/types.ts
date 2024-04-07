import { fabric } from "fabric"

export interface IMapArrowCodes {
  ArrowUp: string
  ArrowDown: string
  ArrowLeft: string
  ArrowRight: string
}

export interface IEndGameConditions {
  SUCCESS_COUNT: number
  UNSUCCESS_COUNT: number
}

class FabObjectWithId extends fabric.Object {
  private _id!: string

  public get id(): string {
    return this._id
  }

  public set id(str: string) {
    this._id = str
  }
}

export { FabObjectWithId }
