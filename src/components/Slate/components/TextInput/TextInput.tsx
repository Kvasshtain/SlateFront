import { useState, useEffect, useRef } from "react"
import { Fragment } from "react/jsx-runtime"
import type { KeyboardEvent, FocusEvent } from "react"
import type React from "react"
import styles from "./TextInput.module.css"
import type { IFontProperties, IScreenCoordinates } from "../../store/types"
import { addTextOnCanvas } from "../../store/slices"
import { useAppDispatch, useAppSelector } from "../../../../app/hooks"

export interface ITextInputProps {
  textX: number
  textY: number
  value: string
  fontProperty: IFontProperties
  onEndTextEditing: (text: string) => void
}

const TextInput: React.FC<ITextInputProps> = (props) => {
  const { textX, textY, value, fontProperty, onEndTextEditing } = props
  const textAreaHeightRef = useRef(0)
  const textAreaWidthRef = useRef(0)

  const minWidthStyle = 100
  const minHeightStyle = 30

  const divBlockRef = useRef<HTMLDivElement>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const [textContent, setTextContent] = useState<string>("")
  const [initCoordinates] = useState<IScreenCoordinates>({ x: textX, y: textY })
  //setTextContent(value)
  const state = useAppSelector((state) => state.playground)
  const dispatch = useAppDispatch()

  const textAreaStyle: React.CSSProperties = {
    //transfer to css
    position: "fixed",
    overflow: "hidden",
    minWidth: minWidthStyle + "px",
    minHeight: minHeightStyle + "px",
    padding: "0px",
    whiteSpace: "pre-wrap",
    //whiteSpace: "nowrap",

    left: textX.toString() + "px",
    top: textY.toString() + "px",
    fontSize: fontProperty.fontSize + "px",
    fontWeight: fontProperty.fontWeight,
    color: fontProperty.color,
    textDecoration: fontProperty.textDecoration,
    fontStyle: fontProperty.fontStyle,
    fontFamily: fontProperty.fontFamily,
    stroke: fontProperty.stroke,
    strokeWidth: fontProperty.strokeWidth,
    textAlign: fontProperty.textAlign,
    lineHeight: fontProperty.lineHeight.toString(),
  }

  const divStyle: React.CSSProperties = {
    //transfer to css
    position: "fixed",
    zIndex: "-1000",
    //display: "inline-block",

    left: textAreaStyle.left,
    top: textAreaStyle.top,
    whiteSpace: textAreaStyle.whiteSpace,
    minWidth: textAreaStyle.minWidth,
    minHeight: textAreaStyle.minHeight,
    padding: textAreaStyle.padding,
    fontSize: textAreaStyle.fontSize,
    fontWeight: textAreaStyle.fontWeight,
    fontFamily: textAreaStyle.fontFamily,
    lineHeight: textAreaStyle.lineHeight,
    color: `rgba(0, 0, 0, 0)`,
  }

  const onKeyUpHandle = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const textArea = e.target as HTMLTextAreaElement

    const divBlockCurrent = divBlockRef.current

    if (divBlockCurrent === null) {
      return
    }

    const content = textArea.value.replace(/\n/g, "<br>")
    setTextContent(content)

    //setTextContent(content)
    divBlockCurrent.innerHTML = content
    const clientRect = divBlockCurrent.getBoundingClientRect()

    textAreaHeightRef.current = clientRect.height
    textAreaWidthRef.current = clientRect.width

    //textArea.style.height = textAreaHeightRef.current + "px"
    //textArea.style.width = textAreaWeightRef.current + "px"
  }

  useEffect(() => {
    const textAreaElement = textAreaRef.current

    if (!textAreaElement) return

    const textAreaStyle = textAreaElement.style

    textAreaStyle.fontSize =
      state.currentCanvasZoom * fontProperty.fontSize + "px"

    textAreaStyle.minHeight = state.currentCanvasZoom * minHeightStyle + "px"

    textAreaStyle.height =
      state.currentCanvasZoom * textAreaHeightRef.current + "px"

    textAreaStyle.minWidth = state.currentCanvasZoom * minWidthStyle + "px"

    textAreaStyle.width =
      state.currentCanvasZoom * textAreaWidthRef.current + "px"
  })

  const onBlurHandle = (e: FocusEvent<HTMLTextAreaElement>) => {
    //textEditingEndHandler(textArea);
    // textArea.remove();
    // hiddenDiv.remove();

    const textArea = e.target as HTMLTextAreaElement
    const content = textArea.value

    onEndTextEditing(content)
    //dispatch(addTextOnCanvas(content))
  }

  return (
    <Fragment>
      <textarea
        ref={textAreaRef}
        onKeyUp={onKeyUpHandle}
        onBlur={onBlurHandle}
        style={textAreaStyle}
        defaultValue={value}
      ></textarea>
      <div ref={divBlockRef} style={divStyle}>
        textContent
      </div>
    </Fragment>
  )
}

export default TextInput
