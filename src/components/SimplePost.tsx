import React from 'react';

interface SimplePostProps {
  id: string;
  content: string;
}

const SimplePost: React.FC<SimplePostProps> = ({ id, content }) => {
  return (
    <div className="border p-4 m-2 bg-gray-100">
      <h3>Post {id}</h3>
      <p>{content}</p>
      <button onClick={() => console.log('Voted on post', id)}>
        Vote
      </button>
    </div>
  );
};

SimplePost.displayName = 'SimplePost';

export default SimplePost;