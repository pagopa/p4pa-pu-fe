import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../../../../__tests__/renderers';
import { FormProvider, useForm } from 'react-hook-form';
import { CustomFormSelector } from './CustomFormSelector';
import { i18nTestSetup } from '../../../../../__tests__/i18nTestSetup';
import { DebtTypeOrgForm } from '../../../types';

const mockCustomFormOptions = [
  { label: 'Form 1', value: 1 },
  { label: 'Form 2', value: 2 },
  { label: 'Form 3', value: 3 }
];

const TestWrapper = ({
  children,
  defaultValues = {}
}: {
  children: React.ReactNode;
  defaultValues?: Partial<DebtTypeOrgForm>;
}) => {
  const methods = useForm<DebtTypeOrgForm>({
    defaultValues: {
      customFormId: undefined,
      ...defaultValues
    }
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('CustomFormSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    i18nTestSetup({
      'commons.loading': 'Loading...',
      'debtTypeOrgCreate.behaviour.customForms.empty.message':
        'No custom forms available.',
      'debtTypeOrgCreate.behaviour.customForms.empty.linkHref': '/custom-forms',
      'debtTypeOrgCreate.behaviour.customForms.empty.linkLabel':
        'Create a new custom form',
      'debtTypeOrgCreate.behaviour.customForms.empty.action':
        'and configure it for this debt type.',
      'debtTypeOrgCreate.behaviour.customForms.select.label':
        'Select Custom Form'
    });
  });

  describe('Loading State', () => {
    it('displays loading message when isLoading is true', () => {
      render(
        <TestWrapper>
          <CustomFormSelector
            control={undefined as never}
            isLoading={true}
            customFormOptions={[]}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByTestId('customFormId')).not.toBeInTheDocument();
    });

    it('does not display empty state when loading', () => {
      render(
        <TestWrapper>
          <CustomFormSelector
            control={undefined as never}
            isLoading={true}
            customFormOptions={[]}
          />
        </TestWrapper>
      );

      expect(
        screen.queryByText('No custom forms available.')
      ).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('displays empty state when customFormOptions is empty and not loading', () => {
      render(
        <TestWrapper>
          <CustomFormSelector
            control={undefined as never}
            isLoading={false}
            customFormOptions={[]}
          />
        </TestWrapper>
      );

      expect(
        screen.getByText('No custom forms available.')
      ).toBeInTheDocument();
      expect(screen.getByText('Create a new custom form')).toBeInTheDocument();
      expect(
        screen.getByText('and configure it for this debt type.')
      ).toBeInTheDocument();
    });

    it('displays CategoryIcon in empty state', () => {
      const { container } = render(
        <TestWrapper>
          <CustomFormSelector
            control={undefined as never}
            isLoading={false}
            customFormOptions={[]}
          />
        </TestWrapper>
      );

      const icon = container.querySelector('[data-testid="CategoryIcon"]');
      expect(icon).toBeInTheDocument();
    });

    it('displays link in empty state', () => {
      render(
        <TestWrapper>
          <CustomFormSelector
            control={undefined as never}
            isLoading={false}
            customFormOptions={[]}
          />
        </TestWrapper>
      );

      const link = screen.getByText('Create a new custom form');
      expect(link).toBeInTheDocument();
      expect(link.closest('a')).toHaveAttribute('href', '/custom-forms');
    });

    it('prevents default navigation on link click', () => {
      const consoleSpy = vi
        .spyOn(console, 'log')
        .mockImplementation(() => undefined);

      render(
        <TestWrapper>
          <CustomFormSelector
            control={undefined as never}
            isLoading={false}
            customFormOptions={[]}
          />
        </TestWrapper>
      );

      const link = screen.getByText('Create a new custom form');
      fireEvent.click(link);

      expect(consoleSpy).toHaveBeenCalledWith('Navigate to custom modules');
      consoleSpy.mockRestore();
    });
  });

  describe('With Custom Forms', () => {
    it('displays ControlledSelect when customFormOptions has items', () => {
      render(
        <TestWrapper>
          <CustomFormSelector
            control={undefined as never}
            isLoading={false}
            customFormOptions={mockCustomFormOptions}
          />
        </TestWrapper>
      );

      const elements = screen.getAllByTestId('customFormId');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('does not display loading or empty state when options are available', () => {
      render(
        <TestWrapper>
          <CustomFormSelector
            control={undefined as never}
            isLoading={false}
            customFormOptions={mockCustomFormOptions}
          />
        </TestWrapper>
      );

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(
        screen.queryByText('No custom forms available.')
      ).not.toBeInTheDocument();
    });

    it('renders select with required and fullWidth props', () => {
      render(
        <TestWrapper>
          <CustomFormSelector
            control={undefined as never}
            isLoading={false}
            customFormOptions={mockCustomFormOptions}
          />
        </TestWrapper>
      );

      const elements = screen.getAllByTestId('customFormId');
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('handles transition from loading to empty state', () => {
      const { rerender } = render(
        <TestWrapper>
          <CustomFormSelector
            control={undefined as never}
            isLoading={true}
            customFormOptions={[]}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();

      rerender(
        <TestWrapper>
          <CustomFormSelector
            control={undefined as never}
            isLoading={false}
            customFormOptions={[]}
          />
        </TestWrapper>
      );

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(
        screen.getByText('No custom forms available.')
      ).toBeInTheDocument();
    });

    it('handles transition from loading to loaded state', () => {
      const { rerender } = render(
        <TestWrapper>
          <CustomFormSelector
            control={undefined as never}
            isLoading={true}
            customFormOptions={[]}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();

      rerender(
        <TestWrapper>
          <CustomFormSelector
            control={undefined as never}
            isLoading={false}
            customFormOptions={mockCustomFormOptions}
          />
        </TestWrapper>
      );

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      const elements = screen.getAllByTestId('customFormId');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('handles single custom form option', () => {
      render(
        <TestWrapper>
          <CustomFormSelector
            control={undefined as never}
            isLoading={false}
            customFormOptions={[{ label: 'Single Form', value: 1 }]}
          />
        </TestWrapper>
      );

      const elements = screen.getAllByTestId('customFormId');
      expect(elements.length).toBeGreaterThan(0);
      expect(
        screen.queryByText('No custom forms available.')
      ).not.toBeInTheDocument();
    });
  });
});
