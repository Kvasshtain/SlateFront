import { useState, useEffect, useRef } from "react"
import { useAppDispatch, useAppSelector } from "../../app/hooks"

import { startConnecting } from "./store/slices"

import FabJSCanvas from "./components/FabJSCanvas/FabJSCanvas"
import Blackboard from "./components/Blackboard"
import React from "react"

function Slate() {
  const state = useAppSelector((state) => state.playground)
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(startConnecting())
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
