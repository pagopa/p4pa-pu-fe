import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import WizardStepWrapper from './WizardStepWrapper';

describe('WizardStepWrapper', () => {
  const defaultProps = {
    title: 'Test Title',
    subtitle: 'Test Subtitle'
  };

  it('renderizza correttamente il titolo e il sottotitolo', () => {
    render(<WizardStepWrapper {...defaultProps} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('renderizza correttamente i children', () => {
    render(
      <WizardStepWrapper {...defaultProps}>
        <div data-testid="test-child">Child Content</div>
      </WizardStepWrapper>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('utilizza i componenti Typography di Material-UI', () => {
    const { container } = render(<WizardStepWrapper {...defaultProps} />);

    // Verifica che siano utilizzati i componenti Typography
    const headingElement = container.querySelector('.MuiTypography-h4');
    const bodyElement = container.querySelector('.MuiTypography-body1');

    expect(headingElement).not.toBeNull();
    expect(bodyElement).not.toBeNull();

    if (headingElement && bodyElement) {
      expect(headingElement.textContent).toBe('Test Title');
      expect(bodyElement.textContent).toBe('Test Subtitle');
    }
  });

  it('utilizza Grid e Box di Material-UI', () => {
    const { container } = render(<WizardStepWrapper {...defaultProps} />);

    // Verifica che sia utilizzato il componente Box
    const boxElement = container.querySelector('.MuiBox-root');
    expect(boxElement).not.toBeNull();

    // Verifica che sia utilizzato il componente Grid
    const gridElement = container.querySelector('.MuiGrid-root');
    expect(gridElement).not.toBeNull();
  });

  it('ha la proprietà gutterBottom sui Typography', () => {
    const { container } = render(<WizardStepWrapper {...defaultProps} />);

    const titleElement = container.querySelector('.MuiTypography-gutterBottom');
    expect(titleElement).not.toBeNull();
  });

  it('avvolge i children con il layout corretto', () => {
    render(
      <WizardStepWrapper {...defaultProps}>
        <div data-testid="test-child">Child Content</div>
      </WizardStepWrapper>
    );

    // Verifica che i children siano resi all'interno del Box
    const childElement = screen.getByTestId('test-child');
    const boxElement = childElement.closest('.MuiBox-root');

    expect(boxElement).not.toBeNull();
  });
});
