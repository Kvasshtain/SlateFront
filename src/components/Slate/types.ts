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
  private _id!: number | string

  public get id(): number | string {
    return this._id
  }

  public set id(str: number | string) {
    this._id = str
  }
}

export { FabObjectWithId }
