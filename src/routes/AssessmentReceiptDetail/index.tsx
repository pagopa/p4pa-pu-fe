import { useTranslation } from 'react-i18next';
import {
  generatePath,
  useLocation,
  useNavigate,
  useParams
} from 'react-router';
import { useStore } from '../../store/GlobalStore';
import { PageRoutes } from '../../routes';
import ReceiptDetail from '../../components/ReceiptDetail';
import { useReceiptDetail } from '../../hooks/useReceiptDetail';
import { useEffect, useState } from 'react';
import { BredcrumbItem } from '../../components/Breadcrumbs/Breadcrumbs';
import { setCustomBreadcrumbsItems } from '../../store/AppStateStore';
import { getAssessmentDetail } from '../../api/assessments/assessmentDetail/assessmentDetail';

export const AssessmentReceiptDetail = () => {
  const { t } = useTranslation();
  const {
    state: { organizationId }
  } = useStore();
  const navigate = useNavigate();
  const { receiptId: receiptIdString, assessmentId: assessmentIdString } =
    useParams();
  const { state } = useLocation();

  const [assessmentName, setAssessmentName] = useState(
    state?.assessmentName || ''
  );

  const receiptId = Number(receiptIdString);
  const assessmentId = Number(assessmentIdString);
  if (isNaN(receiptId) || isNaN(assessmentId)) {
    navigate(PageRoutes.RESPONSES_ERROR);
  }

  const getAssessmentDetailMutation = getAssessmentDetail(
    organizationId,
    assessmentId,
    { page: 0, size: 1 }
  );

  const getAssesmentName = async () => {
    try {
      const response = await getAssessmentDetailMutation.mutateAsync({
        filters: {},
        pagination: { page: 0, size: 1 },
        sort: []
      });
      setAssessmentName(response.assessmentsName);
    } catch {
      setAssessmentName(`${t('assessment.assessment')} ${assessmentId}`);
    }
  };

  useEffect(() => {
    if (!assessmentName) {
      getAssesmentName();
    }
  }, [assessmentName]);

  // Setup custom breadcrumb for assessment context
  useEffect(() => {
    const customBreadcrumbsItems: Array<BredcrumbItem> = [
      {
        pathname: PageRoutes.ASSESSMENT_INDEX,
        id: 'ASSESSMENT'
      },
      {
        pathname: PageRoutes.ASSESSMENT_SEARCH_RESULTS,
        id: 'ASSESSMENT_SEARCH_RESULTS'
      },
      {
        pathname: generatePath(PageRoutes.ASSESSMENT_DETAIL, {
          id: assessmentId
        }),
        label: assessmentName,
        id: 'ASSESSMENT_DETAIL'
      },
      {
        pathname: generatePath(PageRoutes.ASSESSMENT_RECEIPT_DETAIL, {
          assessmentId,
          receiptId
        }),
        label: t('assessmentDetail.paymentDetail.title'),
        id: 'ASSESSMENT_RECEIPT_DETAIL'
      }
    ];
    setCustomBreadcrumbsItems(customBreadcrumbsItems);
  }, [receiptId, assessmentId, assessmentName]);

  const { paymentData, summaryData } = useReceiptDetail(
    organizationId,
    receiptId
  );

  return (
    <ReceiptDetail
      summaryData={summaryData}
      paymentData={paymentData}
      pageTitle={t('assessmentDetail.paymentDetail.title')}
      accessibleTitle={t('assessmentDetail.paymentDetail.accessibleTitle')}
    />
  );
};
