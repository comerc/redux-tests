import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import { load } from '../post'
import { combineReducers } from 'redux'
import app from '../app'
import post from '../post'
import comments from '../comments'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)
const axiosMock = new AxiosMockAdapter(axios)
const reducerMock = combineReducers({ app, post, comments, router: (state = {}) => state })

describe('sideeffects', () => {
  afterEach(() => {
    axiosMock.reset()
  })
  it('load()', done => {
    const postResponse = {
      userId: 1,
      id: 1,
      title: 'title',
      body: 'body',
    }
    axiosMock.onGet('/posts/1').reply(200, postResponse)
    const commentsResponse = [
      {
        postId: 1,
        id: 1,
        name: 'name',
        email: 'email@example.com',
        body: 'body',
      },
    ]
    axiosMock.onGet('/comments?postId=1').reply(200, commentsResponse)
    let state = {
      router: {
        location: {
          pathname: '/posts/1',
        },
      },
    }
    const store = mockStore(() => state)
    store.dispatch(load()).then(() => {
      const actions = store.getActions()
      const expectedActions = [
        {
          type: 'POST__SET',
          payload: postResponse,
        },
        { type: 'COMMENTS__SET', payload: commentsResponse },
      ]
      actions.forEach(action => {
        state = reducerMock(state, action)
      })
      expect(state).toEqual({
        ...state,
        post: { ...state.post, ...postResponse },
        comments: [...commentsResponse],
      })
      done()
    })
  })
})
