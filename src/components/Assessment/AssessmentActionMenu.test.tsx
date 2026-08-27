import { fireEvent, render, screen } from '@testing-library/react';
import AssessmentActionMenu, { Props } from './AssessmentActionMenu';
import { StoreProvider } from '../../store/GlobalStore';
import { AssessmentStatus } from '../../../generated/core/data-contracts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as assessmentAPIS from '../../api/assessments';
import { RouterProvider, createBrowserRouter } from 'react-router';
import { setOrganizationId } from '../../store/OrganizationIdStore';
import { Layout } from '../layout/Layout';
import { Theme } from '../../utils/theme';
// NOTE: I SPENT HOURS BEFORE UNDERSTANDING THIS IS REQUIRED
// TO AUTO UPDATE THE DOM ON A SIGNAL CHANGE
import '@preact/signals-react/auto';

const ORG_ID = 1;
const ASSESSSMENT_ID = 8;

const queryClient = new QueryClient();

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useParams: () => ({ id: `${ASSESSSMENT_ID}` })
  };
});

const renderAssessmentActionMenu = (props?: Props) => {
  const routesDef = [
    {
      path: '*',
      element: <Layout />,
      children: [
        {
          element: <AssessmentActionMenu {...props} />,
          index: true
        }
      ]
    }
  ];
  return render(
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <Theme>
          <RouterProvider router={createBrowserRouter(routesDef)} />
        </Theme>
      </StoreProvider>
    </QueryClientProvider>
  );
};

describe('AssessmentActionMenu component:', () => {
  it('should render withouth errors', () => {
    const { container } = renderAssessmentActionMenu({
      flagManualGeneration: true,
      status: AssessmentStatus.ACTIVE
    });
    expect(container).not.toBeEmptyDOMElement();
  });

  it('should render nothing when flagManualGeneration === false', () => {
    renderAssessmentActionMenu({
      flagManualGeneration: false
    });
    expect(screen.queryByTestId('assessment-action-menu')).toBeNull();
  });

  it('should render nothing when status == CANCELLED', () => {
    renderAssessmentActionMenu({
      status: AssessmentStatus.CANCELLED
    });
    expect(screen.queryByTestId('assessment-action-menu')).toBeNull();
  });

  it('should render a menu with both close and delete action when flagManualGeneration == true and status == ACTIVE', () => {
    renderAssessmentActionMenu({
      flagManualGeneration: true,
      status: AssessmentStatus.ACTIVE
    });

    expect(screen.getByTestId('assessment-action-menu')).not.toBeNull();
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

  it('should fire the API call correctly clicking on action item', async () => {
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

    screen.getByTestId('confirm-close-dialog');

    fireEvent.click(screen.getByTestId('confirm-close-dialog-confirm-button'));
    expect(mutateAsyncSpy).toHaveBeenCalledWith({
      assessmentId: ASSESSSMENT_ID,
      status: AssessmentStatus.CLOSED
    });
  });
});
