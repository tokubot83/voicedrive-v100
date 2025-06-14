import React from 'react';
import SimplePost from './SimplePost';

const posts = [
  { id: '1', content: 'This is a test post 1' },
  { id: '2', content: 'This is a test post 2' },
  { id: '3', content: 'This is a test post 3' }
];

const SimpleTimeline: React.FC = () => {
  return (
    <div>
      <h2>Simple Timeline</h2>
      {posts.map(post => (
        <SimplePost key={post.id} id={post.id} content={post.content} />
      ))}
    </div>
  );
};

SimpleTimeline.displayName = 'SimpleTimeline';

export default SimpleTimeline;