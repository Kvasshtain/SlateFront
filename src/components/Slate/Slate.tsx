import { useState, useEffect, useRef } from "react"
import { useAppDispatch, useAppSelector } from "../../app/hooks"

import {
  initKeyActions,
  makeFromDocumentBodyDropImageZone,
  setMainCanvas,
  startConnecting,
} from "./store/slices"

import FabJSCanvas from "./components/FabJSCanvas/FabJSCanvas"
import Blackboard from "./components/Blackboard"
import React from "react"
import {
  createRoutesFromElements,
  createBrowserRouter,
  Route,
  Routes,
  useNavigate,
  Navigate,
} from "react-router-dom"
import AuthAndRegWindow from "./components/AuthAndReg/AuthAndRegWindow"

const tokenKey = "accessToken"

function Slate() {
  const state = useAppSelector((state) => state.playground)
  const dispatch = useAppDispatch()
  const firstRender = useRef(true)

  //const navigate = useNavigate()

  useEffect(() => {
    if (!firstRender.current) return

    firstRender.current = false

    //dispatch(startConnecting())
    dispatch(makeFromDocumentBodyDropImageZone())
    dispatch(initKeyActions())
  }, [dispatch])

  return (
    <>
      <Routes>
        <Route path="/login" element={<AuthAndRegWindow />} />
        <Route
          path="/blackboard"
          element={
            <div>
              <React.Fragment>
                <FabJSCanvas />
                <Blackboard />
              </React.Fragment>
            </div>
          }
        />
      </Routes>
      <Navigate to="/login" replace={true} />
    </>
  )
}

export default Slate
