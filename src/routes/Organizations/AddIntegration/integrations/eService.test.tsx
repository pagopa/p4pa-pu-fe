import { fireEvent, render, screen, within } from '@testing-library/react';
import { useController, useForm } from 'react-hook-form';
import type { Control, FieldPath } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  OrgAndSubUnitDTO,
  PdndClientView
} from '@generated/core/data-contracts';

import { EServiceOwnerType } from '../../enums';
import {
  DEFAULT_ESERVICE_VALUES,
  type AddIntegrationFormData
} from '../AddIntegrationSchema';
import { EServiceIntegration } from './eService';

const { mockGetPdndClientsByOrgSubUnitCode } = vi.hoisted(() => ({
  mockGetPdndClientsByOrgSubUnitCode: vi.fn()
}));

vi.mock('@core/api/integrations', () => ({
  useGetPdndClientsByOrgSubUnitCode: mockGetPdndClientsByOrgSubUnitCode
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

vi.mock('@core/components/FormComponent', () => {
  return {
    FormComponent: {
      ControlledRadioGroup: ({
        name,
        control,
        options,
        disabled
      }: {
        name: string;
        control: Control<AddIntegrationFormData>;
        options: Array<{ value: string; label: React.ReactNode }>;
        disabled?: boolean;
      }) => {
        const { field } = useFormField(name, control);

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
        control: Control<AddIntegrationFormData>;
        label: string;
        options: Array<{ value: string; label: string }>;
        disabled?: boolean;
      }) => {
        const { field } = useFormField(name, control);

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
          </div>
        );
      },
      ControlledTextField: ({
        name,
        control,
        label,
        disabled
      }: {
        name: string;
        control: Control<AddIntegrationFormData>;
        label: string;
        disabled?: boolean;
      }) => {
        const { field } = useFormField(name, control);

        return (
          <label htmlFor={name}>
            {label}
            <input
              id={name}
              data-testid={name}
              name={field.name}
              value={String(field.value ?? '')}
              disabled={disabled}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
            />
          </label>
        );
      }
    }
  };
});

const useFormField = (
  name: string,
  control: Control<AddIntegrationFormData>
) => {
  return useController({
    name: name as FieldPath<AddIntegrationFormData>,
    control
  });
};

const SUB_UNITS = [
  {
    subUnitCode: 'SU1',
    subUnitName: 'Sub unit one'
  } as OrgAndSubUnitDTO
];

const CLIENTS = [
  {
    clientId: 'client-1',
    clientName: 'Client one'
  } as PdndClientView
];

const renderIntegration = ({
  clients = CLIENTS,
  subUnits = SUB_UNITS,
  allSubUnits,
  ownerType = EServiceOwnerType.ORGANIZATION,
  editMode = false,
  serviceSubUnitCode,
  serviceSubUnitName
}: {
  clients?: Array<PdndClientView>;
  subUnits?: Array<OrgAndSubUnitDTO>;
  allSubUnits?: Array<OrgAndSubUnitDTO>;
  ownerType?: EServiceOwnerType;
  editMode?: boolean;
  serviceSubUnitCode?: string;
  serviceSubUnitName?: string;
} = {}) => {
  mockGetPdndClientsByOrgSubUnitCode.mockReturnValue({ data: clients });

  const initialOwnerType =
    editMode && serviceSubUnitCode
      ? EServiceOwnerType.SUB_UNIT
      : EServiceOwnerType.ORGANIZATION;

  const Parent = () => {
    const { control } = useForm<AddIntegrationFormData>({
      defaultValues: {
        E_SERVICE: {
          ...DEFAULT_ESERVICE_VALUES,
          ownerType: initialOwnerType,
          subUnitCode: serviceSubUnitCode ?? ''
        }
      }
    });

    return (
      <EServiceIntegration
        control={control}
        organizationId={33}
        orgSubUnitsWithNoServiceType={subUnits}
        subUnits={allSubUnits}
        editMode={editMode}
        serviceSubUnitCode={serviceSubUnitCode}
        serviceSubUnitName={serviceSubUnitName}
      />
    );
  };

  const result = render(<Parent />);

  if (ownerType === EServiceOwnerType.SUB_UNIT) {
    fireEvent.click(screen.getByTestId(`option-${ownerType}`));
  }

  return result;
};

describe('EServiceIntegration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the no-clients alert and hides the configuration when there are no clients', () => {
    renderIntegration({ clients: [] });

    expect(screen.getByRole('alert')).toHaveTextContent(
      'integrations.add.eService.errors.noClients.organization.title'
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'integrations.add.eService.errors.noClients.organization.message'
    );
    expect(screen.queryByRole('group')).not.toBeInTheDocument();
  });

  it('shows the already-exists alert when the organization cannot add a service', () => {
    renderIntegration();

    expect(screen.getByRole('alert')).toHaveTextContent(
      'integrations.add.eService.errors.serviceAlreadyExists.organization.title'
    );
    expect(screen.queryByRole('group')).not.toBeInTheDocument();
  });

  it('shows eligible sub-units and the configuration for a sub-unit owner', () => {
    renderIntegration({ ownerType: EServiceOwnerType.SUB_UNIT });

    const subUnitSelect = screen.getByTestId('E_SERVICE.subUnitCode');
    expect(
      within(subUnitSelect).getByRole('option', { name: 'Sub unit one' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('E_SERVICE.eServiceName')).toBeInTheDocument();
    expect(screen.getByTestId('E_SERVICE.purposeId')).toBeInTheDocument();

    const clientSelect = screen.getByTestId('E_SERVICE.clientId');
    expect(
      within(clientSelect).getByRole('option', { name: 'Client one' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('queries clients for the selected sub-unit', () => {
    renderIntegration({ ownerType: EServiceOwnerType.SUB_UNIT });
    fireEvent.change(screen.getByTestId('E_SERVICE.subUnitCode'), {
      target: { value: 'SU1' }
    });

    expect(mockGetPdndClientsByOrgSubUnitCode).toHaveBeenLastCalledWith(
      33,
      'SU1'
    );
  });

  it('in edit mode shows only the editable name and client ID', () => {
    renderIntegration({ editMode: true });

    expect(screen.getByTestId('option-organization')).toBeDisabled();
    expect(screen.getByTestId('option-subUnit')).toBeDisabled();
    expect(
      screen.queryByTestId('E_SERVICE.subUnitCode')
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    expect(screen.getByTestId('E_SERVICE.eServiceName')).toBeEnabled();
    expect(screen.getByTestId('E_SERVICE.purposeId')).toBeDisabled();
    expect(screen.getByTestId('E_SERVICE.clientId')).toBeInTheDocument();
  });

  it('in edit mode shows the current sub-unit as a disabled field', () => {
    renderIntegration({
      editMode: true,
      ownerType: EServiceOwnerType.SUB_UNIT,
      serviceSubUnitCode: 'SU9',
      serviceSubUnitName: 'Current sub unit'
    });

    const subUnitSelect = screen.getByTestId('E_SERVICE.subUnitCode');
    expect(subUnitSelect).toBeDisabled();
    expect(
      within(subUnitSelect).getByRole('option', { name: 'Current sub unit' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('option-subUnit')).toBeChecked();
    expect(screen.getByTestId('option-subUnit')).toBeDisabled();
  });

  it('in edit mode shows the full sub-unit list with the current one selected', () => {
    renderIntegration({
      editMode: true,
      ownerType: EServiceOwnerType.SUB_UNIT,
      serviceSubUnitCode: 'SU2',
      serviceSubUnitName: 'Sub unit two',
      allSubUnits: [
        { subUnitCode: 'SU1', subUnitName: 'Sub unit one' },
        { subUnitCode: 'SU2', subUnitName: 'Sub unit two' }
      ] as Array<OrgAndSubUnitDTO>
    });

    const subUnitSelect = screen.getByTestId('E_SERVICE.subUnitCode');
    expect(
      within(subUnitSelect).getByRole('option', { name: 'Sub unit one' })
    ).toBeInTheDocument();
    expect(subUnitSelect).toHaveValue('SU2');
  });
});
