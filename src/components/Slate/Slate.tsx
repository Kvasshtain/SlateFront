import { useState, useEffect, useRef } from "react"
import { useAppDispatch, useAppSelector } from "../../app/hooks"

import { setCurrentStep, setSteps, setUnsuccess } from "./store/slices"
import { INTERVAL_TIME, END_GAME_CONDITIONS } from "./constants"

import Controls from "./components/Controls"
import RandomKeys from "./components/RandomKeys"
import KeyPressed from "./components/KeyPressed"
import Score from "./components/Score"
import Modal from "./components/Modal"

import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react"
import type { fabric } from "fabric"

function Slate() {
  const state = useAppSelector((state) => state.playground)
  const dispatch = useAppDispatch()

  const refreshIntervalId = useRef<ReturnType<typeof setInterval> | null>(null)

  const [isTimerActive, setIsTimerActive] = useState<boolean>(false)
  const [isShowModal, setIsShowModal] = useState<boolean>(false)
  const [isSuccessEndGame, setIsSuccessEndGame] = useState<boolean>(false)

  useEffect(() => {
    if (isTimerActive) {
      refreshIntervalId.current = setInterval(() => {
        dispatch(setUnsuccess())
        dispatch(setCurrentStep())
        dispatch(setSteps())
      }, INTERVAL_TIME)
    } else {
      clearInterval(refreshIntervalId.current as number)

      return () => {
        clearInterval(refreshIntervalId.current as number)
      }
    }
  }, [isTimerActive, dispatch])

  useEffect(() => {
    const isSuccessful =
      state.totalSuccessful === END_GAME_CONDITIONS.SUCCESS_COUNT
    const isUnsuccessful =
      state.totalUnsuccessful === END_GAME_CONDITIONS.UNSUCCESS_COUNT

    isSuccessful && setIsSuccessEndGame(true)
    isUnsuccessful && setIsSuccessEndGame(false)

    if (isSuccessful || isUnsuccessful) {
      setIsShowModal(true)
      setIsTimerActive(false)
    }
  }, [state.totalSuccessful, state.totalUnsuccessful])

  const { editor, onReady } = useFabricJSEditor()

  const onAddCircle = () => {
    editor?.addCircle()
  }

  const onAddRectangle = () => {
    editor?.addRectangle()
  }

  editor?.canvas.on(
    //!!!!
    "mouse:down",
    function (options: fabric.IEvent<MouseEvent>) {
      if (!options.e) return

      let evt = options.e
      let textX = evt.pageX
      let textY = evt.pageY
      let value = "test"

      editor.addText(value)

      //createTextInput

      console.log("canvas mouse:down event")
    },
  )

  return (
    <div>
      {state.currentStep}
      <Controls
        isTimerActive={isTimerActive}
        setIsTimerActive={setIsTimerActive}
      />
      <RandomKeys isTimerActive={isTimerActive} />
      <KeyPressed isTimerActive={isTimerActive} />
      <Score />
      <h1>FabricJS React Sample</h1>
      <button onClick={onAddCircle}>Add circle</button>
      <button onClick={onAddRectangle}>Add Rectangle</button>
      <FabricJSCanvas className="sample-canvas" onReady={onReady} />

      {isShowModal && (
        <Modal
          setIsShowModal={setIsShowModal}
          isSuccessEndGame={isSuccessEndGame}
        />
      )}
    </div>
  )
}

export default Slate
