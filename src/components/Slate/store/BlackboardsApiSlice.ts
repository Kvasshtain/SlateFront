import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export interface NewBlackboardData {
  name: string
  description: string
  ownerId: string
}

export interface BlackboardData {
  id: string
  name: string
  description: string
}

// export interface BlackboardsApiResponse {
//   userBlackboardsIds: string[]
// }

interface BlackboardApiResponse {
  isSuccess: boolean
  failureReason: string
}

export const blackboardsApiSlice = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:5288" }),
  reducerPath: "blackboardsApi",
  tagTypes: ["Blackboards"],
  endpoints: (build) => ({
    getUserBlackboards: build.query<BlackboardData[], string>({
      query: (userId) => `userBlackboards/${userId}`,
      providesTags: (result, error, arg) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Blackboards" as const, id })),
              { type: "Blackboards", id: "LIST" },
            ]
          : [{ type: "Blackboards", id: "LIST" }],
    }),

    // getBlackboardData: build.query<BlackboardData, string>({
    //   query: (blackboardId) => `blackboardData/${blackboardId}`,
    // }),

    createNewBlackboard: build.mutation<
      BlackboardApiResponse,
      NewBlackboardData
    >({
      query: (body: NewBlackboardData) => ({
        url: `newBlackboard`,
        method: "POST",
        body,
        crossDomain: true,
        responseType: "json",
      }),
      invalidatesTags: [{ type: "Blackboards", id: "LIST" }],
    }),

    deleteBlackboard: build.mutation<BlackboardApiResponse, string>({
      query: (id: string) => ({
        url: `deleteBlackboard/${id}`,
        method: "DELETE",
        crossDomain: true,
        responseType: "json",
      }),
      invalidatesTags: [{ type: "Blackboards", id: "LIST" }],
    }),
  }),
})

export const {
  useGetUserBlackboardsQuery,
  /*useGetBlackboardDataQuery,*/ useCreateNewBlackboardMutation,
  useDeleteBlackboardMutation,
} = blackboardsApiSlice
