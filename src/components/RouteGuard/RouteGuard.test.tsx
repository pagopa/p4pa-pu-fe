import { render, screen } from '@testing-library/react';
import { RouteGuard, RouteGuardProps } from './RouteGuard';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const FakeGuardedRouter = (props: Pick<RouteGuardProps, 'evaluation'>) => (
  <MemoryRouter>
    <Routes>
      <Route path="/recovery-route" element={<p>recovery</p>} />
      <Route
        path="/"
        element={
          <RouteGuard
            evaluation={props.evaluation}
            redirectTo="/recovery-route"
          >
            <p>protected content</p>
          </RouteGuard>
        }
      />
    </Routes>
  </MemoryRouter>
);

describe('RouteGuard component', () => {
  it('should redirect to /recovery-route when the evaluation function return false', () => {
    render(<FakeGuardedRouter evaluation={() => false} />);
    expect(screen.queryByText('recovery')).toBeInTheDocument();
  });

  it('should render children when the evaluation function return false', () => {
    render(<FakeGuardedRouter evaluation={() => true} />);
    expect(screen.getByText('protected content')).toBeInTheDocument();
  });
});
