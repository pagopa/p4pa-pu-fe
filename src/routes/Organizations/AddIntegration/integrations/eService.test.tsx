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
        options
      }: {
        name: string;
        control: Control<AddIntegrationFormData>;
        options: Array<{ value: string; label: React.ReactNode }>;
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
        options
      }: {
        name: string;
        control: Control<AddIntegrationFormData>;
        label: string;
        options: Array<{ value: string; label: string }>;
      }) => {
        const { field } = useFormField(name, control);

        return (
          <div>
            <label htmlFor={name}>{label}</label>
            <select
              id={name}
              data-testid={name}
              value={String(field.value ?? '')}
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
        label
      }: {
        name: string;
        control: Control<AddIntegrationFormData>;
        label: string;
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
  ownerType = EServiceOwnerType.ORGANIZATION
}: {
  clients?: Array<PdndClientView>;
  subUnits?: Array<OrgAndSubUnitDTO>;
  ownerType?: EServiceOwnerType;
} = {}) => {
  mockGetPdndClientsByOrgSubUnitCode.mockReturnValue({ data: clients });

  const Parent = () => {
    const { control } = useForm<AddIntegrationFormData>({
      defaultValues: { E_SERVICE: DEFAULT_ESERVICE_VALUES }
    });

    return (
      <EServiceIntegration
        control={control}
        organizationId={33}
        orgSubUnitsWithNoServiceType={subUnits}
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
});
