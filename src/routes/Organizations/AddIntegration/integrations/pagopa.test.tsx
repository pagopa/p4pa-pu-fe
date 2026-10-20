import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  OrganizationApiKey,
  OrganizationApiKeyType
} from '@generated/core/client';
import PagoPAIntegration from './pagopa';

const { mockGetOrganizationApiKeys } = vi.hoisted(() => ({
  mockGetOrganizationApiKeys:
    vi.fn<() => { data: Array<OrganizationApiKey> | undefined }>()
}));

vi.mock('../../../../api/organizations', () => ({
  getOrganizationApiKeys: mockGetOrganizationApiKeys
}));

describe('PagoPAIntegration', () => {
  it.each<{
    description: string;
    data: Array<OrganizationApiKey> | undefined;
    expected: Array<OrganizationApiKeyType>;
  }>([
    {
      description:
        'only offers missing types, excluding inactive configured keys',
      data: [
        { keyType: OrganizationApiKeyType.IO, flagActive: false },
        { keyType: OrganizationApiKeyType.SEND, flagActive: true }
      ],
      expected: [OrganizationApiKeyType.GENERATE_NOTICE]
    },
    {
      description: 'offers every type when no keys are configured',
      data: [],
      expected: Object.values(OrganizationApiKeyType)
    },
    {
      description: 'offers no types when every key is configured',
      data: Object.values(OrganizationApiKeyType).map((keyType) => ({
        keyType
      })),
      expected: []
    },
    {
      description: 'offers no types before configured keys have loaded',
      data: undefined,
      expected: []
    }
  ])('$description', ({ data, expected }) => {
    mockGetOrganizationApiKeys.mockReturnValue({ data });

    render(<PagoPAIntegration />);
    fireEvent.mouseDown(screen.getByRole('combobox'));

    expect(
      screen.queryAllByRole('option').map((option) => option.textContent)
    ).toEqual(expected);
  });
});
