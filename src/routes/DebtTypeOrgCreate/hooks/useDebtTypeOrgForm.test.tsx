/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen, waitFor } from '../../../__tests__/renderers';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { useDebtTypeOrgForm } from './useDebtTypeOrgForm';
import { setOrganizationId } from '../../../store/OrganizationIdStore';
import { StoreProvider } from '../../../store/GlobalStore';

const mockCreateMutateAsync = vi.fn();
const mockUpdateMutateAsync = vi.fn();

vi.mock('./useApiOperations', () => ({
  useApiOperations: () => ({
    createRequestPayload: vi.fn(async (data) => ({
      organizationId: 123,
      data: {
        debtPositionTypeOrg: {
          ...data,
          debtPositionTypeId: Number(data.debtPositionTypeId),
          organizationId: 123,
          flagNotifyOutcomePush: data.flagNotifyOutcomePush === 'enabled'
        },
        operatorsSelection: data.operatorsSelection,
        enabledOperators: data.enabledOperators || [],
        disabledOperators: data.disabledOperators || []
      }
    }))
  })
}));

vi.mock('../../../api/debtPositionsTypeOrg', () => ({
  createDebtPositionTypeOrg: () => ({
    mutateAsync: mockCreateMutateAsync
  }),
  updateDebtPositionTypeOrg: () => ({
    mutateAsync: mockUpdateMutateAsync
  }),
  getDebtPositionTypeOrgById: () => ({
    data: {
      response: {
        debtPositionTypeOrgId: 999,
        flagActive: true,
        flagExternal: false,
        description: 'Original debt type'
      }
    }
  })
}));

vi.mock('../../../hooks/useDebtTypeOrgId', () => ({
  useDebtTypeOrgId: vi.fn((edit) => (edit ? 456 : undefined))
}));

vi.mock('./useFormSchemas', () => ({
  useFormSchemas: () => ({
    stepSchemas: [{ parse: vi.fn() }, { parse: vi.fn() }, { parse: vi.fn() }],
    combinedSchema: {
      parse: vi.fn()
    }
  })
}));

vi.mock('../../../utils', () => ({
  default: {
    notify: { emit: vi.fn() }
  }
}));

const TestComponent: React.FC<{
  edit: boolean;
  onSuccess: (desc: string) => void;
}> = ({ edit, onSuccess }) => {
  const { methods, handleSubmit } = useDebtTypeOrgForm({ edit, onSuccess });

  const onSubmit = async () => {
    const formData = methods.getValues();
    await handleSubmit(formData);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <button type="submit">Submit</button>
    </form>
  );
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  React.useEffect(() => {
    setOrganizationId(123);
  }, []);

  return <StoreProvider>{children}</StoreProvider>;
};

describe('useDebtTypeOrgForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockCreateMutateAsync.mockResolvedValue({
      description: 'Created debt type'
    });

    mockUpdateMutateAsync.mockResolvedValue({
      description: 'Updated debt type'
    });
  });

  it('calls onSuccess with created description on submit (create mode)', async () => {
    const onSuccess = vi.fn();

    render(
      <TestWrapper>
        <TestComponent edit={false} onSuccess={onSuccess} />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    await waitFor(
      () => {
        expect(mockCreateMutateAsync).toHaveBeenCalled();
        expect(onSuccess).toHaveBeenCalledWith('Created debt type');
      },
      { timeout: 3000 }
    );
  });

  it('calls onSuccess with updated description on submit (edit mode)', async () => {
    const onSuccess = vi.fn();

    render(
      <TestWrapper>
        <TestComponent edit={true} onSuccess={onSuccess} />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    await waitFor(
      () => {
        expect(mockUpdateMutateAsync).toHaveBeenCalled();
        expect(onSuccess).toHaveBeenCalledWith('Updated debt type');
      },
      { timeout: 3000 }
    );
  });

  it('handles create mutation error gracefully', async () => {
    const onSuccess = vi.fn();
    const notifyEmit = vi.fn();

    vi.doMock('../../../utils', () => ({
      default: {
        notify: { emit: notifyEmit }
      }
    }));

    mockCreateMutateAsync.mockRejectedValue(new Error('API Error'));

    render(
      <TestWrapper>
        <TestComponent edit={false} onSuccess={onSuccess} />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    await waitFor(
      () => {
        expect(mockCreateMutateAsync).toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
      },
      { timeout: 3000 }
    );
  });

  it('handles update mutation error gracefully', async () => {
    const onSuccess = vi.fn();

    mockUpdateMutateAsync.mockRejectedValue(new Error('Update failed'));

    render(
      <TestWrapper>
        <TestComponent edit={true} onSuccess={onSuccess} />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    await waitFor(
      () => {
        expect(mockUpdateMutateAsync).toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
      },
      { timeout: 3000 }
    );
  });

  it('validates step correctly', async () => {
    const onSuccess = vi.fn();
    let capturedValidateStep: any;

    const TestValidationComponent: React.FC = () => {
      const { validateStep } = useDebtTypeOrgForm({ edit: false, onSuccess });
      capturedValidateStep = validateStep;
      return <div>Test</div>;
    };

    render(
      <TestWrapper>
        <TestValidationComponent />
      </TestWrapper>
    );

    const mockFormData = {
      debtPositionTypeId: '123',
      code: 'TEST',
      description: 'Test description'
    };

    const result = capturedValidateStep(0, mockFormData);
    expect(result).toHaveProperty('isValid');
    expect(result).toHaveProperty('errors');
  });

  it('successfully submits form in create mode and calls mutations', async () => {
    const onSuccess = vi.fn();

    render(
      <TestWrapper>
        <TestComponent edit={false} onSuccess={onSuccess} />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateMutateAsync).toHaveBeenCalled();
      expect(mockUpdateMutateAsync).not.toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalledWith('Created debt type');
    });
  });

  it('successfully submits form in edit mode and calls mutations', async () => {
    const onSuccess = vi.fn();

    render(
      <TestWrapper>
        <TestComponent edit={true} onSuccess={onSuccess} />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateMutateAsync).toHaveBeenCalled();
      expect(mockCreateMutateAsync).not.toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalledWith('Updated debt type');
    });
  });
});
