import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

const dispatchError = (message: string, error: Error | null = new Error(message)) => {
  const event = new ErrorEvent('error', { message, error });
  window.dispatchEvent(event);
};

const dispatchRejection = (reason: unknown) => {
  const event = new Event('unhandledrejection') as PromiseRejectionEvent & {
    reason: unknown;
    promise: Promise<unknown>;
  };
  Object.defineProperty(event, 'reason', { value: reason });
  Object.defineProperty(event, 'promise', { value: Promise.reject(reason).catch(() => undefined) });
  window.dispatchEvent(event);
};

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary fallback={<div>fallback</div>}>
        <div>child</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('child')).toBeInTheDocument();
  });

  it('ignores benign ResizeObserver loop window errors', () => {
    render(
      <ErrorBoundary fallback={<div>fallback</div>}>
        <div>child</div>
      </ErrorBoundary>
    );

    dispatchError('ResizeObserver loop limit exceeded', null);

    expect(screen.getByText('child')).toBeInTheDocument();
    expect(screen.queryByText('fallback')).not.toBeInTheDocument();
  });

  it('shows the fallback for real window errors', async () => {
    render(
      <ErrorBoundary fallback={<div>fallback</div>}>
        <div>child</div>
      </ErrorBoundary>
    );

    dispatchError('Something actually broke');

    await waitFor(() => {
      expect(screen.getByText('fallback')).toBeInTheDocument();
    });
  });

  it('ignores benign ResizeObserver loop unhandled rejections', () => {
    render(
      <ErrorBoundary fallback={<div>fallback</div>}>
        <div>child</div>
      </ErrorBoundary>
    );

    dispatchRejection(new Error('ResizeObserver loop completed with undelivered notifications.'));

    expect(screen.getByText('child')).toBeInTheDocument();
    expect(screen.queryByText('fallback')).not.toBeInTheDocument();
  });

  it('shows the fallback for real unhandled rejections', async () => {
    render(
      <ErrorBoundary fallback={<div>fallback</div>}>
        <div>child</div>
      </ErrorBoundary>
    );

    dispatchRejection(new Error('Network request failed'));

    await waitFor(() => {
      expect(screen.getByText('fallback')).toBeInTheDocument();
    });
  });
});
