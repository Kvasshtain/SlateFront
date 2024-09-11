import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export interface User {
  email: string
  name: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}

interface LoginApiResponse {
  id: number
  userEmail: string
  accessToken: string
  userName: string
}

interface LogOutRespoce {
  success: boolean
}

interface LogOutData {
  userId: number
}

// Define a service using a base URL and expected endpoints
export const authRegApiSlice = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:5288" }),
  reducerPath: "authRegApi",
  tagTypes: ["AuthReg"],
  endpoints: (build) => ({
    getAuthData: build.mutation<LoginApiResponse, LoginData>({
      query: (body: LoginData) => ({
        url: `login`,
        method: "POST",
        body,
        crossDomain: true,
        responseType: "json",
      }),
    }),
    // signOut: build.mutation<LogOutRespoce, LogOutData>({
    //   query: (body: LogOutData) => ({
    //     url: `logout`,
    //     method: "POST",
    //     body,
    //     crossDomain: true,
    //     responseType: "json",
    //   }),
    // }),
  }),
})

export const { useGetAuthDataMutation /*useSignOutMutation*/ } = authRegApiSlice
