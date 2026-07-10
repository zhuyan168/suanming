import React from 'react';
import { trackClientErrorEvent } from '../lib/clientErrorEvents';

interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
}

interface GlobalErrorBoundaryState {
  hasError: boolean;
}

export default class GlobalErrorBoundary extends React.Component<
  GlobalErrorBoundaryProps,
  GlobalErrorBoundaryState
> {
  state: GlobalErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): GlobalErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (typeof window === 'undefined') return;

    void trackClientErrorEvent({
      source: 'react_error_boundary',
      message: error.message || 'React render error',
      stack: error.stack,
      componentStack: info.componentStack,
      pagePath: `${window.location.pathname}${window.location.search}`,
      locale: document.documentElement.lang || null,
      browser: [
        navigator.platform,
        navigator.language,
        `${window.innerWidth}x${window.innerHeight}`,
      ].filter(Boolean).join(' | '),
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background px-4 py-16 text-white">
          <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center">
            <span className="material-symbols-outlined mb-4 block text-5xl text-primary">
              error
            </span>
            <h1 className="text-xl font-bold">Something went wrong</h1>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              Please refresh the page and try again.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/85"
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
