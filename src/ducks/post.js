import { createAction, createReducer } from 'redux-act'
import { matchPath } from 'react-router'
import axios from 'axios'
import { load as loadComments } from './comments'

export const REDUCER = 'POST'
const NS = `${REDUCER}__`

export const initialState = {}

const reducer = createReducer({}, initialState)

const set = createAction(`${NS}SET`)
reducer.on(set, (state, post) => ({ ...post }))

export const load = () => (dispatch, getState) => {
  const state = getState()
  const match = matchPath(state.router.location.pathname, { path: '/posts/:id' })
  const id = match.params.id
  return axios.get(`/posts/${id}`).then(response => {
    dispatch(set(response.data))
    return dispatch(loadComments(id))
  })
}

export default reducer
