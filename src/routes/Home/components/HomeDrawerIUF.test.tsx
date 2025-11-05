import { describe, it, beforeEach, vi, expect } from 'vitest';
import { render, screen, waitFor, within } from '../../../__tests__/renderers';
import userEvent from '@testing-library/user-event';
import { i18nTestSetup } from '../../../__tests__/i18nTestSetup';
import { DashboardByIuf } from '../../../../generated/data-contracts';

const mockNavigate = vi.fn();
vi.mock('../../../hooks/useAppNavigation', () => ({
  useAppNavigate: () => mockNavigate
}));

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  generatePath: () => '/mocked'
}));

import { HomeDrawerIUF } from './HomeDrawerIUF';

describe('HomeDrawerIUF', () => {
  const baseResults: DashboardByIuf = {
    hasIuf: false,
    hasClassification: false,
    hasTreasury: false
  } as DashboardByIuf;

  beforeEach(() => {
    vi.clearAllMocks();
    i18nTestSetup({
      'home.drawer.iuf': 'Visualizza rendicontazione',
      'home.drawer.iufs': 'Visualizza le rendicontazioni',
      'home.drawer.classification': 'Verifica lo stato del pagamento',
      'home.drawer.classifications': 'Verifica lo stato dei pagamenti',
      'home.drawer.treasury': 'Vedi bolletta',
      'home.drawer.treasuries': 'Vedi bollette'
    });
  });

  it('navigates to IUF detail when iuf present, else to list', async () => {
    const withIuf: DashboardByIuf = {
      ...baseResults,
      hasIuf: true,
      iuf: 'IUF123'
    } as DashboardByIuf;
    render(<HomeDrawerIUF searchValue="IUF123" searchResults={withIuf} />);
    const detail = await screen.findByText('Visualizza rendicontazione');
    await userEvent.click(detail);
    expect(mockNavigate).toHaveBeenCalled();

    const withoutIuf: DashboardByIuf = {
      ...baseResults,
      hasIuf: true
    } as DashboardByIuf;
    render(<HomeDrawerIUF searchValue="IUF456" searchResults={withoutIuf} />);
    const list = await screen.findByText('Visualizza le rendicontazioni');
    await userEvent.click(list);
    expect(mockNavigate).toHaveBeenCalledTimes(2);
  });

  it('navigates to classification detail when classificationId present, else to list', async () => {
    const withCls: DashboardByIuf = {
      ...baseResults,
      hasClassification: true,
      classificationId: 10
    } as DashboardByIuf;
    render(<HomeDrawerIUF searchValue="IUF123" searchResults={withCls} />);
    const clsDetail = await screen.findByText(
      'Verifica lo stato del pagamento'
    );
    await userEvent.click(clsDetail);
    expect(mockNavigate).toHaveBeenCalled();

    const withoutCls: DashboardByIuf = {
      ...baseResults,
      hasClassification: true
    } as DashboardByIuf;
    render(<HomeDrawerIUF searchValue="IUF123" searchResults={withoutCls} />);
    const clsList = await screen.findByText('Verifica lo stato dei pagamenti');
    await userEvent.click(clsList);
    expect(mockNavigate).toHaveBeenCalledTimes(2);
  });

  it('navigates to treasury detail when treasuryId present, else to list', async () => {
    const withTreasury: DashboardByIuf = {
      ...baseResults,
      hasTreasury: true,
      treasuryId: 'TRES-1'
    } as DashboardByIuf;
    const { container: firstRender } = render(
      <HomeDrawerIUF searchValue="IUF123" searchResults={withTreasury} />
    );
    const trDetailItem = within(firstRender).getByTestId(
      'home-drawer-list-item'
    );
    await userEvent.click(trDetailItem);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });

    const withoutTreasury: DashboardByIuf = {
      ...baseResults,
      hasTreasury: true
    } as DashboardByIuf;
    const { container: secondRender } = render(
      <HomeDrawerIUF searchValue="IUF123" searchResults={withoutTreasury} />
    );
    const trListItem = within(secondRender).getByTestId(
      'home-drawer-list-item'
    );
    await userEvent.click(trListItem);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledTimes(2);
    });
  });
});
