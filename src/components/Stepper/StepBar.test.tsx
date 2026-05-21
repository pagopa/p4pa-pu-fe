import { render, screen, within } from '@testing-library/react';
import { StepBar } from './StepBar';
import type { Stepper } from './types';

describe('StepBar', () => {
  const steps: Stepper['steps'] = [
    { label: 'Step One', content: '' },
    { label: 'Step Two', optional: true, content: '' },
    { label: 'Step Three', content: '' }
  ];

  it('renders all steps', () => {
    render(<StepBar activeStep={1} steps={steps} />);

    expect(screen.getByText('Step One')).toBeInTheDocument();
    expect(screen.getByText('Step Two')).toBeInTheDocument();
    expect(screen.getByText('Step Three')).toBeInTheDocument();
  });

  it('shows optional text for optional steps', () => {
    render(<StepBar activeStep={0} steps={steps} />);

    expect(screen.getByText('commons.optional')).toBeInTheDocument();
  });

  describe('accessibility', () => {
    it('wraps steps in a navigation landmark', () => {
      render(<StepBar activeStep={0} steps={steps} />);

      const nav = screen.getByRole('navigation', {
        name: 'commons.stepper.navigationLabel'
      });
      expect(nav).toBeInTheDocument();
    });

    it('renders steps as an ordered list', () => {
      render(<StepBar activeStep={0} steps={steps} />);

      const list = screen.getByRole('list');
      expect(list.tagName).toBe('OL');
      expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    });

    it('exposes position, label and active status on the active step', () => {
      render(<StepBar activeStep={0} steps={steps} />);

      const activeStep = screen.getByRole('listitem', {
        name: /Step One.*commons\.stepper\.status\.active/
      });
      expect(activeStep).toHaveAttribute('aria-current', 'step');
    });

    it('exposes both completed and inactive status on completed steps', () => {
      render(<StepBar activeStep={2} steps={steps} />);

      const completedStep = screen.getByRole('listitem', {
        name: /Step One.*commons\.stepper\.status\.completed.*commons\.stepper\.status\.inactive/
      });
      expect(completedStep).not.toHaveAttribute('aria-current');
    });

    it('does not expose the completed status on the active step', () => {
      render(<StepBar activeStep={0} steps={steps} />);

      const activeStep = screen.getByRole('listitem', {
        name: /Step One/
      });
      expect(activeStep.getAttribute('aria-label')).not.toMatch(
        /commons\.stepper\.status\.completed/
      );
    });

    it('marks not-yet-reached steps as inactive only (without completed)', () => {
      render(<StepBar activeStep={0} steps={steps} />);

      const inactiveStep = screen.getByRole('listitem', {
        name: /Step Three.*commons\.stepper\.status\.inactive/
      });
      expect(inactiveStep).not.toHaveAttribute('aria-current');
      expect(inactiveStep.getAttribute('aria-label')).not.toMatch(
        /commons\.stepper\.status\.completed/
      );
    });

    it('includes the optional indicator in the aria-label of optional steps', () => {
      render(<StepBar activeStep={0} steps={steps} />);

      const optionalStep = screen.getByRole('listitem', {
        name: /Step Two.*commons\.optional/
      });
      expect(optionalStep).toBeInTheDocument();
    });

    it('hides visual labels from assistive technology to avoid duplication', () => {
      render(<StepBar activeStep={0} steps={steps} />);

      const visibleLabel = screen.getByText('Step One');
      expect(visibleLabel.closest('[aria-hidden="true"]')).not.toBeNull();
    });

    it('marks only the active step with aria-current', () => {
      render(<StepBar activeStep={1} steps={steps} />);

      const items = screen.getAllByRole('listitem');
      const withCurrent = items.filter(
        (item) => item.getAttribute('aria-current') === 'step'
      );
      expect(withCurrent).toHaveLength(1);
    });
  });
});
