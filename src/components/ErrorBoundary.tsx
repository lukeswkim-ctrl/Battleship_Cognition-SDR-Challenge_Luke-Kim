import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled error in Battleship UI:', error, info.componentStack);
  }

  private handleReset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-red-400 mb-2">Something went wrong</h1>
        <p className="text-slate-400 max-w-md mb-4">
          The game hit an unexpected error and stopped. You can try again — if it keeps
          happening, reload the page.
        </p>
        <pre className="text-xs text-slate-500 bg-slate-900 border border-slate-700 rounded p-3 max-w-md overflow-auto mb-4">
          {error.message}
        </pre>
        <button
          type="button"
          onClick={this.handleReset}
          className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded hover:bg-emerald-700"
        >
          Try Again
        </button>
      </div>
    );
  }
}
