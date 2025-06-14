// Force React DevTools to recognize our components
export const setupDevTools = () => {
  // Check if React DevTools is available
  const devTools = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
  
  if (devTools) {
    console.log('React DevTools detected, version:', devTools.version);
    
    // Force DevTools to scan for components
    if (devTools.onCommitFiberRoot) {
      console.log('DevTools onCommitFiberRoot available');
    }
    
    if (devTools.onCommitFiberUnmount) {
      console.log('DevTools onCommitFiberUnmount available');
    }
  } else {
    console.warn('React DevTools not detected');
  }
  
  // Try to enable profiling
  if (typeof window !== 'undefined') {
    (window as any).__REACT_DEVTOOLS_APPEND_COMPONENT_STACK__ = true;
  }
};