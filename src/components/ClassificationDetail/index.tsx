import { useStore } from '../../store/GlobalStore';
import { generatePath, useNavigate, useParams } from 'react-router';
import { getClassificationDetail } from '../../api/getClassificationDetail';
import { Stack, Tab, useTheme } from '@mui/material';
import { SyntheticEvent, useState, useEffect } from 'react';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import DetailContainer, {
  DetailData
} from '../DetailContainer/DetailContainer';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import { useTranslation } from 'react-i18next';

import TitleComponent from '../TitleComponent/TitleComponent';
import { PageRoutes } from '../../routes';

export const ClassificationDetails = () => {
  const store = useStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const organizationId = store.state.organizationId;
  const { classificationId } = useParams();
  const { data, isError, error } = getClassificationDetail(
    organizationId,
    Number(classificationId)
  );

  useEffect(() => {
    if (isNaN(Number(classificationId))) {
      navigate(PageRoutes.RESPONSES_ERROR);
      return;
    }
    if (isError && error) {
      console.error('Error loading classification detail:', error);
      navigate(PageRoutes.RESPONSES_ERROR);
    }
  }, [classificationId, isError, error, navigate]);

  if (isNaN(Number(classificationId))) {
    return null;
  }

  const [tabIndex, setTabIndex] = useState(0);
  const theme = useTheme();
  const handleChange = (_event: SyntheticEvent, value: number) => {
    setTabIndex(value);
  };

  const targetTransalationDebtType =
    'classifications.detail.sections.telematicReceipt';
  const debtTypeData: Array<DetailData> = [
    {
      label: t(`${targetTransalationDebtType}.debtPositionTypeOrgCode`),
      value: data?.debtPositionTypeOrgCode
    },
    {
      label: t(`${targetTransalationDebtType}.paymentObject`),
      value: data?.remittanceInformation
    },
    {
      label: t(`${targetTransalationDebtType}.receiptPaymentAmount`),
      value: data?.receiptPaymentAmount,
      valueType: 'amount'
    },
    {
      label: t(`${targetTransalationDebtType}.receiptPaymentDateTime`),
      value: data?.receiptPaymentDateTime,
      valueType: 'dateTime'
    },
    {
      label: t(`${targetTransalationDebtType}.receiptDebtorFullName`),
      value: data?.receiptDebtor?.fullName
    },
    {
      label: t(`${targetTransalationDebtType}.receiptDebtorFiscalCode`),
      value: data?.receiptDebtor?.fiscalCode
    },
    {
      label: t(`${targetTransalationDebtType}.iuv`),
      value: data?.iuv
    },
    {
      label: t(`${targetTransalationDebtType}.iuv`),
      value: data?.iud
    },
    {
      label: t(`${targetTransalationDebtType}.iur`),
      value: data?.iur
    },
    {
      label: t(`${targetTransalationDebtType}.receiptPayerFullName`),
      value: data?.receiptPayer?.fullName
    },
    {
      label: t(`${targetTransalationDebtType}.receiptPayerFiscalCode`),
      value: data?.receiptPayer?.fiscalCode
    },
    {
      label: t(`${targetTransalationDebtType}.receiptDebtorFullName`),
      value: data?.receiptDebtor?.fullName
    },
    {
      label: t(`${targetTransalationDebtType}.receiptDebtorFiscalCode`),
      value: data?.receiptDebtor?.fiscalCode
    }
  ];

  const targetTransalationNotifiedPayment =
    'classifications.detail.sections.notifiedPayment';
  const notifiedPaymentData: Array<DetailData> = [
    {
      label: t(`${targetTransalationNotifiedPayment}.debtType`),
      value: data?.paymentNotificationDebtPositionTypeOrgCode
    },
    {
      label: t(`${targetTransalationNotifiedPayment}.paymentObject`),
      value: data?.paymentNotificationRemittanceInformation
    },
    {
      label: t(`${targetTransalationNotifiedPayment}.amount`),
      value: data?.paymentNotificationAmountPaidCents
    },
    {
      label: t(`${targetTransalationNotifiedPayment}.receiptPayerFullName`),
      value: data?.paymentNotificationDebtor?.fullName
    },
    {
      label: t(`${targetTransalationNotifiedPayment}.receiptPayerFiscalCode`),
      value: data?.paymentNotificationDebtor?.fiscalCode
    },
    {
      label: t(`${targetTransalationNotifiedPayment}.esecutionDate`),
      value: data?.paymentExecutionDate,
      valueType: 'date'
    },
    {
      label: t(`${targetTransalationNotifiedPayment}.iud`),
      value: data?.paymentNotificationIud
    }
  ];

  const targetTransalationReporting =
    'classifications.detail.sections.reporting';
  const reportingData: Array<DetailData> = [
    {
      label: t(`${targetTransalationReporting}.idReporting`),
      value: data?.iuf
    },
    {
      label: t(`${targetTransalationReporting}.flowDateTime`),
      value: data?.flowDateTime,
      valueType: 'dateTime'
    },
    {
      label: t(`${targetTransalationReporting}.regulationUniqueIdentifier`),
      value: data?.regulationUniqueIdentifier
    },
    {
      label: t(`${targetTransalationReporting}.regionValueDate`),
      value: data?.regionValueDate,
      valueType: 'dateTime'
    },
    {
      label: t(`${targetTransalationReporting}.totalPayments`),
      value: data?.totalPayments,
      valueType: 'amount'
    }
  ];

  const targetTransalationEarnings = 'classifications.detail.sections.earnings';
  const earningsData: Array<DetailData> = [
    {
      label: t(`${targetTransalationEarnings}.accountCode`),
      value: data?.sealCode
    },
    {
      label: t(`${targetTransalationEarnings}.pspLastName`),
      value: data?.pspLastName
    },
    {
      label: t(`${targetTransalationEarnings}.documentCode`),
      value: data?.documentCode
    },
    {
      label: t(`${targetTransalationEarnings}.billDate`),
      value: data?.billDate,
      valueType: 'date'
    },
    {
      label: t(`${targetTransalationEarnings}.billYear`),
      value: data?.billYear,
      valueType: 'date'
    },
    {
      label: t(`${targetTransalationEarnings}.provisionalAe`),
      value: data?.provisionalAe
    },
    {
      label: t(`${targetTransalationEarnings}.receptionDate`),
      value: data?.receptionDate,
      valueType: 'date'
    },
    {
      label: t(`${targetTransalationEarnings}.billCode`),
      value: data?.billCode
    },
    {
      label: t(`${targetTransalationEarnings}.provisionalCode`),
      value: data?.provisionalCode
    }
  ];

  return (
    <>
      <TitleComponent title={t('commons.routes.CLASSIFICATIONS')} />
      {data && (
        <TabContext value={tabIndex} data-testid="ClassificationDetailTabs">
          <TabList
            onChange={handleChange}
            aria-label="classification detail tabs"
            centered
            variant="fullWidth"
            sx={{ backgroundColor: theme.palette.background.paper }}
          >
            <Tab
              label={t(`${targetTransalationDebtType}.title`)}
              value={0}
              data-testid="classificationDetailTabDebtType"
            />
            <Tab
              label={t(`${targetTransalationReporting}.title`)}
              value={1}
              data-testid="classificationDetailTabReporting"
            />
            <Tab
              label={t(`${targetTransalationEarnings}.title`)}
              value={2}
              data-testid="classificationDetailTabEarnings"
            />
          </TabList>
          <TabPanel
            value={0}
            sx={{ padding: 0 }}
            data-testid="ClassificationDetailTabPanelDebtType"
          >
            <Stack spacing={3}>
              <DetailContainer
                sections={[
                  {
                    inline: true,
                    title: {
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      fontSize: '14px',
                      label: t(`${targetTransalationDebtType}.title`)
                    },
                    data: debtTypeData,
                    footerLink: {
                      label: t(`${targetTransalationDebtType}.link`),
                      icon: <ArrowRightAltIcon />,
                      iconPosition: 'right',
                      onLinkClick: () => {
                        if (data?.receiptPaymentReceiptId) {
                          navigate(
                            generatePath(PageRoutes.TELEMATIC_RECEIPT_DETAIL, {
                              id: data.receiptPaymentRequestId
                            })
                          );
                        }
                      }
                    }
                  }
                ]}
              />
              <DetailContainer
                sections={[
                  {
                    inline: true,
                    title: {
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      fontSize: '14px',
                      label: t(`${targetTransalationNotifiedPayment}.title`)
                    },
                    data: notifiedPaymentData
                  }
                ]}
              />
            </Stack>
          </TabPanel>
          <TabPanel
            value={1}
            sx={{ padding: 0 }}
            data-testid="ClassificationDetailTabPanelReporting"
          >
            <DetailContainer
              sections={[
                {
                  inline: true,
                  title: {
                    label: t(`${targetTransalationReporting}.title`),
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    fontSize: '14px'
                  },
                  data: reportingData,
                  footerLink: {
                    label: t(`${targetTransalationReporting}.link`),
                    icon: <ArrowRightAltIcon />,
                    iconPosition: 'right',
                    onLinkClick: () => {
                      if (data?.treasuryId) {
                        navigate(
                          generatePath(PageRoutes.REPORTING_DETAIL, {
                            id: data.paymentsReportingId
                          })
                        );
                      }
                    }
                  }
                }
              ]}
            />
          </TabPanel>
          <TabPanel
            value={2}
            sx={{ padding: 0 }}
            data-testid="ClassificationDetailTabPanelEarnings"
          >
            <DetailContainer
              sections={[
                {
                  inline: true,
                  title: {
                    label: t(`${targetTransalationEarnings}.title`),
                    fontWeight: 700,
                    fontSize: '14px',
                    textTransform: 'uppercase'
                  },
                  data: earningsData,
                  footerLink: {
                    label: t(`${targetTransalationEarnings}.link`),
                    icon: <ArrowRightAltIcon />,
                    iconPosition: 'right',
                    onLinkClick: () => {
                      if (data?.paymentsReportingId) {
                        navigate(
                          generatePath(PageRoutes.TREASURY_DETAIL, {
                            id: data.treasuryId
                          })
                        );
                      }
                    }
                  }
                }
              ]}
            />
          </TabPanel>
        </TabContext>
      )}
    </>
  );
};

export default ClassificationDetails;
