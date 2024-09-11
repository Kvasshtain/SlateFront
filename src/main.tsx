import React from "react"
import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"
import App from "./App"
import { store } from "./app/store"
import "./index.css"

import {
  createRoutesFromElements,
  createBrowserRouter,
  RouterProvider,
  Route,
  Routes,
} from "react-router-dom"

const container = document.getElementById("root")

if (container) {
  const root = createRoot(container)

  const router = createBrowserRouter([
    {
      path: "/*",
      element: <App />,
    },
  ])

  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </React.StrictMode>,
  )
} else {
  throw new Error(
    "Root element with ID 'root' was not found in the document. Ensure there is a corresponding HTML element with the ID 'root' in your HTML file.",
  )
}
