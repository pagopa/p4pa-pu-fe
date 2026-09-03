import { Alert, Box, SxProps, Theme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ReceiptDetailDTO } from '../../../generated/core/client';

type ReceiptDetailWarningBannerProps = {
  receiptOrigin: ReceiptDetailDTO['receiptOrigin'];
  debtPositionOrigin: ReceiptDetailDTO['debtPositionOrigin'];
  sx?: SxProps<Theme>;
};

/**
 *
 * @param receiptOrigin Enum ReceiptDetailDTO["receiptOrigin"]
 * @param debtPositionOrigin Enum ReceiptDetailDTO["debtPositionOrigin"]
 * @param sx MUI SxProps for custom styling
 * @returns A warning banner component to show technical debt position information
 */
export const ReceiptDetailWarningBanner = ({
  receiptOrigin,
  debtPositionOrigin,
  sx
}: ReceiptDetailWarningBannerProps) => {
  const { t } = useTranslation();

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

  return (
    showWarning(receiptOrigin, debtPositionOrigin) && (
      <Box sx={{ ...sx }}>
        <Alert severity="warning" data-testid="technical-debt-alert">
          {t(
            `telematicReceiptDetail.origin.${i18nString(receiptOrigin, debtPositionOrigin)}`,
            {
              defaultValue: t('telematicReceiptDetail.techDebtPositionDefault')
            }
          )}
        </Alert>
      </Box>
    )
  );
};

export default ReceiptDetailWarningBanner;
