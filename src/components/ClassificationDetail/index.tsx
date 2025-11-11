import { useStore } from '../../store/GlobalStore';
import { generatePath, useNavigate, useParams } from 'react-router';
import { getClassificationDetail } from '../../api/getClassificationDetail';
import { Stack, Tab, useTheme } from '@mui/material';
import { SyntheticEvent, useState, useEffect, useMemo } from 'react';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import DetailContainer, {
  DetailData
} from '../DetailContainer/DetailContainer';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../TitleComponent/TitleComponent';
import { StatusBar } from '../StatusBar/StatusBar';
import { PageRoutes } from '../../routes';
import { OpenInNew } from '@mui/icons-material';

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

  const visibleTabs = useMemo(() => {
    if (!data) return [];

    const tabs = [];

    if (data.payed) {
      tabs.push({
        index: 0,
        label: t('classifications.detail.sections.telematicReceipt.title'),
        value: 'telematic-receipt',
        testId: 'classificationDetailTabDebtType'
      });
    }

    if (data.reported) {
      tabs.push({
        index: tabs.length,
        label: t('classifications.detail.sections.reporting.title'),
        value: 'reporting',
        testId: 'classificationDetailTabReporting'
      });
    }

    if (data.collected && data.flagTreasury) {
      tabs.push({
        index: tabs.length,
        label: t('classifications.detail.sections.earnings.title'),
        value: 'treasury',
        testId: 'classificationDetailTabEarnings'
      });
    }

    return tabs;
  }, [data, t]);

  const [activeTab, setActiveTab] = useState<string>('');
  const theme = useTheme();

  useEffect(() => {
    if (visibleTabs.length > 0 && !activeTab) {
      setActiveTab(visibleTabs[0].value);
    }
  }, [visibleTabs, activeTab]);

  const handleTabChange = (_event: SyntheticEvent, value: string) => {
    setActiveTab(value);
  };

  const targetTranslationDebtType =
    'classifications.detail.sections.telematicReceipt';
  const debtTypeData: Array<DetailData> = [
    {
      label: t(`${targetTranslationDebtType}.debtPositionTypeOrgCode`),
      value: data?.debtPositionTypeOrgCode
    },
    {
      label: t(`${targetTranslationDebtType}.paymentObject`),
      value: data?.remittanceInformation
    },
    {
      label: t(`${targetTranslationDebtType}.receiptPaymentAmount`),
      value: data?.receiptPaymentAmount,
      valueType: 'amount'
    },
    {
      label: t(`${targetTranslationDebtType}.receiptPaymentDateTime`),
      value: data?.receiptPaymentDateTime,
      valueType: 'dateTime'
    },
    {
      label: t(`${targetTranslationDebtType}.receiptPspCompanyName`),
      value: data?.receiptPspCompanyName
    },
    {
      label: t(`${targetTranslationDebtType}.iuv`),
      value: data?.iuv
    },
    {
      label: t(`${targetTranslationDebtType}.iud`),
      value: data?.iud
    },
    {
      label: t(`${targetTranslationDebtType}.iur`),
      value: data?.iur
    },
    {
      label: t(`${targetTranslationDebtType}.receiptPayerFullName`),
      value: data?.receiptDebtor?.fullName
    },
    {
      label: t(`${targetTranslationDebtType}.receiptPayerFiscalCode`),
      value: data?.receiptDebtor?.fiscalCode
    }
  ];

  const targetTranslationNotifiedPayment =
    'classifications.detail.sections.notifiedPayment';
  const notifiedPaymentData: Array<DetailData> = [
    {
      label: t(`${targetTranslationNotifiedPayment}.debtType`),
      value: data?.paymentNotificationDebtPositionTypeOrgCode
    },
    {
      label: t(`${targetTranslationNotifiedPayment}.paymentObject`),
      value: data?.paymentNotificationRemittanceInformation
    },
    {
      label: t(`${targetTranslationNotifiedPayment}.amount`),
      value: data?.paymentNotificationAmountPaidCents,
      valueType: 'amount'
    },
    {
      label: t(`${targetTranslationNotifiedPayment}.receiptPayerFullName`),
      value: data?.paymentNotificationDebtor?.fullName
    },
    {
      label: t(`${targetTranslationNotifiedPayment}.receiptPayerFiscalCode`),
      value: data?.paymentNotificationDebtor?.fiscalCode
    },
    {
      label: t(`${targetTranslationNotifiedPayment}.esecutionDate`),
      value: data?.paymentExecutionDate,
      valueType: 'date'
    },
    {
      label: t(`${targetTranslationNotifiedPayment}.iud`),
      value: data?.paymentNotificationIud
    }
  ];

  const targetTranslationReporting =
    'classifications.detail.sections.reporting';
  const reportingData: Array<DetailData> = [
    {
      label: t(`${targetTranslationReporting}.idReporting`),
      value: data?.iuf
    },
    {
      label: t(`${targetTranslationReporting}.flowDateTime`),
      value: data?.flowDateTime,
      valueType: 'dateTime'
    },
    {
      label: t(`${targetTranslationReporting}.regulationUniqueIdentifier`),
      value: data?.regulationUniqueIdentifier
    },
    {
      label: t(`${targetTranslationReporting}.regionValueDate`),
      value: data?.regionValueDate,
      valueType: 'date'
    },
    {
      label: t(`${targetTranslationReporting}.totalPayments`),
      value: data?.totalAmountCents,
      valueType: 'amount'
    }
  ];

  const targetTranslationEarnings = 'classifications.detail.sections.earnings';
  const earningsData: Array<DetailData> = [
    {
      label: t(`${targetTranslationEarnings}.accountCode`),
      value: data?.sealCode
    },
    {
      label: t(`${targetTranslationEarnings}.pspLastName`),
      value: data?.pspLastName
    },
    {
      label: t(`${targetTranslationEarnings}.documentCode`),
      value: data?.documentCode
    },
    {
      label: t(`${targetTranslationEarnings}.billDate`),
      value: data?.billDate,
      valueType: 'date'
    },
    {
      label: t(`${targetTranslationEarnings}.billYear`),
      value: data?.billYear
    },
    {
      label: t(`${targetTranslationEarnings}.provisionalAe`),
      value: data?.provisionalAe
    },
    {
      label: t(`${targetTranslationEarnings}.receptionDate`),
      value: data?.receptionDate,
      valueType: 'dateTime'
    },
    {
      label: t(`${targetTranslationEarnings}.billCode`),
      value: data?.billCode
    },
    {
      label: t(`${targetTranslationEarnings}.provisionalCode`),
      value: data?.provisionalCode
    }
  ];

  if (!data || visibleTabs.length === 0 || !activeTab) {
    return (
      <>
        <TitleComponent title={t('classifications.title')} />
        {data && <StatusBar classificationData={data} />}
      </>
    );
  }

  return (
    <>
      <TitleComponent
        title={t('classifications.title')}
        accessibleTitle={t('classifications.accessibleTitle')}
      />

      <StatusBar classificationData={data} />

      <TabContext value={activeTab} data-testid="ClassificationDetailTabs">
        {visibleTabs.length > 1 && (
          <TabList
            onChange={handleTabChange}
            aria-label="classification detail tabs"
            centered
            variant="fullWidth"
            sx={{ backgroundColor: theme.palette.background.paper }}
          >
            {visibleTabs.map((tab) => (
              <Tab
                key={tab.value}
                label={tab.label}
                value={tab.value}
                data-testid={tab.testId}
              />
            ))}
          </TabList>
        )}

        {data.payed && (
          <TabPanel
            value="telematic-receipt"
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
                      label: t(`${targetTranslationDebtType}.title`)
                    },
                    data: debtTypeData,
                    footerLink: {
                      label: t(`${targetTranslationDebtType}.link`),
                      icon: <OpenInNew />,
                      iconPosition: 'right',
                      onLinkClick: () => {
                        if (data?.receiptPaymentReceiptId) {
                          navigate(
                            generatePath(PageRoutes.TELEMATIC_RECEIPT_DETAIL, {
                              receiptId: data?.receiptPaymentRequestId
                            })
                          );
                        }
                      }
                    }
                  }
                ]}
              />
              {data.flagPaymentNotification && (
                <DetailContainer
                  sections={[
                    {
                      inline: true,
                      title: {
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        fontSize: '14px',
                        label: t(`${targetTranslationNotifiedPayment}.title`)
                      },
                      data: notifiedPaymentData
                    }
                  ]}
                />
              )}
            </Stack>
          </TabPanel>
        )}

        {data.reported && (
          <TabPanel
            value="reporting"
            sx={{ padding: 0 }}
            data-testid="ClassificationDetailTabPanelReporting"
          >
            <DetailContainer
              sections={[
                {
                  inline: true,
                  title: {
                    label: t(`${targetTranslationReporting}.title`),
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    fontSize: '14px'
                  },
                  data: reportingData,
                  footerLink: {
                    label: t(`${targetTranslationReporting}.link`),
                    icon: <OpenInNew />,
                    iconPosition: 'right',
                    onLinkClick: () => {
                      if (data?.iuf) {
                        navigate(
                          generatePath(PageRoutes.REPORTING_DETAIL, {
                            id: data.iuf
                          })
                        );
                      }
                    }
                  }
                }
              ]}
            />
          </TabPanel>
        )}
        {data.flagTreasury && (
          <TabPanel
            value="treasury"
            sx={{ padding: 0 }}
            data-testid="ClassificationDetailTabPanelEarnings"
          >
            <DetailContainer
              sections={[
                {
                  inline: true,
                  title: {
                    label: t(`${targetTranslationEarnings}.title`),
                    fontWeight: 700,
                    fontSize: '14px',
                    textTransform: 'uppercase'
                  },
                  data: earningsData,
                  footerLink: {
                    label: t(`${targetTranslationEarnings}.link`),
                    icon: <OpenInNew />,
                    iconPosition: 'right',
                    onLinkClick: () => {
                      if (data?.treasuryId) {
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
        )}
      </TabContext>
    </>
  );
};

export default ClassificationDetails;
