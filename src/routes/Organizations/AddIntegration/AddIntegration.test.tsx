import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fireEvent,
  render as testingRender,
  screen,
  waitFor,
  within
} from '@testing-library/react';
import { type Control, useController } from 'react-hook-form';
import { MemoryRouter, useParams } from 'react-router';

import { AddIntegration } from '.';
import utils from '@core/utils';
import i18n from '@core/translations/i18n';
import type {
  OrganizationApiKey,
  OrganizationApiKeys
} from '@generated/core/client';
import {
  KeyTypeEnum,
  OrganizationApiKeyType,
  PdndServiceType
} from '@generated/core/client';
import type {
  PdndClientDTO,
  PdndClientNoSecretDTO,
  PdndClientView
} from '@generated/core/data-contracts';
import { IntegrationMode, IntegrationType, PdndOwnerType } from '../enums';

const render = (ui: React.ReactNode, initialEntry = '/') =>
  testingRender(ui, {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
    )
  });

const {
  mockGetOrganizationApiKeys,
  mockGetOrganizationApiKey,
  mockEncryptAndSaveApiKey,
  mockMutateAsync,
  mockGetAllOrgSubUnits,
  mockGetOrgSubUnitWithNoServiceType,
  mockGetPdndClientsByOrgSubUnitCode,
  mockGetPdndClient,
  mockGetPdndService,
  mockSavePdndClient,
  mockSavePdndMutateAsync,
  mockCreatePdndService,
  mockCreatePdndServiceMutateAsync,
  mockUpdatePdndClient,
  mockUpdatePdndClientMutateAsync,
  mockUpdatePdndService,
  mockUpdatePdndServiceMutateAsync,
  mockNavigate
} = vi.hoisted(() => ({
  mockGetOrganizationApiKey:
    vi.fn<() => { data: { apiKey: string } | undefined }>(),
  mockGetOrganizationApiKeys:
    vi.fn<
      (
        organizationId: number,
        enabled?: boolean
      ) => { data: Array<OrganizationApiKey> }
    >(),
  mockEncryptAndSaveApiKey: vi.fn(),
  mockMutateAsync: vi.fn<(data: OrganizationApiKeys) => Promise<void>>(),
  mockGetAllOrgSubUnits:
    vi.fn<
      (
        organizationId: number,
        enabled?: boolean
      ) => { data: { content: Array<PdndClientView> } | undefined }
    >(),
  mockGetOrgSubUnitWithNoServiceType: vi.fn(),
  mockGetPdndClientsByOrgSubUnitCode: vi.fn(),
  mockGetPdndClient: vi.fn(),
  mockGetPdndService: vi.fn(),
  mockSavePdndClient: vi.fn(),
  mockSavePdndMutateAsync: vi.fn<(data: PdndClientDTO) => Promise<void>>(),
  mockCreatePdndService: vi.fn(),
  mockCreatePdndServiceMutateAsync: vi.fn(),
  mockUpdatePdndClient: vi.fn(),
  mockUpdatePdndClientMutateAsync: vi.fn(),
  mockUpdatePdndService: vi.fn(),
  mockUpdatePdndServiceMutateAsync: vi.fn(),
  mockNavigate: vi.fn()
}));

vi.mock('@core/api/integrations', () => ({
  useGetOrganizationApiKeys: mockGetOrganizationApiKeys,
  useGetAllOrgSubUnits: mockGetAllOrgSubUnits,
  useGetOrgSubUnitWithNoServiceType: mockGetOrgSubUnitWithNoServiceType,
  useGetPdndClientsByOrgSubUnitCode: mockGetPdndClientsByOrgSubUnitCode,
  useGetPdndClient: mockGetPdndClient,
  useGetPdndService: mockGetPdndService,
  useSavePdndClient: mockSavePdndClient,
  useCreatePdndService: mockCreatePdndService,
  useUpdatePdndClient: mockUpdatePdndClient,
  useUpdatePdndService: mockUpdatePdndService
}));

vi.mock('@core/api/organizations', () => ({
  getOrganizationApiKey: mockGetOrganizationApiKey,
  encryptAndSaveApiKey: mockEncryptAndSaveApiKey
}));

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mockNavigate,
  useParams: vi.fn()
}));

vi.mock('@core/components/TitleComponent/TitleComponent', () => ({
  default: ({ title }: { title: string }) => <h1>{title}</h1>
}));

