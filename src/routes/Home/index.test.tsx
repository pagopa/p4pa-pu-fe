import { render } from '@testing-library/react';
import Home from '.';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it } from 'vitest';

describe('Home page', () => {
  const queryClient = new QueryClient();

  it('renders Home without crashing', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Home />
      </QueryClientProvider>
    );
  });
});
