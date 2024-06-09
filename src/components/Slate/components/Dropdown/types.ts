import type { ReactNode } from "react"

export enum Behaviour {
  SINGLE,
  MULTIPLE,
}

type CommonProps = {
  label: ReactNode
  //view: ReactNode
}

type SingleProps<TItem = any> = {
  behaviour: Behaviour.SINGLE
  value: TItem
  onChange(item: TItem): void
} & CommonProps

type MultipleProps<TItem = any> = {
  behaviour: Behaviour.MULTIPLE
  value: TItem[]
  onChange(items: TItem[]): void
} & CommonProps

export type IDropdownProps<TItem = any> =
  | SingleProps<TItem>
  | MultipleProps<TItem>

// export interface IDropdownProps<TItem = any> {
//   label: ReactNode
//   onChange: (item: TItem) => void
//   // children: Element[]
// }
