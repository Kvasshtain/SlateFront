import type { Action, ThunkAction } from "@reduxjs/toolkit"
import { combineSlices, configureStore } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/query"

import { slateSlice } from "../components/Slate/store/slices"
import createSignalMiddleware from "../signalR/signalMiddleware"
import createHubConnection from "../signalR/createHubConnection"
import fabCanvasMiddleware from "../fabCanvas/fabCanvasMiddleware"
import { authRegApiSlice } from "../components/Slate/store/AuthRegApiSlice"
import { blackboardsApiSlice } from "../components/Slate/store/BlackboardsApiSlice"
import { quotesApiSlice } from "../components/Slate/store/TestApiSlice"

// `combineSlices` automatically combines the reducers using
// their `reducerPath`s, therefore we no longer need to call `combineReducers`.
export const rootReducer = combineSlices(
  slateSlice,
  authRegApiSlice,
  blackboardsApiSlice,
  quotesApiSlice,
) //!!!!!!!!!!Вернуть назад!!!!!!!
//export const rootReducer = combineSlices(slateSlice, quotesApiSlice) //!!!!!!!!УДАДИ!!!!!!!
// Infer the `RootState` type from the root reducer
export type RootState = ReturnType<typeof rootReducer>

//export const hubConnection = createHubConnection()

// The store setup is wrapped in `makeStore` to allow reuse
// when setting up tests that need the same store config
export const makeStore = (preloadedState?: Partial<RootState>) => {
  const store = configureStore({
    reducer: rootReducer,
    // Adding the api middleware enables caching, invalidation, polling,
    // and other useful features of `rtk-query`.
    middleware: (getDefaultMiddleware) => {
      return getDefaultMiddleware().concat(
        quotesApiSlice.middleware,
        authRegApiSlice.middleware,
        blackboardsApiSlice.middleware,
        createSignalMiddleware(),
        fabCanvasMiddleware(),
      )
    },
    preloadedState,
  })
  // configure listeners using the provided defaults
  // optional, but required for `refetchOnFocus`/`refetchOnReconnect` behaviors
  setupListeners(store.dispatch)
  return store
}

export const store = makeStore()

// Infer the type of `store`
export type AppStore = typeof store
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = AppStore["dispatch"]
export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  unknown,
  Action
>
