import React, { useEffect, useRef } from 'react';

interface ComponentInspectorProps {
  name: string;
  children: React.ReactNode;
}

const ComponentInspector: React.FC<ComponentInspectorProps> = ({ name, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (ref.current) {
      // Check if this element has React fiber
      const fiber = (ref.current as any)._reactInternalFiber || 
                   (ref.current as any)._reactInternalInstance ||
                   (ref.current as any).__reactInternalInstance;
      
      console.log(`Component ${name}:`, {
        element: ref.current,
        fiber: fiber,
        hasReactData: !!(fiber),
        reactProps: (ref.current as any).__reactProps,
        reactEvents: (ref.current as any).__reactEvents
      });
      
      // Try to find React components in children
      const reactComponents = ref.current.querySelectorAll('[data-reactroot]');
      console.log(`React components found in ${name}:`, reactComponents.length);
    }
  }, [name]);
  
  return (
    <div ref={ref} data-component-name={name}>
      {children}
    </div>
  );
};

export default ComponentInspector;