import React, { useEffect } from 'react';

const ReactDebugger: React.FC = () => {
  useEffect(() => {
    // Check if React DevTools is available
    const devTools = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
    console.log('React DevTools available:', !!devTools);
    
    if (devTools) {
      console.log('React DevTools version:', devTools.version);
      console.log('React DevTools renderers:', devTools.renderers);
    }
    
    // Check React fiber
    const rootElement = document.getElementById('root');
    if (rootElement) {
      const reactFiber = (rootElement as any)._reactRootContainer;
      console.log('React Fiber Root:', reactFiber);
    }
    
    // Check all React components in the tree
    console.log('React components in window:', Object.keys(window).filter(key => key.startsWith('__react')));
  }, []);
  
  return null;
};

export default ReactDebugger;