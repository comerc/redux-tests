import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { routerMiddleware, connectRouter, ConnectedRouter } from 'connected-react-router'
import { composeWithDevTools } from 'redux-devtools-extension'
import createBrowserHistory from 'history/createBrowserHistory'
import { renderRoutes } from 'react-router-config'
import axios from 'axios'
import reducer from './ducks'
import routes from './routes'
import './index.css'
import registerServiceWorker from './registerServiceWorker'

axios.defaults.baseURL = 'https://jsonplaceholder.typicode.com'

const history = createBrowserHistory()
const router = routerMiddleware(history)
const middlewares = [router, thunk]
const store = createStore(connectRouter(history)(reducer), composeWithDevTools(applyMiddleware(...middlewares)))

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>{renderRoutes(routes)}</ConnectedRouter>
  </Provider>,
  document.getElementById('root'),
)
registerServiceWorker()
