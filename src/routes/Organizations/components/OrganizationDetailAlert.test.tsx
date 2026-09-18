import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { OrganizationDetail } from '../../../../generated/core/data-contracts';
import { render, screen } from '../../../__tests__/renderers';
import { OrganizationDetailAlert } from './OrganizationDetailAlert';

const baseOrganizationDetail = {
  iban: 'IT60X0542811101000000123456',
  orgLogo: 'data:image',
  segregationCode: '01'
} as OrganizationDetail;

describe('OrganizationDetailAlert', () => {
  it('renders nothing when all mandatory fields are present', () => {
    render(
      <OrganizationDetailAlert
        organizationDetailData={baseOrganizationDetail}
        onEdit={vi.fn()}
      />
    );

    expect(
      screen.queryByTestId('org-empty-fields-error')
    ).not.toBeInTheDocument();
  });

  it('renders the alert listing each missing mandatory field', () => {
    const dataWithMissingFields = {
      ...baseOrganizationDetail,
      iban: '',
      orgLogo: undefined,
      segregationCode: ' - '
    };

    render(
      <OrganizationDetailAlert
        organizationDetailData={dataWithMissingFields}
        onEdit={vi.fn()}
      />
    );

    expect(screen.getByTestId('org-empty-fields-error')).toBeInTheDocument();
    expect(
      screen.getByText('organizations.alertBody', { exact: false })
    ).toBeInTheDocument();
  });

  it('calls onEdit when the edit button is clicked', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(
      <OrganizationDetailAlert
        organizationDetailData={{ ...baseOrganizationDetail, iban: '' }}
        onEdit={onEdit}
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'organizations.alertButton' })
    );

    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});
