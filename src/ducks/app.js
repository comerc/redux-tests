import { createAction, createReducer } from 'redux-act'

export const REDUCER = 'APP'
const NS = `${REDUCER}__`

export const initialState = {
  isLoading: false,
}

const reducer = createReducer({}, initialState)

export const setLoading = createAction(`${NS}SET`)
reducer.on(setLoading, (state, isLoading) => ({ ...state, isLoading }))

export default reducer
