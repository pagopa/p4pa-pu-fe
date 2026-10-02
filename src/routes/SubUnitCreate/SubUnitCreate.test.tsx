import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AxiosError } from 'axios';
import { generatePath, useNavigate, useParams } from 'react-router';
import { type Control, useController } from 'react-hook-form';

import { createOrgSubUnit } from '@core/api/orgSubUnit';
import { SubUnitType } from '@generated/core/data-contracts';
import utils from '@core/utils';
import { PageRoutes } from '..';
import { SubUnitCreate } from '.';

vi.mock('@core/api/orgSubUnit', () => ({
  createOrgSubUnit: vi.fn()
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useParams: vi.fn()
  };
});

vi.mock('@core/components/TitleComponent/TitleComponent', () => ({
  default: ({ title }: { title: string }) => <h1>{title}</h1>
}));

vi.mock('@core/components/Wizard/SectionBox', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

vi.mock('@core/components/Wizard/WizardStepWrapper', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

vi.mock('@core/components/Wizard/WizardStepButtons', () => ({
  default: ({
    onNext,
    onBack,
    disableNext,
    disableBack
  }: {
    onNext: () => void;
    onBack: () => void;
    disableNext?: boolean;
    disableBack?: boolean;
  }) => (
    <div>
      <button data-testid="back-button" onClick={onBack} disabled={disableBack}>
        back
      </button>
      <button data-testid="next-button" onClick={onNext} disabled={disableNext}>
        next
      </button>
    </div>
  )
}));

vi.mock('@pagopa/mui-italia', async (originalModule) => ({
  ...(await originalModule()),
  MIAlert: ({
    title,
    children,
    action,
    'data-testid': dataTestId
  }: {
    title: string;
    children: React.ReactNode;
    action?: { label: string; onClick: () => void };
    'data-testid'?: string;
  }) => (
    <div data-testid={dataTestId}>
      <strong>{title}</strong>
      <p>{children}</p>
      {action && (
        <button data-testid="clear-duplicate-error" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  )
}));

vi.mock('@core/components/FormComponent', () => ({
  FormComponent: {
    ControlledTextField: ({
      name,
      control,
      label,
      'data-testid': dataTestId
    }: {
      name: string;
      control: Control<Record<string, unknown>>;
      label: string;
      'data-testid'?: string;
    }) => {
      const { field, fieldState } = useController({ name, control });
      return (
        <div>
          <label htmlFor={name}>{label}</label>
          <input
            id={name}
            data-testid={dataTestId}
            value={(field.value as string) ?? ''}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
          />
          {fieldState.error && (
            <span data-testid={`${name}-error`}>
              {fieldState.error.message}
            </span>
          )}
        </div>
      );
    },
    ControlledSelect: ({
      name,
      control,
      options,
      label,
      'data-testid': dataTestId
    }: {
      name: string;
      control: Control<Record<string, unknown>>;
      options: Array<{ value: string; label: string }>;
      label: string;
      'data-testid'?: string;
    }) => {
      const { field, fieldState } = useController({ name, control });
      return (
        <div>
          <label htmlFor={name}>{label}</label>
          <select
            id={name}
            data-testid={dataTestId}
            value={(field.value as string) ?? ''}
            onChange={(e) => field.onChange(e.target.value)}
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
    }
  }
}));

const mockNavigate = vi.fn();
const mockMutateAsync = vi.fn();
const firstSubUnitType = Object.values(SubUnitType)[0];

const fillValidForm = () => {
  fireEvent.change(screen.getByTestId('subunitCode-field'), {
    target: { value: 'SU1' }
  });
  fireEvent.change(screen.getByTestId('subunitType-field'), {
    target: { value: firstSubUnitType }
  });
  fireEvent.change(screen.getByTestId('subunitName-field'), {
    target: { value: 'Test Sub Unit' }
  });
};

describe('SubUnitCreate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(useParams).mockReturnValue({ organizationId: '33' });
    vi.mocked(createOrgSubUnit).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false
    } as unknown as ReturnType<typeof createOrgSubUnit>);
  });

  it('redirects to the error page when organizationId is not a number', () => {
    vi.mocked(useParams).mockReturnValue({ organizationId: 'abc' });

    render(<SubUnitCreate />);

    expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.ERROR);
  });

  it('initializes the create mutation with the numeric organizationId', () => {
    render(<SubUnitCreate />);

    expect(createOrgSubUnit).toHaveBeenCalledWith(33);
  });

  it('shows required-field errors and does not submit when fields are empty', async () => {
    render(<SubUnitCreate />);

    fireEvent.click(screen.getByTestId('next-button'));

    await waitFor(() => {
      expect(screen.getByTestId('subUnitCode-error')).toHaveTextContent(
        'subunits.create.subUnitCode.required'
      );
      expect(screen.getByTestId('subUnitType-error')).toHaveTextContent(
        'subunits.create.subUnitType.required'
      );
      expect(screen.getByTestId('subUnitName-error')).toHaveTextContent(
        'subunits.create.subUnitName.required'
      );
    });
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('submits the form, merges organizationId/status, and navigates with a success notification', async () => {
    mockMutateAsync.mockResolvedValue({});
    const notifySpy = vi
      .spyOn(utils.notify, 'emit')
      .mockImplementation(() => undefined);

    render(<SubUnitCreate />);
    fillValidForm();
    fireEvent.click(screen.getByTestId('next-button'));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        subUnitCode: 'SU1',
        subUnitType: firstSubUnitType,
        subUnitName: 'Test Sub Unit',
        organizationId: 33,
        status: 'ACTIVE'
      });
    });
    expect(mockNavigate).toHaveBeenCalledWith(
      generatePath(PageRoutes.ORGANIZATIONS_SUB_UNITS, { organizationId: 33 })
    );
    expect(notifySpy).toHaveBeenCalledWith('commons.done', 'success');
  });

  it('shows the duplicate-code alert on a 409 conflict, without navigating to the error page', async () => {
    const conflictError = new AxiosError('Conflict');
    conflictError.response = { status: 409 } as AxiosError['response'];
    mockMutateAsync.mockRejectedValue(conflictError);

    render(<SubUnitCreate />);
    fillValidForm();
    fireEvent.click(screen.getByTestId('next-button'));

    await waitFor(() => {
      expect(screen.getByTestId('duplicated-code-alert')).toBeInTheDocument();
      expect(screen.getByTestId('subUnitCode-error')).toHaveTextContent(
        'subunits.create.duplicatedCode.message'
      );
    });
    expect(mockNavigate).not.toHaveBeenCalledWith(PageRoutes.RESPONSES_ERROR);

    fireEvent.click(screen.getByTestId('clear-duplicate-error'));

    expect(
      screen.queryByTestId('duplicated-code-alert')
    ).not.toBeInTheDocument();
  });

  it('navigates to the generic error page for a non-409 failure', async () => {
    mockMutateAsync.mockRejectedValue(new Error('network down'));

    render(<SubUnitCreate />);
    fillValidForm();
    fireEvent.click(screen.getByTestId('next-button'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.RESPONSES_ERROR);
    });
    expect(
      screen.queryByTestId('duplicated-code-alert')
    ).not.toBeInTheDocument();
  });

  it('cancels back to the sub-units list without calling the mutation', () => {
    render(<SubUnitCreate />);

    fireEvent.click(screen.getByTestId('back-button'));

    expect(mockNavigate).toHaveBeenCalledWith(
      generatePath(PageRoutes.ORGANIZATIONS_SUB_UNITS, { organizationId: 33 })
    );
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('disables the wizard buttons while the mutation is pending', () => {
    vi.mocked(createOrgSubUnit).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true
    } as unknown as ReturnType<typeof createOrgSubUnit>);

    render(<SubUnitCreate />);

    expect(screen.getByTestId('next-button')).toBeDisabled();
    expect(screen.getByTestId('back-button')).toBeDisabled();
  });
});
