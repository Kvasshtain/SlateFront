import { useState, useEffect, useRef } from "react"
import { useAppDispatch, useAppSelector } from "../../app/hooks"

import {
  makeFromDocumentBodyDropImageZone,
  setMainCanvas,
  startConnecting,
} from "./store/slices"

import FabJSCanvas from "./components/FabJSCanvas/FabJSCanvas"
import Blackboard from "./components/Blackboard"
import React from "react"

function Slate() {
  const state = useAppSelector((state) => state.playground)
  const dispatch = useAppDispatch()
  const firstRender = useRef(true)

  useEffect(() => {
    if (!firstRender.current) return
    firstRender.current = false

    dispatch(startConnecting())
    dispatch(makeFromDocumentBodyDropImageZone())
  }, [dispatch])

  return (
    <div>
      {state.connectionState === "Connected" && (
        <React.Fragment>
          <FabJSCanvas />
          <Blackboard />
        </React.Fragment>
      )}
    </div>
  )
}

export default Slate
