import { fireEvent, render, screen } from '@testing-library/react';
import AssessmentActionMenu, { Props } from './AssessmentActionMenu';
import { StoreProvider } from '../../store/GlobalStore';
import { AssessmentStatus } from '../../../generated/data-contracts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as assessmentAPIS from '../../api/assessments';
import { MemoryRouter, Route, Routes } from 'react-router';
import { setOrganizationId } from '../../store/OrganizationIdStore';

const ORG_ID = 1;
const ASSESSSMENT_ID = 8;

const queryClient = new QueryClient();

const renderAssessmentActionMenu = (props?: Props) =>
  render(
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <MemoryRouter initialEntries={[`/${ASSESSSMENT_ID}`]} initialIndex={0}>
          <Routes>
            <Route path="/:id" element={<AssessmentActionMenu {...props} />} />
          </Routes>
        </MemoryRouter>
      </StoreProvider>
    </QueryClientProvider>
  );

describe('AssessmentActionMenu component:', () => {
  it('should render withouth errors', () => {
    const { container } = renderAssessmentActionMenu({
      flagManualGeneration: true,
      status: AssessmentStatus.ACTIVE
    });
    expect(container).not.toBeEmptyDOMElement();
  });

  it('should render nothing when flagManualGeneration === false', () => {
    const { container } = renderAssessmentActionMenu({
      flagManualGeneration: false
    });
    expect(container).toBeEmptyDOMElement();
  });

  it('should render nothing when status == CANCELLED', () => {
    const { container } = renderAssessmentActionMenu({
      status: AssessmentStatus.CANCELLED
    });
    expect(container).toBeEmptyDOMElement();
  });

  it('should render a menu whit both close and delete action when flagManualGeneration == true and status == ACTIVE', () => {
    const { container } = renderAssessmentActionMenu({
      flagManualGeneration: true,
      status: AssessmentStatus.ACTIVE
    });
    expect(container).not.toBeEmptyDOMElement();
    expect(screen.getByTestId('assessment-action-menu')).toBeVisible();
    fireEvent.click(screen.getByTestId('assessment-action-menu'));
    expect(screen.getByTestId('assessment-action-close')).toBeVisible();
    expect(screen.getByTestId('assessment-action-delete')).toBeVisible();
  });

  it('should render a menu whit delete action when flagManualGeneration == true and status == CLOSED', () => {
    const { container } = renderAssessmentActionMenu({
      flagManualGeneration: true,
      status: AssessmentStatus.CLOSED
    });
    expect(container).not.toBeEmptyDOMElement();
    expect(screen.getByTestId('assessment-action-menu')).toBeVisible();
    fireEvent.click(screen.getByTestId('assessment-action-menu'));
    expect(screen.queryByTestId('assessment-action-close')).toBeNull();
    expect(screen.getByTestId('assessment-action-delete')).toBeVisible();
  });

  it('should fire the API call correctly clicking on action item', () => {
    const mutateAsyncSpy = vi.fn();
    const mutationSpy = vi
      .spyOn(assessmentAPIS, 'updateAssessmentsStatus')
      .mockImplementation(
        () =>
          ({
            mutateAsync: mutateAsyncSpy
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          }) as any
      );

    setOrganizationId(ORG_ID);

    renderAssessmentActionMenu({
      flagManualGeneration: true,
      status: AssessmentStatus.ACTIVE
    });

    expect(mutationSpy).toHaveBeenCalledWith(ORG_ID);

    fireEvent.click(screen.getByTestId('assessment-action-menu'));

    fireEvent.click(screen.getByTestId('assessment-action-close'));
    expect(mutateAsyncSpy).toHaveBeenCalledWith({
      assessmentId: ASSESSSMENT_ID,
      status: AssessmentStatus.CLOSED
    });

    fireEvent.click(screen.getByTestId('assessment-action-delete'));
    expect(mutateAsyncSpy).toHaveBeenCalledWith({
      assessmentId: ASSESSSMENT_ID,
      status: AssessmentStatus.CANCELLED
    });
  });
});
