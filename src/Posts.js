import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { setLoading } from './ducks/app'
import { load } from './ducks/posts'

const mapStateToProps = state => ({
  isLoading: state.app.isLoading,
  posts: state.posts,
})

const WrappedPosts = connect(mapStateToProps)(
  class Posts extends React.Component {
    componentWillMount() {
      this.props.dispatch(setLoading(true))
    }

    componentDidMount() {
      this.props
        .dispatch(load())
        .catch(error => console.log(error))
        .then(() => this.props.dispatch(setLoading(false)))
    }

    render() {
      const { isLoading, posts } = this.props
      if (isLoading) {
        return <div>Loading...</div>
      }
      return (
        <div>
          <h1>Posts</h1>
          {posts.map(post => (
            <div key={post.id}>
              <Link to={`/posts/${post.id}`}>{post.title}</Link>
            </div>
          ))}
        </div>
      )
    }
  },
)

export default WrappedPosts
