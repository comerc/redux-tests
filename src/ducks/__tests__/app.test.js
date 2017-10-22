import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import { setLoading } from '../app'
import reducer from '..'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('sync ducks', () => {
  it('setLoading()', () => {
    let state = {}
    const store = mockStore(() => state)
    store.dispatch(setLoading(true))
    const actions = store.getActions()
    const expectedActions = [{ type: 'APP__SET', payload: true }]
    expect(actions).toEqual(expectedActions)
    actions.forEach(action => {
      state = reducer(state, action)
    })
    expect(state).toEqual({
      ...state,
      app: { ...state.app, isLoading: true },
    })
  })
})
