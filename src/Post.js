import React from 'react'
import { connect } from 'react-redux'
import { setLoading } from './ducks/app'
import { load } from './ducks/post'

const mapStateToProps = state => ({
  isLoading: state.app.isLoading,
  post: state.post,
  comments: state.comments,
})

const WrappedPost = connect(mapStateToProps)(
  class Post extends React.Component {
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
      const { isLoading, post, comments } = this.props
      if (isLoading) {
        return <div>Loading...</div>
      }
      return (
        <div>
          <h1>Post</h1>
          <div>userId: {post.userId}</div>
          <div>title: {post.title}</div>
          <div>body: {post.body}</div>
          <h2>Comments</h2>
          {comments.map(comment => (
            <div key={comment.id}>
              <hr />
              <div>id: {comment.id}</div>
              <div>name: {comment.name}</div>
              <div>email: {comment.email}</div>
              <div>body: {comment.body}</div>
            </div>
          ))}
        </div>
      )
    }
  },
)

export default WrappedPost
