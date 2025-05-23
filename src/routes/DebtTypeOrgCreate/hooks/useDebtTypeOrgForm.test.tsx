import React from 'react';
import { render, screen, waitFor } from '../../../__tests__/renderers';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { useDebtTypeOrgForm } from './useDebtTypeOrgForm';
import { setOrganizationId } from '../../../store/OrganizationIdStore';

// Mock other dependencies except GlobalStore
vi.mock('../../../hooks/useDebtTypeOrgId', () => ({
  useDebtTypeOrgId: () => 456
}));

vi.mock('./useApiOperations', () => ({
  useApiOperations: () => ({
    createRequestPayload: vi.fn(async (data) => ({
      organizationId: 123,
      data: {
        ...data,
        debtPositionTypeId: Number(data.debtPositionTypeId),
        organizationId: 123,
        flagNotifyOutcomePush: data.flagNotifyOutcomePush === 'enable',
        xsdDefinitionRef: undefined
      }
    }))
  })
}));

vi.mock('../../../api/debtPositionsTypeOrg', () => ({
  createDebtPositionTypeOrg: () => ({
    mutateAsync: vi.fn(async () => ({ description: 'Created debt type' }))
  }),
  updateDebtPositionTypeOrg: () => ({
    mutateAsync: vi.fn(async () => ({ description: 'Updated debt type' }))
  })
}));

vi.mock('../../../utils', () => ({
  default: {
    notify: { emit: vi.fn() }
  }
}));

// Helper component to set organizationId in the store
const StoreWrapper: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  React.useEffect(() => {
    setOrganizationId(123); // Set the organizationId in the store
  }, [setOrganizationId]);

  return <>{children}</>;
};

// Test component to use the hook
const TestComponent: React.FC<{
  edit: boolean;
  onSuccess: (desc: string) => void;
}> = ({ edit, onSuccess }) => {
  const { methods, handleSubmit } = useDebtTypeOrgForm({ edit, onSuccess });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(methods.getValues());
      }}
    >
      <button type="submit">Submit</button>
    </form>
  );
};

describe('useDebtTypeOrgForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls onSuccess with created description on submit (create mode)', async () => {
    const onSuccess = vi.fn();

    render(
      <StoreWrapper>
        <TestComponent edit={false} onSuccess={onSuccess} />
      </StoreWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith('Created debt type');
    });
  });

  it('calls onSuccess with updated description on submit (edit mode)', async () => {
    const onSuccess = vi.fn();

    render(
      <StoreWrapper>
        <TestComponent edit={true} onSuccess={onSuccess} />
      </StoreWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith('Updated debt type');
    });
  });
});
