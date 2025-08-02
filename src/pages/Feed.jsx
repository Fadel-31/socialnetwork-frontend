// Example: src/pages/Feed.jsx

import React from 'react';
import CreatePost from '../components/CreatePost';

const Feed = () => {
  return (
    <div>
      <h1>Feed</h1>
      <CreatePost />
      {/* Here you can also add the list of posts (feed) */}
    </div>
  );
};

export default Feed;
