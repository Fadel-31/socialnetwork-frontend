import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [commentTexts, setCommentTexts] = useState({}); // track comment inputs per post

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/posts/feed', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(res.data);
    } catch (err) {
      console.error('Failed to fetch posts');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`/api/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update like count in UI
      setPosts(posts.map(post =>
        post._id === postId ? { ...post, likes: post.likes.includes(token) ? post.likes.filter(id => id !== token) : [...post.likes, token] } : post
      ));
      fetchPosts(); // simpler to just refresh posts
    } catch {
      alert('Failed to like/unlike post');
    }
  };

  const handleCommentChange = (postId, text) => {
    setCommentTexts(prev => ({ ...prev, [postId]: text }));
  };

  const handleCommentSubmit = async (postId) => {
    const text = commentTexts[postId];
    if (!text) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/posts/${postId}/comment`, { text }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCommentTexts(prev => ({ ...prev, [postId]: '' }));
      fetchPosts();
    } catch {
      alert('Failed to add comment');
    }
  };

  return (
    <div>
      <h2>Feed</h2>
      {posts.length === 0 && <p>No posts yet</p>}
      {posts.map(post => (
        <div key={post._id} style={{ border: '1px solid gray', marginBottom: '20px', padding: '10px' }}>
          <p><strong>{post.author.username}</strong> says:</p>
          <img src={post.imageUrl} alt="Post" style={{ maxWidth: '300px' }} />
          <p>{post.description}</p>
          <button onClick={() => handleLike(post._id)}>
            Like ({post.likes.length})
          </button>
          <div>
            <h4>Comments:</h4>
            {post.comments.length === 0 && <p>No comments</p>}
            {post.comments.map(comment => (
              <p key={comment._id}><strong>{comment.user.username}:</strong> {comment.text}</p>
            ))}
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentTexts[post._id] || ''}
              onChange={e => handleCommentChange(post._id, e.target.value)}
            />
            <button onClick={() => handleCommentSubmit(post._id)}>Comment</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Feed;
