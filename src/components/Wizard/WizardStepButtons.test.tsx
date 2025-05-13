import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WizardStepButtons from './WizardStepButtons';

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(() => ({
    t: (key: string) => {
      if (key === 'commons.back') return 'Indietro';
      if (key === 'commons.continue') return 'Continua';
      if (key === 'commons.saveDraft') return 'Salva bozza';
      return key;
    }
  }))
}));

describe('WizardStepButtons', () => {
  it('renders the buttons correctly with default labels', () => {
    const onNext = vi.fn();
    const onBack = vi.fn();
    render(<WizardStepButtons onNext={onNext} onBack={onBack} />);
    expect(screen.getByText('Indietro')).toBeInTheDocument();
    expect(screen.getByText('Continua')).toBeInTheDocument();
  });

  it('renders the next button with the custom label', () => {
    const onNext = vi.fn();
    const onBack = vi.fn();
    render(
      <WizardStepButtons onNext={onNext} onBack={onBack} nextLabel="Avanti" />
    );
    expect(screen.getByText('Avanti')).toBeInTheDocument();
  });

  it('renders the back button with the custom label', () => {
    const onNext = vi.fn();
    const onBack = vi.fn();
    render(
      <WizardStepButtons onNext={onNext} onBack={onBack} backLabel="Torna" />
    );

    expect(screen.getByText('Torna')).toBeInTheDocument();
  });

  it('calls onNext when the Next button is clicked', () => {
    const onNext = vi.fn();
    const onBack = vi.fn();
    render(<WizardStepButtons onNext={onNext} onBack={onBack} />);
    fireEvent.click(screen.getByText('Continua'));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('calls onBack when the Back button is clicked', () => {
    const onNext = vi.fn();
    const onBack = vi.fn();
    render(<WizardStepButtons onNext={onNext} onBack={onBack} />);
    fireEvent.click(screen.getByText('Indietro'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('disables the Next button when disableNext is true', () => {
    const onNext = vi.fn();
    const onBack = vi.fn();
    render(
      <WizardStepButtons onNext={onNext} onBack={onBack} disableNext={true} />
    );
    expect(screen.getByText('Continua')).toBeDisabled();
  });

  it('disables the Back button when disableBack is true', () => {
    const onNext = vi.fn();
    const onBack = vi.fn();
    render(
      <WizardStepButtons onNext={onNext} onBack={onBack} disableBack={true} />
    );
    expect(screen.getByText('Indietro')).toBeDisabled();
  });

  it('does not call onBack when the Back button is disabled and clicked', () => {
    const onNext = vi.fn();
    const onBack = vi.fn();
    render(
      <WizardStepButtons onNext={onNext} onBack={onBack} disableBack={true} />
    );
    fireEvent.click(screen.getByText('Indietro'));
    expect(onBack).not.toHaveBeenCalled();
  });

  it('does not call onNext when the Next button is disabled and clicked', () => {
    const onNext = vi.fn();
    const onBack = vi.fn();
    render(
      <WizardStepButtons onNext={onNext} onBack={onBack} disableNext={true} />
    );
    fireEvent.click(screen.getByText('Continua'));
    expect(onNext).not.toHaveBeenCalled();
  });

  it('works correctly when onBack is not provided', () => {
    const onNext = vi.fn();
    render(<WizardStepButtons onNext={onNext} />);
    expect(screen.getByText('Indietro')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Indietro'));
  });

  it('works correctly when onNext is not provided', () => {
    const onBack = vi.fn();
    render(<WizardStepButtons onBack={onBack} />);
    expect(screen.getByText('Continua')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Continua'));
  });

  it('does not show the Save Draft button by default', () => {
    const onNext = vi.fn();
    const onBack = vi.fn();
    render(<WizardStepButtons onNext={onNext} onBack={onBack} />);
    expect(screen.queryByText('Salva bozza')).not.toBeInTheDocument();
  });

  it('shows the Save Draft button when showSaveDraft is true', () => {
    const onNext = vi.fn();
    const onBack = vi.fn();
    const onSaveDraft = vi.fn();

    render(
      <WizardStepButtons
        onNext={onNext}
        onBack={onBack}
        onSaveDraft={onSaveDraft}
        showSaveDraft={true}
      />
    );
    expect(screen.getByText('Salva bozza')).toBeInTheDocument();
  });

  it('calls onSaveDraft when the Save Draft button is clicked', () => {
    const onNext = vi.fn();
    const onBack = vi.fn();
    const onSaveDraft = vi.fn();
    render(
      <WizardStepButtons
        onNext={onNext}
        onBack={onBack}
        onSaveDraft={onSaveDraft}
        showSaveDraft={true}
      />
    );
    fireEvent.click(screen.getByText('Salva bozza'));
    expect(onSaveDraft).toHaveBeenCalledTimes(1);
  });

  it('uses the custom label for the Save Draft button when provided', () => {
    const onNext = vi.fn();
    const onBack = vi.fn();
    const onSaveDraft = vi.fn();

    render(
      <WizardStepButtons
        onNext={onNext}
        onBack={onBack}
        onSaveDraft={onSaveDraft}
        showSaveDraft={true}
        saveDraftLabel="Salva come bozza"
      />
    );
    expect(screen.getByText('Salva come bozza')).toBeInTheDocument();
  });

  it('disables the Save Draft button when disableSaveDraft is true', () => {
    const onNext = vi.fn();
    const onBack = vi.fn();
    const onSaveDraft = vi.fn();

    render(
      <WizardStepButtons
        onNext={onNext}
        onBack={onBack}
        onSaveDraft={onSaveDraft}
        showSaveDraft={true}
        disableSaveDraft={true}
      />
    );
    expect(screen.getByText('Salva bozza')).toBeDisabled();
  });

  it('does not call onSaveDraft when the Save Draft button is disabled and clicked', () => {
    const onNext = vi.fn();
    const onBack = vi.fn();
    const onSaveDraft = vi.fn();
    render(
      <WizardStepButtons
        onNext={onNext}
        onBack={onBack}
        onSaveDraft={onSaveDraft}
        showSaveDraft={true}
        disableSaveDraft={true}
      />
    );
    fireEvent.click(screen.getByText('Salva bozza'));
    expect(onSaveDraft).not.toHaveBeenCalled();
  });

  it('works correctly when onSaveDraft is not provided but showSaveDraft is true', () => {
    const onNext = vi.fn();
    const onBack = vi.fn();
    render(
      <WizardStepButtons onNext={onNext} onBack={onBack} showSaveDraft={true} />
    );
    expect(screen.getByText('Salva bozza')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Salva bozza'));
  });
});
