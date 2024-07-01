import type { PropsWithChildren } from "react"
import React, { useRef } from "react"
import {
  useState,
  type ReactNode,
  Children,
  isValidElement,
  cloneElement,
  useEffect,
  useMemo,
} from "react"
import styled from "styled-components"
import MenuItem from "./components/MenuItem"
import { Behaviour, type IDropdownProps } from "./types"
import { createPortal } from "react-dom"

type Coords = {
  left: number
  top: number
  width: number
}

const Dropdown = <T extends unknown>(
  props: PropsWithChildren<IDropdownProps<T>>,
) => {
  const { label, children, onChange } = props

  const [isOpen, setOpen] = useState(false)
  const highlightedIndexRef = useRef(-1)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const elements = useRef<Record<number, HTMLDivElement>>({})
  const items = useMemo(() => Children.toArray(children), [children])

  // const controlRef = useRef<HTMLButtonElement>(null)
  // const [coords, setCoords] = useState<Coords | null>(null)

  const indexes = useMemo(
    () =>
      items.reduce<Array<number>>((result, item, index) => {
        if (React.isValidElement(item)) {
          if (!item.props.disabled && item.type === MenuItem) {
            result.push(index)
          }
        }

        return result
      }, []),
    [items],
  )

  const handleOpen = () => setOpen(true)

  const handleChange = (item: T) => {
    switch (props.behaviour) {
      case Behaviour.SINGLE: {
        props.onChange(item)
        setOpen(false)
        break
      }
      case Behaviour.MULTIPLE: {
        props.value.includes(item)
          ? props.onChange(props.value.filter((value) => value !== item))
          : props.onChange([...props.value, item])
        break
      }
    }
  }

  const length = Children.count(children)

  let index

  const handleKeyDown = (ev: KeyboardEvent) => {
    switch (ev.code) {
      case "ArrowDown":
        ev.preventDefault()
        ev.stopPropagation()
        index =
          highlightedIndexRef.current === indexes.length - 1
            ? 0
            : highlightedIndexRef.current + 1

        //!!!!! Вынеси в отдельную функцию
        elements.current[indexes[index]]?.scrollIntoView({
          block: "nearest",
        })

        highlightedIndexRef.current = index
        setHighlightedIndex(index)
        break
      case "ArrowUp": {
        ev.preventDefault()
        ev.stopPropagation()
        index =
          highlightedIndexRef.current === 0
            ? indexes.length - 1
            : highlightedIndexRef.current - 1

        //!!!!! Вынеси в отдельную функцию
        elements.current[indexes[index]]?.scrollIntoView({
          block: "nearest",
        })

        highlightedIndexRef.current = index
        setHighlightedIndex(index)
        break
      }
      case "Enter": {
        ev.preventDefault()
        ev.stopPropagation()
        const item = items[indexes[highlightedIndexRef.current]]

        if (highlightedIndexRef.current !== -1 && isValidElement(item)) {
          handleChange(item.props.value)
        }
        break
      }
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown, true)
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true)
    }
  }, [isOpen])

  // const getCoords = (): Coords | null => {
  //   const box = controlRef.current?.getBoundingClientRect()

  //   if (box) {
  //     return {
  //       left: box.left,
  //       top: box.top + box.height,
  //       width: box.width,
  //     }
  //   }

  //   return null
  // }

  // useEffect(() => {
  //   if (!isOpen) return

  //   const coords = getCoords()
  //   setCoords(coords)
  // }, [isOpen])

  // if (!coords) return <></>

  // return (
  //   <Root>
  //     <Control onClick={handleOpen} type="button">
  //       {label}
  //     </Control>
  //     {isOpen &&
  //       coords &&
  //       createPortal(
  //         <>
  //           <Backdrop onClick={() => setOpen(false)} />
  //           <Menu coords={coords}>
  //             {Children.map(children, (child, index) => {
  //               if (isValidElement(child)) {
  //                 return cloneElement(child, {
  //                   active: index === indexes[highlightedIndex],
  //                   onMouseEnter: () =>
  //                     setHighlightedIndex(indexes.indexOf(index)),
  //                   onClick: (ev: MouseEvent) => {
  //                     ev.stopPropagation()
  //                     handleChange(child.props.value)
  //                   },
  //                   ref: (node: HTMLDivElement) => {
  //                     elements.current[index] = node
  //                   },
  //                 })
  //               }
  //             })}
  //           </Menu>
  //         </>,
  //         document.body,
  //       )}
  //   </Root>
  // )

  return (
    <Root>
      <Control onClick={handleOpen} type="button">
        {label}
      </Control>
      {isOpen && (
        <>
          <Backdrop onClick={() => setOpen(false)} />
          <Menu>
            {Children.map(children, (child, index) => {
              if (isValidElement(child)) {
                return cloneElement(child, {
                  active: index === indexes[highlightedIndex],
                  onMouseEnter: () =>
                    setHighlightedIndex(indexes.indexOf(index)),
                  onClick: (ev: MouseEvent) => {
                    ev.stopPropagation()
                    handleChange(child.props.value)
                  },
                  ref: (node: HTMLDivElement) => {
                    elements.current[index] = node
                  },
                })
              }
            })}
          </Menu>
        </>
      )}
    </Root>
  )
}

const Root = styled.div``

const Control = styled.button`
  width: 100%;
  margin: 0;
  padding: 0;
`

// const Menu = styled.menu<{ coords: Coords }>`
//   position: absolute;
//   left: ${(p) => `${p.coords.left}px`};
//   top: ${(p) => `${p.coords.top}px`};
//   min-width: ${(p) => `${Math.max(150, p.coords.width)}px`};
//   margin: 1px 0 0;
//   padding: 0;
//   border: 1px solid #bebebe;
//   max-height: 100px;
//   overflow-y: auto;
// `

const Menu = styled.menu`
  position: absolute;
  margin: 1px 0 0;
  padding: 0;
  border: 1px solid #bebebe;
  max-height: 100px;
  overflow-y: auto;
`

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
`

export default Dropdown
