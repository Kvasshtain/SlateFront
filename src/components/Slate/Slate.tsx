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
import MainWindow from "./components/MainWindow"
import { useGetQuotesQuery } from "./store/TestApiSlice"

const tokenKey = "accessToken"

function Slate() {
  // const { data, isError, isLoading, isSuccess } =
  // useGetQuotesQuery(5)//useGetQuotesQuery(numberOfQuotes)

  // if (isError) { //!!!!!!!!!!!!!Вернуть!!!!!!!!!
  //   return (
  //     <div>
  //       <h1>There was an error!!!</h1>
  //     </div>
  //   )
  // }

  // if (isLoading) { //!!!!!!!!!!!!!Вернуть!!!!!!!!!
  //   return (
  //     <div>
  //       <h1>Loading...</h1>
  //     </div>
  //   )
  // }

  const state = useAppSelector((state) => state.playground) //!!!!!!!!!!!!!Вернуть!!!!!!!!!
  const dispatch = useAppDispatch() //!!!!!!!!!!!!!Вернуть!!!!!!!!!
  const firstRender = useRef(true) //!!!!!!!!!!!!!Вернуть!!!!!!!!!

  const navigate = useNavigate()

  useEffect(() => {
    if (!firstRender.current) return

    firstRender.current = false

    //dispatch(startConnecting())
    dispatch(makeFromDocumentBodyDropImageZone())
    dispatch(initKeyActions())
  }, [dispatch])

  // return (
  //   <h1>HELLO!!!</h1>
  // )

  // if (!data) {
  //   return (
  //     <h1>Data is undefind</h1>
  //   )
  // }

  // return (
  //   <div>
  //     {data.quotes.map(({ author, quote, id }) => (
  //         <blockquote key={id}>
  //           &ldquo;{quote}&rdquo;
  //           <footer>
  //             <cite>{author}</cite>
  //           </footer>
  //         </blockquote>
  //       ))}
  //   </div>
  // )

  return (
    <>
      <Routes>
        <Route path="/login" element={<AuthAndRegWindow />} />
        <Route path="/mainWindow" element={<MainWindow />} />
        <Route
          path="/blackboard"
          element={
            <div onContextMenu={(e) => e.preventDefault()}>
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
