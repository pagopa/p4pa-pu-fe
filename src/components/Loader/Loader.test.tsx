import { render, screen } from '../../__tests__/renderers';
import Loader from './Loader';

describe('Loader', () => {
  it('renders default loader with title, subtitle and default message', () => {
    render(
      <Loader title="Titolo" subtitle="Sottotitolo" data-testid="test-loader" />
    );

    expect(screen.getByText('Titolo')).toBeInTheDocument();
    expect(screen.getByText('Sottotitolo')).toBeInTheDocument();
    expect(screen.getByText('commons.loading')).toBeInTheDocument();
    const container = screen.getByTestId('test-loader');
    expect(container).toHaveAttribute('role', 'status');
    expect(container).toHaveAttribute('aria-busy');
  });

  it('renders custom message when messageKey is provided', () => {
    render(
      <Loader
        title="A"
        subtitle="B"
        messageKey="debtPositionCreateWizard.loadingDebtPosition"
        data-testid="custom-loader"
      />
    );

    expect(
      screen.getByText('debtPositionCreateWizard.loadingDebtPosition')
    ).toBeInTheDocument();
  });
});
