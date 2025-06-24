import { render, screen } from '@testing-library/react';
import { RouteGuard, RouteGuardProps } from './RouteGuard';
import { BrowserRouter, Route, Routes } from 'react-router';

const TestRouter = (props: Pick<RouteGuardProps, 'evaluation'>) => (
  <BrowserRouter>
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
  </BrowserRouter>
);

describe('RouteGuard component', () => {
  it('should render children when the evaluation function returns true', () => {
    render(<TestRouter evaluation={() => true} />);
    expect(window.location.pathname).toEqual('/');
    expect(screen.getByText('protected content')).toBeInTheDocument();
  });

  it('should redirect to /recovery-route when the evaluation function returns false', () => {
    render(<TestRouter evaluation={() => false} />);
    expect(window.location.pathname).toEqual('/recovery-route');
    expect(screen.queryByText('recovery')).toBeInTheDocument();
  });
});
