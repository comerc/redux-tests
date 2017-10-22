import { createAction, createReducer } from 'redux-act'
import axios from 'axios'

export const REDUCER = 'COMMENTS'
const NS = `${REDUCER}__`

export const initialState = []

const reducer = createReducer({}, initialState)

const set = createAction(`${NS}SET`)
reducer.on(set, (state, comments) => [...comments])

export const load = postId => dispatch => {
  return axios.get(`/comments?postId=${postId}`).then(response => {
    dispatch(set(response.data))
  })
}

export default reducer
