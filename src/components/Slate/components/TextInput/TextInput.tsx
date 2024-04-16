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
  onEndTextEditing: (text: string, textCoordinates: IScreenCoordinates) => void
}

const TextInput: React.FC<ITextInputProps> = (props) => {
  const { textX, textY, value, fontProperty, onEndTextEditing } = props
  const divBlock = useRef<HTMLDivElement>(null)
  const textArea = useRef<HTMLTextAreaElement>(null)
  const [textContent, setTextContent] = useState<string>("")
  const [initCoordinates] = useState<IScreenCoordinates>({ x: textX, y: textY })
  //setTextContent(value)
  const state = useAppSelector((state) => state.playground)
  const dispatch = useAppDispatch()

  const textAreaStyle: React.CSSProperties = {
    //transfer to css
    position: "absolute",
    overflow: "hidden",
    minWidth: "100px",
    minHeight: "30px",
    padding: "5px",
    whiteSpace: "nowrap",

    left: textX.toString() + "px",
    top: textY.toString() + "px",
    fontSize: fontProperty.fontSize,
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
    position: "absolute",
    zIndex: "-1000",

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
  }

  const onKeyUpHandle = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const textArea = e.target as HTMLTextAreaElement
    const content = textArea.value.replace(/\n/g, "<br>")
    setTextContent(content)
    const divBlockCurrent = divBlock.current

    if (divBlockCurrent === null) {
      return
    }

    //setTextContent(content)
    divBlockCurrent.innerHTML = content
    const clientRect = divBlockCurrent.getBoundingClientRect()
    textArea.style.height = clientRect.height + "px"
    textArea.style.width = clientRect.width + "px"
  }

  const onBlurHandle = (e: FocusEvent<HTMLTextAreaElement>) => {
    //textEditingEndHandler(textArea);
    // textArea.remove();
    // hiddenDiv.remove();

    const textArea = e.target as HTMLTextAreaElement
    const content = textArea.value

    onEndTextEditing(content, initCoordinates)
    //dispatch(addTextOnCanvas(content))
  }

  return (
    <Fragment>
      <textarea
        ref={textArea}
        onKeyUp={onKeyUpHandle}
        onBlur={onBlurHandle}
        style={textAreaStyle}
        defaultValue={value}
      ></textarea>
      <div ref={divBlock} style={divStyle}>
        textContent
      </div>
    </Fragment>
  )
}

export default TextInput
