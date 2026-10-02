import React, { ErrorInfo, ReactNode } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error boundary caught an error:', error, errorInfo);
  }

  componentDidMount() {
    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', this.handlePromiseRejection);
    // Catch global errors
    window.addEventListener('error', this.handleError);
  }

  componentWillUnmount() {
    window.removeEventListener(
      'unhandledrejection',
      this.handlePromiseRejection
    );
    window.removeEventListener('error', this.handleError);
  }

  handlePromiseRejection = (event: PromiseRejectionEvent) => {
    if (this.isBenignError(event.reason?.message)) {
      return;
    }
    console.error('Unhandled promise rejection:', event.reason);
    this.setState({ hasError: true, error: event.reason });
  };

  handleError = (event: ErrorEvent) => {
    if (this.isBenignError(event.message)) {
      return;
    }
    console.error('Global error:', event.error);
    this.setState({ hasError: true, error: event.error });
  };

  // Browsers can raise ResizeObserver loop warnings as window 'error' events
  // with no actual Error object attached; they are harmless and must not
  // trip the app-wide error fallback (most visible right after a hard reload,
  // when layout-observing components like DataGrid mount and recalculate).
  isBenignError = (message?: string): boolean =>
    !!message && message.includes('ResizeObserver loop');

  render() {
    if (this.state.hasError) {
      return <>{this.props.fallback}</>;
    } else {
      return <>{this.props.children}</>;
    }
  }
}

export { ErrorBoundary };
