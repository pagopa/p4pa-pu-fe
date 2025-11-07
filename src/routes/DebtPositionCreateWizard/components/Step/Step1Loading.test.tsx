import { render, screen } from '../../../../__tests__/renderers';
import Step1Loading from './Step1Loading';

describe('Step1Loading', () => {
  it('renders Loader with step1 titles and specific loading message key', () => {
    render(<Step1Loading />);

    // Title and subtitle are translation keys in tests
    expect(
      screen.getByText('debtPositionCreateWizard.generalConfiguration.title')
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtPositionCreateWizard.generalConfiguration.subtitle')
    ).toBeInTheDocument();

    // Specific message key for debt position loading
    expect(
      screen.getByText('debtPositionCreateWizard.loadingDebtPosition')
    ).toBeInTheDocument();

    // Loader test id
    expect(screen.getByTestId('step1-loading')).toBeInTheDocument();
  });
});
