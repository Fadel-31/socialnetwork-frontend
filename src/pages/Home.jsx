// src/pages/Home.jsx (or FeedPage.jsx, whatever fits your structure)
import React, { useState } from 'react';
import CreatePost from '../components/CreatePost';
import Feed from '../components/Feed';

const Home = () => {
  const [refreshFeed, setRefreshFeed] = useState(false);

  // When a new post is created, toggle refreshFeed to reload Feed
  const handlePostCreated = () => setRefreshFeed(prev => !prev);

  return (
    <div>
      <CreatePost onPostCreated={handlePostCreated} />
      <Feed key={refreshFeed} />
    </div>
  );
};

export default Home;
