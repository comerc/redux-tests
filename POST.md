На примере обычного блога (получение из API данных для posts-comments), продемонстрирую, как покрываю тестами redux-слой. Исходники доступны [тут](http://github.com/comerc/redux-layer-tests).

Вместо разделенных actions и reducers, применяю [ducks-pattern](https://github.com/erikras/ducks-modular-redux), который сильно упрощает как разработку, так и тестирование redux-а в приложении. А ещё применяю крайне полезный инструмент - redux-act, но важно в поле description метода createAction() использовать исключительно: цифры, заглавные буквы и подчеркивания [proof](https://github.com/pauldijou/redux-act#createactiondescription-payloadreducer-metareducer).

Для начала тест для простого "action creator" типа `{ type, payload }` - app.setLoading():
```
// src/ducks/app.js
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
```

Минимум для первого запуска теста:
```
// src/ducks/__tests__/app.test.js
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
    console.log(actions)
    // ...остальной код будет далее по тексту
  })
})
```

Копирую из консоли значение для expectedActions:
```
    const expectedActions = [{ type: 'APP__SET', payload: true }];
    expect(actions).toEqual(expectedActions);
```

Применяю actions (с данными в payload для каждого action) к рутовому редюсеру, полученному из combineReducers():
```
    actions.forEach(action => {
      state = reducer(state, action)
    })
    expect(state).toEqual({
      ...state,
      app: { ...state.app, isLoading: true },
    })
```

Следует пояснить, что store создается с функцией обратного вызова `mockStore(() => state)` - чтобы обеспечить текущее состояние при вызовах `getState()` внутри сайд-эффектов redux-thunk.

Вот и всё, первый тест готов!

Далее интереснее, тестирую сайд-эффект post.load():
```
// src/ducks/post.js
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
```

Хотя comments.load() тоже экспортируется, но тестировать его отдельно не имеет особого смысла, т.к. он используется только внутри нашего post.load():
```
// src/ducks/comments.js
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
```

Тест сайд-эффекта: 
```
// src/ducks/__tests__/post.test.js
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
const reducerMock = combineReducers({ app, post, comments, router: (state = {}) => state })
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
```

Не знаю, как сделать лучше, но ради инициализации редюсера router, пришлось пересобрать рутовый редюсер в reducerMock. Добавилось обманки для двух запросов к axios. Ещё к store.dispatch() добавился return, т.к. обернуто в Promise; но есть альтернатива - функция обратного вызова done(): 
```
  it('', done => {
    setTimeout(() => {
      //...
      done()
    }, 1000)
  }
```

А в остальном тест для сайд-эффекта не сложнее теста для простого "action creator". Исходники доступны [тут](http://github.com/comerc/redux-layer-tests).