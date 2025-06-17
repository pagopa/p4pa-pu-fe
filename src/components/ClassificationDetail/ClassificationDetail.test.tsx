/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '../../__tests__/renderers';
import ClassificationsDetail from './';
import * as classificationService from '../../api/getClassificationDetail';
import { setOrganizationId } from '../../store/OrganizationIdStore';
import { createMock } from 'zodock';
import { classificationDetailViewDTOSchema } from '../../../generated/zod-schema';

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    useParams: () => ({
      classificationId: '673'
    })
  };
});

const mockData = createMock(classificationDetailViewDTOSchema);
vi.mock('../../utils', () => ({
  apiClient: {
    bff: {
      getClassificationDetails: () => ({ data: mockData })
    }
  }
}));

setOrganizationId(2);

describe('Classifications Detail:', () => {
  it('renders without crashing', () => {
    render(<ClassificationsDetail />);
  });

  it('passes the right parameters to the getClassificationDetails hook', () => {
    const spyGetClassificationDetails = vi.spyOn(
      classificationService,
      'getClassificationDetail'
    );
    render(<ClassificationsDetail />);
    expect(spyGetClassificationDetails).toBeCalledWith(2, 673);
  });

  it('switching tabs works properly', async () => {
    vi.spyOn(
      classificationService,
      'getClassificationDetail'
    ).mockImplementation(() => ({ data: mockData }) as any);

    render(<ClassificationsDetail />);

    const tab0 = screen.getByTestId('classificationDetailTabDebtType');
    const tab1 = screen.getByTestId('classificationDetailTabReporting');
    const tab2 = screen.getByTestId('classificationDetailTabEarnings');

    const tabPanel0 = screen.getByTestId(
      'ClassificationDetailTabPanelDebtType'
    );
    const tabPanel1 = screen.getByTestId(
      'ClassificationDetailTabPanelReporting'
    );
    const tabPanel2 = screen.getByTestId(
      'ClassificationDetailTabPanelEarnings'
    );

    fireEvent.click(tab1);
    expect(tabPanel0).not.toBeVisible();
    expect(tabPanel1).toBeVisible();
    expect(tabPanel2).not.toBeVisible();

    fireEvent.click(tab2);
    expect(tabPanel0).not.toBeVisible();
    expect(tabPanel1).not.toBeVisible();
    expect(tabPanel2).toBeVisible();

    fireEvent.click(tab0);
    expect(tabPanel0).toBeVisible();
    expect(tabPanel1).not.toBeVisible();
    expect(tabPanel2).not.toBeVisible();
  });
});
