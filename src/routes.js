import App from './App'
import Posts from './Posts'
import Post from './Post'

export default [
  {
    component: App,
    routes: [
      {
        path: '/',
        exact: true,
        component: Posts,
      },
      {
        path: '/posts/:id',
        component: Post,
      },
    ],
  },
]
