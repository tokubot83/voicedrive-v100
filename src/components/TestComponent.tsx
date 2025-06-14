import React from 'react';

const TestComponent: React.FC = () => {
  React.useEffect(() => {
    console.log('TestComponent mounted');
    console.log('React version:', React.version);
  }, []);

  return (
    <div id="test-component" style={{ padding: '20px', background: 'red', color: 'white' }}>
      <h1>React Test Component</h1>
      <p>If you can see this, React is rendering properly!</p>
    </div>
  );
};

export default TestComponent;