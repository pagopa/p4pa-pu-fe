import { render, screen } from '../../__tests__/renderers';
import { vi } from 'vitest';
import * as ReactRouter from 'react-router'; // import all react-router hooks
import { AssessmentRegistryDetail } from '../AssessmentsRegistryDetail';
import { useNavigate } from 'react-router';
import { setOrganizationId } from '../../store/OrganizationIdStore';
import { PageRoutes } from '..';

// Mock useNavigate
vi.mock('react-router', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useNavigate: vi.fn()
  };
});

// Mock getAssessmentsRegistry API
const mockGetAssessmentsRegistry = vi.fn();
vi.mock('../../api/assessments', () => ({
  getAssessmentsRegistry: (...args: Array<unknown>) =>
    mockGetAssessmentsRegistry(...args)
}));

describe('AssessmentRegistryDetail', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    setOrganizationId(456);
    vi.clearAllMocks();
    (useNavigate as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockNavigate
    );
    vi.clearAllMocks();
  });

  it('should navigate to error page if assessmentRegistryId param is invalid', () => {
    // Spy and override useParams return value for this test
    vi.spyOn(ReactRouter, 'useParams').mockReturnValue({
      assessmentRegistryId: 'abc'
    });

    mockGetAssessmentsRegistry.mockReturnValue({
      data: null,
      isError: true
    });

    render(<AssessmentRegistryDetail />);

    expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.RESPONSES_ERROR);
  });

  it('should navigate to error page if API returns error', () => {
    // Valid param this time
    vi.spyOn(ReactRouter, 'useParams').mockReturnValue({
      assessmentRegistryId: '123'
    });

    mockGetAssessmentsRegistry.mockReturnValue({
      data: null,
      isError: true
    });

    render(<AssessmentRegistryDetail />);

    expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.RESPONSES_ERROR);
  });

  it('should render component correctly when data is available', () => {
    vi.spyOn(ReactRouter, 'useParams').mockReturnValue({
      assessmentRegistryId: '123'
    });

    mockGetAssessmentsRegistry.mockReturnValue({
      data: {
        debtPositionTypeOrgCode: 'Type A',
        operatingYear: 2023,
        status: 'Active',
        sectionDescription: 'Section Desc',
        sectionCode: 'SC123',
        officeCode: 'OC456',
        officeDescription: 'Office Desc',
        assessmentCode: 'AC789',
        assessmentDescription: 'Assessment Desc'
      },
      isError: false
    });

    render(<AssessmentRegistryDetail />);

    expect(screen.getAllByText('Section Desc')[0]).toBeInTheDocument();
    expect(
      screen.getAllByText('AssessmentRegistryDetail.debtPositionType')[0]
    ).toBeInTheDocument();
    expect(screen.getByText('Type A')).toBeInTheDocument();
    expect(
      screen.getByText('AssessmentRegistryDetail.operatingYear')
    ).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
    expect(
      screen.getByText('AssessmentRegistryDetail.description')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'commons.edit' })
    ).toBeInTheDocument();
  });

  it('should render null if no data and no error', () => {
    vi.spyOn(ReactRouter, 'useParams').mockReturnValue({
      assessmentRegistryId: '123'
    });

    mockGetAssessmentsRegistry.mockReturnValue({
      data: null,
      isError: false
    });

    const { container } = render(<AssessmentRegistryDetail />);
    expect(container.firstChild).toBeNull();
  });
});
