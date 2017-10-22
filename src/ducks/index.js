import { combineReducers } from 'redux'
import app from './app'
import posts from './posts'
import post from './post'
import comments from './comments'

export default combineReducers({
  app,
  posts,
  post,
  comments,
})
