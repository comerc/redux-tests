import { createAction, createReducer } from 'redux-act'
import axios from 'axios'

export const REDUCER = 'POSTS'
const NS = `${REDUCER}__`

export const initialState = []

const reducer = createReducer({}, initialState)

const set = createAction(`${NS}SET`)
reducer.on(set, (state, posts) => [...posts])

export const load = () => dispatch => {
  return axios.get('/posts').then(response => {
    dispatch(set(response.data))
  })
}

export default reducer