vi.mock('@core/components/Wizard/WizardStepWrapper', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

vi.mock('@pagopa/mui-italia/components/MIAlert', () => ({
  MIAlert: ({
    title,
    children
  }: {
    title: React.ReactNode;
    children: React.ReactNode;
  }) => (
    <div role="alert">
      <div>{title}</div>
      {children}
    </div>
  )
}));

vi.mock('@core/components/Wizard/WizardStepButtons', () => ({
  default: ({
    onNext,
    onBack,
    disableNext
  }: {
    onNext: () => void;
    onBack: () => void;
    disableNext?: boolean;
  }) => (
    <div>
      <button data-testid="back-button" onClick={onBack}>
        back
      </button>
      <button data-testid="next-button" onClick={onNext} disabled={disableNext}>
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
      disabled
    }: {
      name: string;
      control: Control<Record<string, unknown>>;
      options: Array<{ value: string; label: React.ReactNode }>;
      disabled?: boolean;
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
                checked={field.value === option.value}
                disabled={disabled}
                onChange={() => field.onChange(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      );
    },
    ControlledSelect: ({
      name,
      control,
      label,
      options,
      disabled
    }: {
      name: string;
      control: Control<Record<string, unknown>>;
      label: string;
      options: Array<{ value: string; label: string }>;
      disabled?: boolean;
    }) => {
      const { field, fieldState } = useController({ name, control });
      return (
        <div>
          <label htmlFor={name}>{label}</label>
          <select
            id={name}
            data-testid={name}
            value={String(field.value ?? '')}
            disabled={disabled}
            onChange={(event) => field.onChange(event.target.value)}
          >
            <option value="" />
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldState.error && (
            <span data-testid={`${name}-error`}>
              {fieldState.error.message}
            </span>
          )}
        </div>
      );
    },
    ControlledTextField: ({
      name,
      control,
      label,
      multiline,
      disabled
    }: {
      name: string;
      control: Control<Record<string, unknown>>;
      label: string;
      multiline?: boolean;
      disabled?: boolean;
    }) => {
      const { field, fieldState } = useController({ name, control });
      const value = String(field.value ?? '');
      return (
        <div>
          <label htmlFor={name}>{label}</label>
          {multiline ? (
            <textarea
              id={name}
              data-testid={name}
              value={value}
              disabled={disabled}
              onChange={field.onChange}
            />
          ) : (
            <input
              id={name}
              data-testid={name}
              value={value}
              disabled={disabled}
              onChange={field.onChange}
            />
          )}
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

const toSubUnit = (subUnitCode: string, subUnitName: string) =>
  ({ subUnitCode, subUnitName }) as PdndClientView;

const SUB_UNITS = [
  toSubUnit('SU1', 'Sub unit one'),
  toSubUnit('SU2', 'Sub unit two')
];

describe('AddIntegration', () => {
  it('fills the API key when it loads without overwriting later user edits', async () => {
    vi.mocked(useParams).mockReturnValue({
      organizationId: '33',
      IntegrationType: 'pagoPa-product'
    });
    const { rerender } = render(
      <AddIntegration mode={IntegrationMode.EDIT} />,
      '/?keyType=IO'
    );
    expect(screen.getByRole('textbox')).toHaveValue('');

    mockGetOrganizationApiKey.mockReturnValue({
      data: { apiKey: 'loaded-key' }
    });
    rerender(<AddIntegration mode={IntegrationMode.EDIT} />);
    await waitFor(() => {
      expect(screen.getByRole('textbox')).toHaveValue('loaded-key');
    });

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'edited-key' }
    });
    mockGetOrganizationApiKey.mockReturnValue({
      data: { apiKey: 'refetched-key' }
    });
    rerender(<AddIntegration mode={IntegrationMode.EDIT} />);
    expect(screen.getByRole('textbox')).toHaveValue('edited-key');
  });

  it('preserves an API key entered before the query finishes', () => {
    vi.mocked(useParams).mockReturnValue({
      organizationId: '33',
      IntegrationType: 'pagoPa-product'
    });
    const { rerender } = render(
      <AddIntegration mode={IntegrationMode.EDIT} />,
      '/?keyType=IO'
    );
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'user-key' }
    });
    mockGetOrganizationApiKey.mockReturnValue({
      data: { apiKey: 'loaded-key' }
    });
    rerender(<AddIntegration mode={IntegrationMode.EDIT} />);
    expect(screen.getByRole('textbox')).toHaveValue('user-key');
  });

  it.each(['IO', 'GENERATE_NOTICE'])(
    'shows the URL keyType %s read-only in edit mode',
    (keyType) => {
      vi.mocked(useParams).mockReturnValue({
        organizationId: '33',
        IntegrationType: 'pagoPa-product'
      });
      mockGetOrganizationApiKeys.mockReturnValue({ data: [] });

      render(
        <AddIntegration mode={IntegrationMode.EDIT} />,
        `/?keyType=${keyType}`
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveTextContent(keyType);
      fireEvent.mouseDown(select);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(mockGetOrganizationApiKeys).toHaveBeenCalledWith(33, false);
    }
  );

  it.each([
    { query: 'IO', expected: OrganizationApiKeyType.IO },
    {
      query: 'GENERATE_NOTICE',
      expected: OrganizationApiKeyType.GENERATE_NOTICE
    },
    { query: 'SEND', expected: OrganizationApiKeyType.IO }
  ])('initializes the product for keyType=$query', ({ query, expected }) => {
    render(<AddIntegration />, `/?keyType=${query}`);
    fireEvent.click(screen.getByTestId('option-pagoPa-product'));
    expect(screen.getByRole('combobox')).toHaveTextContent(expected);
  });

  it('disables the configured keys query in edit mode and enables it in add mode', () => {
    const { rerender } = render(
      <AddIntegration mode={IntegrationMode.EDIT} />,
      '/?keyType=IO'
    );
    expect(mockGetOrganizationApiKeys).toHaveBeenLastCalledWith(33, false);
    expect(mockGetOrganizationApiKey).toHaveBeenLastCalledWith(
      33,
      OrganizationApiKeyType.IO,
      true
    );

    rerender(<AddIntegration mode={IntegrationMode.ADD} />);
    expect(mockGetOrganizationApiKeys).toHaveBeenLastCalledWith(33, true);
    expect(mockGetOrganizationApiKey).toHaveBeenLastCalledWith(
      33,
      OrganizationApiKeyType.IO,
      false
    );
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetOrganizationApiKey.mockReturnValue({ data: undefined });
    vi.mocked(useParams).mockReturnValue({ organizationId: '33' });
    mockGetOrganizationApiKeys.mockReturnValue({ data: [] });
    mockEncryptAndSaveApiKey.mockReturnValue({ mutateAsync: mockMutateAsync });
    mockMutateAsync.mockResolvedValue(undefined);
    mockGetAllOrgSubUnits.mockReturnValue({
      data: { content: SUB_UNITS }
    });
    mockGetOrgSubUnitWithNoServiceType.mockReturnValue({
      data: SUB_UNITS
    });
    mockGetPdndClientsByOrgSubUnitCode.mockReturnValue({
      data: []
    });
    mockGetPdndService.mockReturnValue({ data: undefined });
    mockGetPdndClient.mockReturnValue({ data: undefined });
    mockSavePdndClient.mockReturnValue({
      mutateAsync: mockSavePdndMutateAsync
    });
    mockSavePdndMutateAsync.mockResolvedValue(undefined);
    mockCreatePdndService.mockReturnValue({
      mutateAsync: mockCreatePdndServiceMutateAsync
    });
    mockCreatePdndServiceMutateAsync.mockResolvedValue(undefined);
    mockUpdatePdndClient.mockReturnValue({
      mutateAsync: mockUpdatePdndClientMutateAsync
    });
    mockUpdatePdndClientMutateAsync.mockResolvedValue(undefined);
    mockUpdatePdndService.mockReturnValue({
      mutateAsync: mockUpdatePdndServiceMutateAsync
    });
    mockUpdatePdndServiceMutateAsync.mockResolvedValue(undefined);
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
    expect(mockGetOrganizationApiKeys).toHaveBeenCalledWith(33, true);
    expect(mockEncryptAndSaveApiKey).toHaveBeenCalledWith(33);
    expect(mockSavePdndClient).toHaveBeenCalledWith(33);
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
    expect(mockSavePdndMutateAsync).not.toHaveBeenCalled();
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
      expect(screen.getByRole('alert')).not.toHaveTextContent(
        'integrations.add.pagoPaProduct.errors.noIntegrationAvailable.title'
      );
    });
    expect(screen.getByRole('alert')).toHaveTextContent(
      'integrations.add.eService.errors.noClients.organization.title'
    );
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
      expect(mockSavePdndMutateAsync).not.toHaveBeenCalled();
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

  describe('PDND client', () => {
    const CLIENT_FIELDS = {
      clientName: 'My client',
      clientId: 'client-id',
      kid: 'key-id',
      publicKey: 'public-key',
      privateKey: 'private-key'
    };

    const selectPdnd = () =>
      fireEvent.click(
        screen.getByTestId(`option-${IntegrationType.PDND_CLIENT}`)
      );
    const selectOwner = (owner: PdndOwnerType) =>
      fireEvent.click(screen.getByTestId(`option-${owner}`));
    const input = (name: string) => screen.getByTestId(`PDND_CLIENT.${name}`);
    const fillClient = () => {
      Object.entries(CLIENT_FIELDS).forEach(([name, value]) => {
        fireEvent.change(input(name), { target: { value } });
      });
    };
    const submit = () => fireEvent.click(screen.getByTestId('next-button'));

    it('shows the client form with the organization owner preselected', () => {
      render(<AddIntegration />);
      selectPdnd();

      expect(
        screen.getByTestId(`option-${PdndOwnerType.ORGANIZATION}`)
      ).toBeChecked();
      expect(
        screen.getByTestId(`option-${PdndOwnerType.SUB_UNIT}`)
      ).not.toBeChecked();
      Object.keys(CLIENT_FIELDS).forEach((name) => {
        expect(input(name)).toBeInTheDocument();
      });
      expect(
        screen.queryByTestId('PDND_CLIENT.subUnitCode')
      ).not.toBeInTheDocument();
    });

    it('queries the sub-units only when the sub-unit owner is selected', () => {
      render(<AddIntegration />);
      expect(mockGetAllOrgSubUnits).toHaveBeenLastCalledWith(33, false);

      selectPdnd();
      expect(mockGetAllOrgSubUnits).toHaveBeenLastCalledWith(33, false);

      selectOwner(PdndOwnerType.SUB_UNIT);
      expect(mockGetAllOrgSubUnits).toHaveBeenLastCalledWith(33, true);

      selectOwner(PdndOwnerType.ORGANIZATION);
      expect(mockGetAllOrgSubUnits).toHaveBeenLastCalledWith(33, false);
    });

    it('never queries the sub-units for the other integration types', () => {
      render(<AddIntegration />);
      fireEvent.click(screen.getByTestId('option-pagoPa-product'));
      fireEvent.click(screen.getByTestId('option-e-service'));

      expect(mockGetAllOrgSubUnits).not.toHaveBeenCalledWith(33, true);
    });

    it('lists the sub-units for the sub-unit owner', () => {
      render(<AddIntegration />);
      selectPdnd();
      selectOwner(PdndOwnerType.SUB_UNIT);

      const select = screen.getByTestId('PDND_CLIENT.subUnitCode');
      expect(
        within(select).getByRole('option', { name: 'Sub unit one' })
      ).toBeInTheDocument();
      expect(
        within(select).getByRole('option', { name: 'Sub unit two' })
      ).toBeInTheDocument();
    });

    it('saves an organization client without a sub-unit code', async () => {
      render(<AddIntegration />);
      selectPdnd();
      fillClient();
      submit();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(-1);
      });
      expect(mockSavePdndMutateAsync).toHaveBeenCalledExactlyOnceWith({
        organizationId: 33,
        ...CLIENT_FIELDS
      });
      expect(mockMutateAsync).not.toHaveBeenCalled();
      expect(utils.notify.emit).toHaveBeenCalledWith('commons.done', 'success');
    });

    it('saves a sub-unit client with the selected sub-unit', async () => {
      render(<AddIntegration />);
      selectPdnd();
      selectOwner(PdndOwnerType.SUB_UNIT);
      fireEvent.change(input('subUnitCode'), { target: { value: 'SU1' } });
      fillClient();
      submit();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(-1);
      });
      expect(mockSavePdndMutateAsync).toHaveBeenCalledExactlyOnceWith({
        organizationId: 33,
        ...CLIENT_FIELDS,
        subUnitCode: 'SU1'
      });
    });

    it('does not send a stale sub-unit after switching back to the organization', async () => {
      render(<AddIntegration />);
      selectPdnd();
      selectOwner(PdndOwnerType.SUB_UNIT);
      fireEvent.change(input('subUnitCode'), { target: { value: 'SU1' } });
      selectOwner(PdndOwnerType.ORGANIZATION);
      fillClient();
      submit();

      await waitFor(() => {
        expect(mockSavePdndMutateAsync).toHaveBeenCalledExactlyOnceWith({
          organizationId: 33,
          ...CLIENT_FIELDS
        });
      });
    });

    it('shows inline errors and does not save when required fields are empty', async () => {
      render(<AddIntegration />);
      selectPdnd();
      submit();

      await waitFor(() => {
        expect(input('clientName-error')).toHaveTextContent('commons.required');
      });
      Object.keys(CLIENT_FIELDS).forEach((name) => {
        expect(input(`${name}-error`)).toHaveTextContent('commons.required');
      });
      expect(mockSavePdndMutateAsync).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(utils.notify.emit).not.toHaveBeenCalled();
    });

    it('treats whitespace-only values as empty', async () => {
      render(<AddIntegration />);
      selectPdnd();
      fillClient();
      fireEvent.change(input('privateKey'), { target: { value: '   ' } });
      submit();

      await waitFor(() => {
        expect(input('privateKey-error')).toHaveTextContent('commons.required');
      });
      expect(mockSavePdndMutateAsync).not.toHaveBeenCalled();
    });

    it('requires a sub-unit for the sub-unit owner without showing a snackbar', async () => {
      render(<AddIntegration />);
      selectPdnd();
      selectOwner(PdndOwnerType.SUB_UNIT);
      fillClient();
      submit();

      await waitFor(() => {
        expect(input('subUnitCode-error')).toHaveTextContent(
          'integrations.add.pdndClient.errors.subUnitRequired'
        );
      });
      expect(mockSavePdndMutateAsync).not.toHaveBeenCalled();
      expect(utils.notify.emit).not.toHaveBeenCalled();
    });

    it('does not show the no-sub-units alert while the sub-units are loading', () => {
      mockGetAllOrgSubUnits.mockReturnValue({ data: undefined });
      render(<AddIntegration />);
      selectPdnd();
      selectOwner(PdndOwnerType.SUB_UNIT);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(input('subUnitCode')).toBeInTheDocument();
      expect(input('clientName')).toBeInTheDocument();
    });

    it('notifies about save failures without navigating away', async () => {
      const error = new Error('Save failed');
      mockSavePdndMutateAsync.mockRejectedValueOnce(error);
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      render(<AddIntegration />);
      selectPdnd();
      fillClient();
      submit();

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
  });

  describe('e-service edit', () => {
    const EXISTING_SERVICE = {
      purposeId: 'purpose-1',
      serviceName: 'Service one',
      serviceType: PdndServiceType.SEND,
      clientId: 'client-1',
      clientName: 'Client one'
    };

    const CLIENTS = [
      { clientId: 'client-1', clientName: 'Client one' },
      { clientId: 'client-2', clientName: 'Client two' }
    ];

    const renderEdit = () => {
      vi.mocked(useParams).mockReturnValue({
        organizationId: '33',
        IntegrationType: IntegrationType.E_SERVICE
      });
      mockGetPdndService.mockReturnValue({ data: EXISTING_SERVICE });
      mockGetPdndClientsByOrgSubUnitCode.mockReturnValue({ data: CLIENTS });

      return render(
        <AddIntegration mode={IntegrationMode.EDIT} />,
        '/?purposeId=purpose-1'
      );
    };

    // The service and its client are loaded asynchronously: the form is
    // populated as soon as the data arrives.
    it('prefills the service and makes only the name and client ID editable', async () => {
      renderEdit();

      await waitFor(() => {
        expect(screen.getByTestId('E_SERVICE.eServiceName')).toHaveValue(
          'Service one'
        );
      });
      expect(screen.getByTestId('E_SERVICE.purposeId')).toHaveValue(
        'purpose-1'
      );
      expect(screen.getByTestId('E_SERVICE.purposeId')).toBeDisabled();
      expect(screen.getByTestId('E_SERVICE.clientId')).toHaveValue('client-1');
      expect(screen.getByTestId('option-organization')).toBeDisabled();
      expect(screen.getByTestId('option-subUnit')).toBeDisabled();
      expect(mockGetPdndService).toHaveBeenCalledWith(
        33,
        'purpose-1',
        undefined
      );
      expect(mockGetOrgSubUnitWithNoServiceType).toHaveBeenCalled();
    });

    it('disables the confirm button while the service is loading', () => {
      vi.mocked(useParams).mockReturnValue({
        organizationId: '33',
        IntegrationType: IntegrationType.E_SERVICE
      });
      mockGetPdndService.mockReturnValue({
        data: undefined,
        isPending: true
      });

      render(
        <AddIntegration mode={IntegrationMode.EDIT} />,
        '/?purposeId=purpose-1'
      );

      expect(screen.getByTestId('next-button')).toBeDisabled();
    });

    it('passes the sub-unit code when editing a sub-unit service', async () => {
      vi.mocked(useParams).mockReturnValue({
        organizationId: '33',
        IntegrationType: IntegrationType.E_SERVICE
      });
      mockGetPdndService.mockReturnValue({
        data: { ...EXISTING_SERVICE, subUnitCode: 'SU1' },
        isPending: false
      });
      mockGetPdndClientsByOrgSubUnitCode.mockReturnValue({ data: CLIENTS });

      render(
        <AddIntegration mode={IntegrationMode.EDIT} />,
        '/?purposeId=purpose-1&subUnitCode=SU1'
      );

      await waitFor(() => {
        expect(screen.getByTestId('E_SERVICE.eServiceName')).toHaveValue(
          'Service one'
        );
      });
      expect(mockGetPdndService).toHaveBeenCalledWith(33, 'purpose-1', 'SU1');
      expect(mockUpdatePdndService).toHaveBeenCalledWith(
        33,
        'purpose-1',
        'SU1'
      );
      expect(screen.getByTestId('option-subUnit')).toBeChecked();
      expect(screen.getByTestId('option-subUnit')).toBeDisabled();
    });

    it('asks for confirmation before updating the service', async () => {
      renderEdit();
      await waitFor(() => {
        expect(screen.getByTestId('E_SERVICE.eServiceName')).toHaveValue(
          'Service one'
        );
      });

      fireEvent.change(screen.getByTestId('E_SERVICE.eServiceName'), {
        target: { value: 'Updated service' }
      });
      fireEvent.change(screen.getByTestId('E_SERVICE.clientId'), {
        target: { value: 'client-2' }
      });
      fireEvent.click(screen.getByTestId('next-button'));

      await waitFor(() => {
        expect(
          screen.getByTestId('confirm-eservice-update-dialog')
        ).toBeInTheDocument();
      });
      expect(mockUpdatePdndServiceMutateAsync).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();

      fireEvent.click(
        screen.getByTestId('confirm-eservice-update-dialog-confirm-button')
      );

      await waitFor(() => {
        expect(
          mockUpdatePdndServiceMutateAsync
        ).toHaveBeenCalledExactlyOnceWith({
          serviceName: 'Updated service',
          clientId: 'client-2'
        });
      });
      expect(mockNavigate).toHaveBeenCalledWith(-1);
      expect(utils.notify.emit).toHaveBeenCalledWith('commons.done', 'success');
    });

    it('does not update the service when the confirmation is cancelled', async () => {
      renderEdit();
      await waitFor(() => {
        expect(screen.getByTestId('E_SERVICE.eServiceName')).toHaveValue(
          'Service one'
        );
      });

      fireEvent.click(screen.getByTestId('next-button'));
      await waitFor(() => {
        expect(
          screen.getByTestId('confirm-eservice-update-dialog')
        ).toBeInTheDocument();
      });

      fireEvent.click(
        screen.getByTestId('confirm-eservice-update-dialog-cancel-button')
      );

      await waitFor(() => {
        expect(
          screen.queryByTestId('confirm-eservice-update-dialog')
        ).not.toBeInTheDocument();
      });
      expect(mockUpdatePdndServiceMutateAsync).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('notifies when the update fails without navigating away', async () => {
      mockUpdatePdndServiceMutateAsync.mockRejectedValueOnce(
        new Error('Update failed')
      );
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);

      renderEdit();
      await waitFor(() => {
        expect(screen.getByTestId('E_SERVICE.eServiceName')).toHaveValue(
          'Service one'
        );
      });

      fireEvent.click(screen.getByTestId('next-button'));
      await waitFor(() => {
        expect(
          screen.getByTestId('confirm-eservice-update-dialog')
        ).toBeInTheDocument();
      });
      fireEvent.click(
        screen.getByTestId('confirm-eservice-update-dialog-confirm-button')
      );

      await waitFor(() => {
        expect(utils.notify.emit).toHaveBeenCalledWith(
          'integrations.add.errors.saveIntegration.message'
        );
      });
      expect(consoleSpy).toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(utils.notify.emit).not.toHaveBeenCalledWith(
        'commons.done',
        'success'
      );
      expect(
        screen.queryByTestId('confirm-eservice-update-dialog')
      ).not.toBeInTheDocument();
    });

    it('does not ask for confirmation when the required fields are empty', async () => {
      renderEdit();
      await waitFor(() => {
        expect(screen.getByTestId('E_SERVICE.eServiceName')).toHaveValue(
          'Service one'
        );
      });

      fireEvent.change(screen.getByTestId('E_SERVICE.eServiceName'), {
        target: { value: '' }
      });
      fireEvent.click(screen.getByTestId('next-button'));

      await waitFor(() => {
        expect(
          screen.getByTestId('E_SERVICE.eServiceName-error')
        ).toHaveTextContent('commons.required');
      });
      expect(
        screen.queryByTestId('confirm-eservice-update-dialog')
      ).not.toBeInTheDocument();
      expect(mockUpdatePdndServiceMutateAsync).not.toHaveBeenCalled();
    });
  });

  describe('PDND client edit', () => {
    const EXISTING_CLIENT = {
      clientId: 'client-1',
      organizationId: 33,
      clientName: 'Client one',
      kid: 'kid-1',
      publicKey: 'public-key'
    } as PdndClientNoSecretDTO;

    const renderEdit = () => {
      vi.mocked(useParams).mockReturnValue({
        organizationId: '33',
        IntegrationType: IntegrationType.PDND_CLIENT
      });
      mockGetPdndClient.mockReturnValue({
        data: EXISTING_CLIENT,
        isPending: false
      });

      return render(
        <AddIntegration mode={IntegrationMode.EDIT} />,
        '/?clientId=client-1'
      );
    };

    it('prefills the client and makes only the client ID read-only', async () => {
      renderEdit();

      await waitFor(() => {
        expect(screen.getByTestId('PDND_CLIENT.clientName')).toHaveValue(
          'Client one'
        );
      });
      expect(screen.getByTestId('PDND_CLIENT.clientId')).toHaveValue(
        'client-1'
      );
      expect(screen.getByTestId('PDND_CLIENT.clientId')).toBeDisabled();
      expect(screen.getByTestId('PDND_CLIENT.kid')).toHaveValue('kid-1');
      expect(screen.getByTestId('PDND_CLIENT.kid')).not.toBeDisabled();
      expect(screen.getByTestId('PDND_CLIENT.publicKey')).toHaveValue(
        'public-key'
      );
      expect(screen.getByTestId('PDND_CLIENT.publicKey')).not.toBeDisabled();
      expect(screen.getByTestId('PDND_CLIENT.privateKey')).toHaveValue('');
      expect(screen.getByTestId('option-organization')).toBeChecked();
      expect(screen.getByTestId('option-organization')).toBeDisabled();
      expect(mockGetPdndClient).toHaveBeenCalledWith(33, 'client-1');
    });

    it('disables the confirm button while the client is loading', () => {
      vi.mocked(useParams).mockReturnValue({
        organizationId: '33',
        IntegrationType: IntegrationType.PDND_CLIENT
      });
      mockGetPdndClient.mockReturnValue({
        data: undefined,
        isPending: true
      });

      render(
        <AddIntegration mode={IntegrationMode.EDIT} />,
        '/?clientId=client-1'
      );

      expect(screen.getByTestId('next-button')).toBeDisabled();
    });

    it('keeps the sub-unit of a sub-unit client and disables its owner selection', async () => {
      vi.mocked(useParams).mockReturnValue({
        organizationId: '33',
        IntegrationType: IntegrationType.PDND_CLIENT
      });
      mockGetPdndClient.mockReturnValue({
        data: { ...EXISTING_CLIENT, subUnitCode: 'SU1' },
        isPending: false
      });

      render(
        <AddIntegration mode={IntegrationMode.EDIT} />,
        '/?clientId=client-1&subUnitCode=SU1'
      );

      await waitFor(() => {
        expect(screen.getByTestId('PDND_CLIENT.clientName')).toHaveValue(
          'Client one'
        );
      });
      expect(screen.getByTestId('option-subUnit')).toBeChecked();
      expect(screen.getByTestId('option-subUnit')).toBeDisabled();
      expect(screen.getByTestId('PDND_CLIENT.subUnitCode')).toBeDisabled();
      expect(mockUpdatePdndClient).toHaveBeenCalledWith(33, 'client-1');
    });

    it('asks for confirmation before updating the client', async () => {
      renderEdit();
      await waitFor(() => {
        expect(screen.getByTestId('PDND_CLIENT.clientName')).toHaveValue(
          'Client one'
        );
      });

      fireEvent.change(screen.getByTestId('PDND_CLIENT.clientName'), {
        target: { value: 'Updated client' }
      });
      fireEvent.change(screen.getByTestId('PDND_CLIENT.privateKey'), {
        target: { value: 'new-private-key' }
      });
      fireEvent.click(screen.getByTestId('next-button'));

      await waitFor(() => {
        expect(
          screen.getByTestId('confirm-pdnd-client-update-dialog')
        ).toBeInTheDocument();
      });
      expect(mockUpdatePdndClientMutateAsync).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();

      fireEvent.click(
        screen.getByTestId('confirm-pdnd-client-update-dialog-confirm-button')
      );

      await waitFor(() => {
        expect(mockUpdatePdndClientMutateAsync).toHaveBeenCalledExactlyOnceWith(
          {
            organizationId: 33,
            clientName: 'Updated client',
            kid: 'kid-1',
            publicKey: 'public-key',
            privateKey: 'new-private-key'
          }
        );
      });
      expect(mockNavigate).toHaveBeenCalledWith(-1);
      expect(utils.notify.emit).toHaveBeenCalledWith('commons.done', 'success');
    });

    it('does not update the client when the confirmation is cancelled', async () => {
      renderEdit();
      await waitFor(() => {
        expect(screen.getByTestId('PDND_CLIENT.clientName')).toHaveValue(
          'Client one'
        );
      });

      fireEvent.change(screen.getByTestId('PDND_CLIENT.privateKey'), {
        target: { value: 'new-private-key' }
      });
      fireEvent.click(screen.getByTestId('next-button'));
      await waitFor(() => {
        expect(
          screen.getByTestId('confirm-pdnd-client-update-dialog')
        ).toBeInTheDocument();
      });

      fireEvent.click(
        screen.getByTestId('confirm-pdnd-client-update-dialog-cancel-button')
      );

      await waitFor(() => {
        expect(
          screen.queryByTestId('confirm-pdnd-client-update-dialog')
        ).not.toBeInTheDocument();
      });
      expect(mockUpdatePdndClientMutateAsync).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('notifies when the update fails without navigating away', async () => {
      mockUpdatePdndClientMutateAsync.mockRejectedValueOnce(
        new Error('Update failed')
      );
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);

      renderEdit();
      await waitFor(() => {
        expect(screen.getByTestId('PDND_CLIENT.clientName')).toHaveValue(
          'Client one'
        );
      });

      fireEvent.change(screen.getByTestId('PDND_CLIENT.privateKey'), {
        target: { value: 'new-private-key' }
      });
      fireEvent.click(screen.getByTestId('next-button'));
      await waitFor(() => {
        expect(
          screen.getByTestId('confirm-pdnd-client-update-dialog')
        ).toBeInTheDocument();
      });
      fireEvent.click(
        screen.getByTestId('confirm-pdnd-client-update-dialog-confirm-button')
      );

      await waitFor(() => {
        expect(utils.notify.emit).toHaveBeenCalledWith(
          'integrations.add.errors.saveIntegration.message'
        );
      });
      expect(consoleSpy).toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(utils.notify.emit).not.toHaveBeenCalledWith(
        'commons.done',
        'success'
      );
      expect(
        screen.queryByTestId('confirm-pdnd-client-update-dialog')
      ).not.toBeInTheDocument();
    });

    it('does not ask for confirmation when a required field is empty', async () => {
      renderEdit();
      await waitFor(() => {
        expect(screen.getByTestId('PDND_CLIENT.clientName')).toHaveValue(
          'Client one'
        );
      });

      // The private key is never loaded, so it must be entered to save.
      fireEvent.click(screen.getByTestId('next-button'));

      await waitFor(() => {
        expect(
          screen.getByTestId('PDND_CLIENT.privateKey-error')
        ).toHaveTextContent('commons.required');
      });
      expect(
        screen.queryByTestId('confirm-pdnd-client-update-dialog')
      ).not.toBeInTheDocument();
      expect(mockUpdatePdndClientMutateAsync).not.toHaveBeenCalled();
    });
  });
});
