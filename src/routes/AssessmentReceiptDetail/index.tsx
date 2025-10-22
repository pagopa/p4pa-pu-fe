import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate, useParams } from 'react-router';
import { useStore } from '../../store/GlobalStore';
import { PageRoutes } from '../../routes';
import ReceiptDetail from '../../components/ReceiptDetail';
import { useReceiptDetail } from '../../hooks/useReceiptDetail';
import { useEffect } from 'react';
import { BredcrumbItem } from '../../components/Breadcrumbs/Breadcrumbs';
import { setCustomBreadcrumbsItems } from '../../store/AppStateStore';

export const AssessmentReceiptDetail = () => {
  const { t } = useTranslation();
  const {
    state: { organizationId }
  } = useStore();
  const navigate = useNavigate();
  const params = useParams();

  const { receiptId: receiptIdString, assessmentId } = params;
  const receiptId = Number(receiptIdString);

  if (isNaN(receiptId)) {
    navigate(PageRoutes.RESPONSES_ERROR);
  }

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
        // FIXME: This should be the assessment name
        label: '__ASSESSMENT_NAME_HERE__',
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
  }, [receiptId]);

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
