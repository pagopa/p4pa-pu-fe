import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import WizardStepWrapper from './WizardStepWrapper';

describe('WizardStepWrapper', () => {
  const defaultProps = {
    title: 'Test Title',
    subtitle: 'Test Subtitle'
  };

  it('should render the title and subtitle correctly', () => {
    render(<WizardStepWrapper {...defaultProps} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('should render children correctly', () => {
    render(
      <WizardStepWrapper {...defaultProps}>
        <div data-testid="test-child">Child Content</div>
      </WizardStepWrapper>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('should use Material-UI Typography components', () => {
    const { container } = render(<WizardStepWrapper {...defaultProps} />);

    const headingElement = container.querySelector('.MuiTypography-h4');
    const bodyElement = container.querySelector('.MuiTypography-body1');

    expect(headingElement).not.toBeNull();
    expect(bodyElement).not.toBeNull();

    if (headingElement && bodyElement) {
      expect(headingElement.textContent).toBe('Test Title');
      expect(bodyElement.textContent).toBe('Test Subtitle');
    }
  });

  it('should use Grid and Box components from Material-UI', () => {
    const { container } = render(<WizardStepWrapper {...defaultProps} />);

    const boxElement = container.querySelector('.MuiBox-root');
    expect(boxElement).not.toBeNull();
    const gridElement = container.querySelector('.MuiGrid-root');
    expect(gridElement).not.toBeNull();
  });

  it('should have gutterBottom property on Typography', () => {
    const { container } = render(<WizardStepWrapper {...defaultProps} />);

    const titleElement = container.querySelector('.MuiTypography-gutterBottom');
    expect(titleElement).not.toBeNull();
  });

  it('should wrap children with the correct layout', () => {
    render(
      <WizardStepWrapper {...defaultProps}>
        <div data-testid="test-child">Child Content</div>
      </WizardStepWrapper>
    );

    const childElement = screen.getByTestId('test-child');
    const boxElement = childElement.closest('.MuiBox-root');

    expect(boxElement).not.toBeNull();
  });
});
