import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorDebugger extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorDebugger caught an error:', error, errorInfo);
    console.error('Error stack:', error.stack);
    console.error('Component stack:', errorInfo.componentStack);
    
    // Log specific details about InvalidCharacterError
    if (error.message?.includes('InvalidCharacterError') || error.message?.includes("The tag name provided")) {
      console.error('DETECTED InvalidCharacterError:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }
    
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-900 text-white p-8">
          <h1 className="text-2xl font-bold mb-4">Error Detected</h1>
          <div className="bg-red-800 p-4 rounded mb-4">
            <h2 className="text-lg font-semibold mb-2">Error Message:</h2>
            <p className="font-mono text-sm">{this.state.error?.message}</p>
          </div>
          <div className="bg-red-800 p-4 rounded mb-4">
            <h2 className="text-lg font-semibold mb-2">Stack Trace:</h2>
            <pre className="text-xs overflow-auto">{this.state.error?.stack}</pre>
          </div>
          <div className="bg-red-800 p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">Component Stack:</h2>
            <pre className="text-xs overflow-auto">{this.state.errorInfo?.componentStack}</pre>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 rounded"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorDebugger;