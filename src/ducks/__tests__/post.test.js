import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import { combineReducers } from 'redux'
import post, { load } from '../post'
import comments from '../comments'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)
const reducerMock = combineReducers({
  post,
  comments,
  router: (state = {}) => state,
})
const axiosMock = new AxiosMockAdapter(axios)

describe('sideeffects', () => {
  afterEach(() => {
    axiosMock.reset()
  })
  it('load()', () => {
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
    return store.dispatch(load()).then(() => {
      const actions = store.getActions()
      const expectedActions = [
        {
          type: 'POST__SET',
          payload: postResponse,
        },
        { type: 'COMMENTS__SET', payload: commentsResponse },
      ]
      expect(actions).toEqual(expectedActions)
      //
      actions.forEach(action => {
        state = reducerMock(state, action)
      })
      expect(state).toEqual({
        ...state,
        post: { ...state.post, ...postResponse },
        comments: [...commentsResponse],
      })
    })
  })
})
