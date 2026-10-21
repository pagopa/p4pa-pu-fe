import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { type Control, useController } from 'react-hook-form';

import { AddIntegration, type AddIntegrationFormData } from '.';
import utils from '@core/utils';
import {
  OrganizationApiKey,
  OrganizationApiKeyType
} from '@generated/core/client';

const { mockGetOrganizationApiKeys } = vi.hoisted(() => ({
  mockGetOrganizationApiKeys: vi.fn<() => { data: Array<OrganizationApiKey> }>()
}));

vi.mock('@core/api/integrations', () => ({
  getOrganizationApiKeys: mockGetOrganizationApiKeys
}));

vi.mock('./integrations/pagopa', () => ({
  default: ({ control }: { control: Control<AddIntegrationFormData> }) => {
    const { field } = useController({
      name: 'PAGOPA_PRODUCT.apiKey',
      control
    });
    return <input aria-label="API key" {...field} value={field.value ?? ''} />;
  }
}));

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useNavigate: vi.fn()
  };
});

vi.mock('@core/components/TitleComponent/TitleComponent', () => ({
  default: ({ title }: { title: string }) => <h1>{title}</h1>
}));

vi.mock('@core/components/Wizard/WizardStepWrapper', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

vi.mock('@core/components/Wizard/WizardStepButtons', () => ({
  default: ({ onNext, onBack }: { onNext: () => void; onBack: () => void }) => (
    <div>
      <button data-testid="back-button" onClick={onBack}>
        back
      </button>
      <button data-testid="next-button" onClick={onNext}>
        next
      </button>
    </div>
  )
}));

vi.mock('@core/components/FormComponent', () => ({
  FormComponent: {
    ControlledRadioGroup: ({
      name,
      control,
      options,
      value
    }: {
      name: string;
      control: Control<Record<string, unknown>>;
      options: Array<{ value: string; label: React.ReactNode }>;
      value: string;
    }) => {
      const { field, fieldState } = useController({ name, control });
      return (
        <div>
          {options.map((option) => (
            <label key={option.value}>
              <input
                type="radio"
                name={name}
                data-testid={`option-${option.value}`}
                value={option.value}
                checked={value === option.value}
                onChange={() => field.onChange(option.value)}
              />
              {option.label}
            </label>
          ))}
          {fieldState.error && (
            <span data-testid={`${name}-error`}>
              {fieldState.error.message}
            </span>
          )}
        </div>
      );
    },
    RadioLabel: ({
      label,
      description
    }: {
      label: React.ReactNode;
      description?: React.ReactNode;
    }) => (
      <span>
        {label}
        {description}
      </span>
    )
  }
}));

describe('AddIntegration', () => {
  it('notifies about an empty API key only when Continue is pressed', async () => {
    const notifySpy = vi
      .spyOn(utils.notify, 'emit')
      .mockImplementation(() => undefined);
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    render(<AddIntegration />);
    expect(notifySpy).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('option-pagoPa-product'));
    const apiKey = await screen.findByRole('textbox', { name: 'API key' });
    fireEvent.blur(apiKey);
    expect(notifySpy).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('next-button'));
    await waitFor(() => {
      expect(notifySpy).toHaveBeenCalledTimes(1);
    });

    notifySpy.mockClear();
    logSpy.mockClear();
    fireEvent.change(apiKey, { target: { value: 'test-api-key' } });
    fireEvent.click(screen.getByTestId('next-button'));
    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith({
        flagIntegrationType: 'pagoPa-product',
        PAGOPA_PRODUCT: { type: undefined, apiKey: 'test-api-key' }
      });
    });
    expect(notifySpy).not.toHaveBeenCalled();
  });

  beforeEach(() => {
    mockGetOrganizationApiKeys.mockReturnValue({
      data: []
    });
  });

  it('shows an alert and blocks submission when no pagoPA keys are available', async () => {
    mockGetOrganizationApiKeys.mockReturnValue({
      data: [
        { keyType: OrganizationApiKeyType.IO },
        { keyType: OrganizationApiKeyType.GENERATE_NOTICE }
      ]
    });
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    render(<AddIntegration />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('option-pagoPa-product'));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'integrations.pagopa.add.error.message'
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'integrations.pagopa.add.error.title'
    );
    fireEvent.click(screen.getByTestId('next-button'));

    await waitFor(() => {
      expect(screen.getByTestId('flagIntegrationType-error')).toHaveTextContent(
        'integrations.pagopa.add.error.message'
      );
    });
    expect(logSpy).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('option-e-service'));
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('next-button'));
    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith({
        flagIntegrationType: 'e-service'
      });
    });
  });

  it('starts with no selected integration type and no validation alert', () => {
    render(<AddIntegration />);

    screen.getAllByRole('radio').forEach((radio) => {
      expect(radio).not.toBeChecked();
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows a validation error when submitting without selecting an option', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    render(<AddIntegration />);
    fireEvent.click(screen.getByTestId('next-button'));

    await waitFor(() => {
      expect(screen.getByTestId('flagIntegrationType-error')).toHaveTextContent(
        'commons.validation.selectAtLeastOneOption'
      );
      expect(screen.getByRole('alert')).toHaveTextContent(
        'commons.validation.selectAtLeastOneOption'
      );
    });

    expect(logSpy).not.toHaveBeenCalled();
  });

  it('updates the controlled radio value when the selection changes', () => {
    render(<AddIntegration />);

    const pagoPaOption = screen.getByTestId('option-pagoPa-product');
    const eServiceOption = screen.getByTestId('option-e-service');

    fireEvent.click(pagoPaOption);
    expect(pagoPaOption).toBeChecked();
    expect(eServiceOption).not.toBeChecked();

    fireEvent.click(eServiceOption);
    expect(eServiceOption).toBeChecked();
    expect(pagoPaOption).not.toBeChecked();
  });

  it('clears the validation alert after selecting an integration type', async () => {
    render(<AddIntegration />);
    fireEvent.click(screen.getByTestId('next-button'));

    await screen.findByRole('alert');
    fireEvent.click(screen.getByTestId('option-pagoPa-product'));

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  it('submits the selected integration type', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    render(<AddIntegration />);
    fireEvent.click(screen.getByTestId('option-pagoPa-product'));
    fireEvent.click(screen.getByTestId('next-button'));

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith({
        flagIntegrationType: 'pagoPa-product'
      });
    });
    expect(
      screen.queryByTestId('flagIntegrationType-error')
    ).not.toBeInTheDocument();
  });
});
