import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { type Control, useController } from 'react-hook-form';

import { AddIntegration } from '.';
import utils from '@core/utils';
import i18n from '@core/translations/i18n';
import {
  KeyTypeEnum,
  OrganizationApiKey,
  OrganizationApiKeys,
  OrganizationApiKeyType
} from '@generated/core/client';

const {
  mockGetOrganizationApiKeys,
  mockEncryptAndSaveApiKey,
  mockMutateAsync,
  mockNavigate
} = vi.hoisted(() => ({
  mockGetOrganizationApiKeys:
    vi.fn<() => { data: Array<OrganizationApiKey> }>(),
  mockEncryptAndSaveApiKey: vi.fn(),
  mockMutateAsync: vi.fn<(data: OrganizationApiKeys) => Promise<void>>(),
  mockNavigate: vi.fn()
}));

vi.mock('@core/api/integrations', () => ({
  getOrganizationApiKeys: mockGetOrganizationApiKeys
}));

vi.mock('@core/api/organizations', () => ({
  encryptAndSaveApiKey: mockEncryptAndSaveApiKey
}));

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ organizationId: '33' })
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
      const { field } = useController({ name, control });
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
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetOrganizationApiKeys.mockReturnValue({ data: [] });
    mockEncryptAndSaveApiKey.mockReturnValue({ mutateAsync: mockMutateAsync });
    mockMutateAsync.mockResolvedValue(undefined);
    vi.spyOn(utils.notify, 'emit').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts without a selection or notification and uses the organization from the URL', () => {
    render(<AddIntegration />);

    screen.getAllByRole('radio').forEach((radio) => {
      expect(radio).not.toBeChecked();
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(utils.notify.emit).not.toHaveBeenCalled();
    expect(mockGetOrganizationApiKeys).toHaveBeenCalledWith(33);
    expect(mockEncryptAndSaveApiKey).toHaveBeenCalledWith(33);
  });

  it('notifies when submitting without selecting an integration', async () => {
    render(<AddIntegration />);
    fireEvent.click(screen.getByTestId('next-button'));

    await waitFor(() => {
      expect(utils.notify.emit).toHaveBeenCalledWith(
        i18n.t('integrations.add.errors.selectAtLeastOneOption.title')
      );
    });
    expect(mockMutateAsync).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('notifies about an empty API key only when Continue is pressed', async () => {
    render(<AddIntegration />);
    fireEvent.click(screen.getByTestId('option-pagoPa-product'));
    const apiKey = screen.getByRole('textbox');
    fireEvent.blur(apiKey);
    expect(utils.notify.emit).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('next-button'));
    await waitFor(() => {
      expect(utils.notify.emit).toHaveBeenCalledExactlyOnceWith(
        'integrations.add.pagoPaProduct.errors.apiKey.title'
      );
    });
    expect(mockMutateAsync).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();

    fireEvent.change(apiKey, { target: { value: 'test-api-key' } });
    fireEvent.click(screen.getByTestId('next-button'));
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        apiKey: 'test-api-key',
        keyType: KeyTypeEnum.IO,
        serviceEnabled: false
      });
    });
  });

  it('shows an alert and prevents saving when no pagoPA products are available', async () => {
    mockGetOrganizationApiKeys.mockReturnValue({
      data: [
        { keyType: OrganizationApiKeyType.IO },
        { keyType: OrganizationApiKeyType.GENERATE_NOTICE }
      ]
    });
    render(<AddIntegration />);
    fireEvent.click(screen.getByTestId('option-pagoPa-product'));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(
      'integrations.add.pagoPaProduct.errors.noIntegrationAvailable.title'
    );
    expect(alert).toHaveTextContent(
      'integrations.add.pagoPaProduct.errors.noIntegrationAvailable.message'
    );
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('next-button'));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(mockMutateAsync).not.toHaveBeenCalled();
    expect(utils.notify.emit).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('option-e-service'));
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
    expect(screen.getByTestId('option-e-service')).toBeChecked();
    expect(screen.getByTestId('option-pagoPa-product')).not.toBeChecked();
  });

  it.each([false, true])(
    'saves IO with serviceEnabled=%s and returns to the previous page',
    async (serviceEnabled) => {
      render(<AddIntegration />);
      fireEvent.click(screen.getByTestId('option-pagoPa-product'));
      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: 'test-api-key' }
      });
      if (serviceEnabled) {
        fireEvent.click(screen.getByRole('checkbox'));
      }
      fireEvent.click(screen.getByTestId('next-button'));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(-1);
      });
      expect(mockMutateAsync).toHaveBeenCalledExactlyOnceWith({
        apiKey: 'test-api-key',
        keyType: KeyTypeEnum.IO,
        serviceEnabled
      });
      expect(utils.notify.emit).toHaveBeenCalledWith('commons.done', 'success');
    }
  );

  it('saves the remaining notice product without serviceEnabled', async () => {
    mockGetOrganizationApiKeys.mockReturnValue({
      data: [{ keyType: OrganizationApiKeyType.IO }]
    });
    render(<AddIntegration />);
    fireEvent.click(screen.getByTestId('option-pagoPa-product'));
    expect(screen.getByRole('combobox')).toHaveTextContent('GENERATE_NOTICE');
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'notice-api-key' }
    });
    fireEvent.click(screen.getByTestId('next-button'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
    expect(mockMutateAsync).toHaveBeenCalledExactlyOnceWith({
      apiKey: 'notice-api-key',
      keyType: KeyTypeEnum.GENERATE_NOTICE
    });
  });

  it('notifies about save failures without navigating away', async () => {
    const error = new Error('Save failed');
    mockMutateAsync.mockRejectedValueOnce(error);
    const consoleSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    render(<AddIntegration />);
    fireEvent.click(screen.getByTestId('option-pagoPa-product'));
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'test-api-key' }
    });
    fireEvent.click(screen.getByTestId('next-button'));

    await waitFor(() => {
      expect(utils.notify.emit).toHaveBeenCalledWith(
        'integrations.add.errors.saveIntegration.message'
      );
    });
    expect(consoleSpy).toHaveBeenCalledWith(error);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(utils.notify.emit).not.toHaveBeenCalledWith(
      'commons.done',
      'success'
    );
  });

  it('navigates back when Cancel is pressed', () => {
    render(<AddIntegration />);
    fireEvent.click(screen.getByTestId('back-button'));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });
});
