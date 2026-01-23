import { Alert, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DetailContainer, {
  DetailData
} from '../DetailContainer/DetailContainer';
import TitleComponent, {
  ActionMenuItem
} from '../TitleComponent/TitleComponent';
import { ReceiptDetailDTO } from '../../../generated/apiClient';

type DetailProps = {
  pageTitle: string;
  accessibleTitle: string;
  summaryData: Array<DetailData>;
  paymentData: Array<DetailData>;
  callToAction?: ActionMenuItem;
  debtPositionOrigin?: ReceiptDetailDTO['debtPositionOrigin'];
  receiptOrigin?: ReceiptDetailDTO['receiptOrigin'];
};
/**
 *
 * @param receiptOrigin Enum ReceiptDetailDTO["receiptOrigin"]
 * @param debtPositionOrigin Enum ReceiptDetailDTO["debtPositionOrigin"]
 * @returns A string to use as key of Translation file
 */
const i18nString = (
  receiptOrigin?: ReceiptDetailDTO['receiptOrigin'],
  debtPositionOrigin?: ReceiptDetailDTO['debtPositionOrigin']
) => {
  if (
    receiptOrigin == 'RECEIPT_PAGOPA' &&
    debtPositionOrigin == 'RECEIPT_PAGOPA'
  ) {
    return 'RECEIPT_PAGOPA__RECEIPT_PAGOPA';
  }

  return receiptOrigin || 'techDebtPositionDefault';
};
/**
 *
 * @param receiptOrigin Enum ReceiptDetailDTO["receiptOrigin"]
 * @param debtPositionOrigin Enum ReceiptDetailDTO["debtPositionOrigin"]
 * @returns If receiptOrigin as a value != RECEIPT_PAGOPA always return true. Otherwise checks debtPositionOrigin value.
 */
const showWarning = (
  receiptOrigin: ReceiptDetailDTO['receiptOrigin'],
  debtPositionOrigin: ReceiptDetailDTO['debtPositionOrigin']
): boolean =>
  receiptOrigin !== 'RECEIPT_PAGOPA' ||
  (
    ['RECEIPT_PAGOPA', 'SECONDARY_ORG'] as Array<
      ReceiptDetailDTO['debtPositionOrigin']
    >
  ).includes(debtPositionOrigin);

const ReceiptDetail = ({
  pageTitle,
  accessibleTitle,
  summaryData,
  paymentData,
  callToAction,
  debtPositionOrigin,
  receiptOrigin
}: DetailProps) => {
  const { t } = useTranslation();

  return (
    <>
      <TitleComponent
        title={pageTitle}
        accessibleTitle={accessibleTitle}
        callToAction={callToAction ? [callToAction] : []}
      />
      {receiptOrigin &&
        debtPositionOrigin &&
        showWarning(receiptOrigin, debtPositionOrigin) && (
          <Alert
            severity="warning"
            data-testid="technical-debt-alert"
            sx={{ mb: 3 }}
          >
            {t(
              `telematicReceiptDetail.origin.${i18nString(receiptOrigin, debtPositionOrigin)}`,
              {
                defaultValue: t(
                  'telematicReceiptDetail.techDebtPositionDefault'
                )
              }
            )}
          </Alert>
        )}
      <Grid container spacing={3}>
        <Grid item md={6}>
          <DetailContainer
            sections={[
              {
                title: {
                  label: t('commons.summary'),
                  variant: 'overline'
                },
                data: summaryData
              }
            ]}
          />
        </Grid>
        <Grid item md={6}>
          <DetailContainer
            sections={[
              {
                title: {
                  label: t('commons.payment'),
                  variant: 'overline'
                },
                data: paymentData
              }
            ]}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default ReceiptDetail;
