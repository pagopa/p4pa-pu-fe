import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import WizardStepper from './WizardStepper';

// Mock di react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}));

describe('WizardStepper', () => {
  it('renderizza correttamente lo stepper con tre passaggi', () => {
    render(<WizardStepper activeStep={0} />);

    // Verifica che tutti i passaggi siano presenti
    expect(
      screen.getByText('debtPositionCreateWizard.wizardStepper.step1')
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtPositionCreateWizard.wizardStepper.step2')
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtPositionCreateWizard.wizardStepper.step3')
    ).toBeInTheDocument();
  });

  it('accetta la prop activeStep impostata a 1', () => {
    // Verifica semplicemente che non ci siano errori quando activeStep è 1
    expect(() => {
      render(<WizardStepper activeStep={1} />);
    }).not.toThrow();

    // Verifica che il rendering avvenga correttamente
    const steps = document.querySelectorAll('.MuiStep-root');
    expect(steps.length).toBe(3);
  });

  it('accetta la prop activeStep impostata a 0', () => {
    // Verifica semplicemente che non ci siano errori quando activeStep è 0
    expect(() => {
      render(<WizardStepper activeStep={0} />);
    }).not.toThrow();

    // Verifica che il rendering avvenga correttamente
    const steps = document.querySelectorAll('.MuiStep-root');
    expect(steps.length).toBe(3);
  });

  it('accetta la prop activeStep impostata a 2', () => {
    // Verifica semplicemente che non ci siano errori quando activeStep è 2
    expect(() => {
      render(<WizardStepper activeStep={2} />);
    }).not.toThrow();

    // Verifica che il rendering avvenga correttamente
    const steps = document.querySelectorAll('.MuiStep-root');
    expect(steps.length).toBe(3);
  });

  it('applica lo stile corretto allo stepper', () => {
    render(<WizardStepper activeStep={0} />);

    // Verifica che lo stepper abbia lo stile corretto
    const stepper = document.querySelector('.MuiStepper-root');
    expect(stepper).not.toBeNull();
    if (stepper) {
      // Verifica che abbia margini sia sopra che sotto
      const computedStyle = window.getComputedStyle(stepper);
      expect(computedStyle.marginTop).toBe('24px');
      expect(computedStyle.marginBottom).toBe('24px');
    }
  });

  it("utilizza l'etichetta alternativa per i passaggi", () => {
    render(<WizardStepper activeStep={0} />);

    // Verifica che lo stepper utilizzi l'etichetta alternativa
    const stepper = document.querySelector('.MuiStepper-root');
    expect(stepper).not.toBeNull();
    if (stepper) {
      expect(stepper.classList.contains('MuiStepper-alternativeLabel')).toBe(
        true
      );
    }
  });

  it('utilizza il componente Stepper di Material-UI', () => {
    render(<WizardStepper activeStep={0} />);

    // Verifica che sia presente almeno un componente Stepper
    const stepper = document.querySelector('.MuiStepper-root');
    expect(stepper).not.toBeNull();

    // Verifica che siano presenti esattamente 3 Step
    const steps = document.querySelectorAll('.MuiStep-root');
    expect(steps.length).toBe(3);

    // Verifica che siano presenti 3 StepLabel
    const stepLabels = document.querySelectorAll('.MuiStepLabel-root');
    expect(stepLabels.length).toBe(3);
  });
});
