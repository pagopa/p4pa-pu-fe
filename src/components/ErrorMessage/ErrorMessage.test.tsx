import { screen } from '@testing-library/react';
import { ErrorMessage } from './ErrorMessage';
import { AlertProps } from '@mui/material';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import { render } from '../../__tests__/renderers';

describe('ErrorMessage', () => {
  beforeEach(() => {
    i18nTestSetup({
      'commons.filters.atLeastOneFilter': 'Devi impostare almeno un filtro'
    });
  });

  it('should render with default props', () => {
    render(<ErrorMessage />);

    const alert = screen.getByTestId('alert-filter-error');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveClass('MuiAlert-standard');
    expect(
      screen.getByText('Devi impostare almeno un filtro')
    ).toBeInTheDocument();
  });

  it('should render with outlined variant', () => {
    render(<ErrorMessage variant="outlined" />);

    const alert = screen.getByTestId('alert-filter-error');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveClass('MuiAlert-outlined');
    expect(
      screen.getByText('Devi impostare almeno un filtro')
    ).toBeInTheDocument();
  });

  it('should render with filled variant', () => {
    render(<ErrorMessage variant="filled" />);

    const alert = screen.getByTestId('alert-filter-error');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveClass('MuiAlert-filled');
  });

  it('should render with custom testId', () => {
    render(<ErrorMessage testId="custom-error-id" />);

    const alert = screen.getByTestId('custom-error-id');
    expect(alert).toBeInTheDocument();
    expect(screen.queryByTestId('alert-filter-error')).not.toBeInTheDocument();
  });

  it('should have error severity', () => {
    render(<ErrorMessage />);

    const alert = screen.getByTestId('alert-filter-error');
    expect(alert).toHaveClass('MuiAlert-colorError');
  });

  it('should display translated message', () => {
    i18nTestSetup({
      'commons.filters.atLeastOneFilter': 'Custom error message'
    });

    render(<ErrorMessage />);

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('should render with all possible variants', () => {
    const variants: Array<AlertProps['variant']> = [
      'standard',
      'outlined',
      'filled'
    ];

    variants.forEach((variant) => {
      const { unmount } = render(
        <ErrorMessage variant={variant} testId={`test-${variant}`} />
      );

      const alert = screen.getByTestId(`test-${variant}`);
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveClass(`MuiAlert-${variant}`);

      unmount();
    });
  });

  it('should maintain accessibility attributes', () => {
    render(<ErrorMessage />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute('data-testid', 'alert-filter-error');
  });
});
