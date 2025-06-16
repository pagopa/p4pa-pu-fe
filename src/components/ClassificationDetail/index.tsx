import { useStore } from '../../store/GlobalStore';
import { useParams } from 'react-router';
import { getClassificationDetail } from '../../api/getClassificationDetail';
import { Stack, Tab, useTheme } from '@mui/material';
import { SyntheticEvent, useState } from 'react';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import DetailContainer, {
  DetailData
} from '../DetailContainer/DetailContainer';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import { useTranslation } from 'react-i18next';

import TitleComponent from '../TitleComponent/TitleComponent';

export const ClassificationDetails = () => {
  const store = useStore();
  const { t } = useTranslation();
  const organizationId = store.state.organizationId;
  const { classificationId } = useParams();
  const { data } = getClassificationDetail(
    organizationId,
    Number(classificationId)
  );
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
      value: 'toBeDefined'
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
      value: 'toBeDefined'
    },
    {
      label: t(`${targetTransalationNotifiedPayment}.paymentObject`),
      value: 'toBeDefined'
    },
    {
      label: t(`${targetTransalationNotifiedPayment}.amount`),
      value: 'toBeDefined'
    },
    {
      label: t(`${targetTransalationNotifiedPayment}.receiptPayerFullName`),
      value: 'toBeDefined'
    },
    {
      label: t(`${targetTransalationNotifiedPayment}.receiptPayerFiscalCode`),
      value: 'toBeDefined'
    },
    {
      label: t(`${targetTransalationNotifiedPayment}.esecutionDate`),
      valueType: 'date'
    },
    {
      label: t(`${targetTransalationNotifiedPayment}.otherdata`),
      value: 'toBeDefined'
    },
    {
      label: t(`${targetTransalationNotifiedPayment}.iud`),
      value: 'toBeDefined'
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
      value: 'toBeDefined'
    },
    {
      label: t(`${targetTransalationEarnings}.pspFirstName`),
      value: 'toBeDefined'
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
      value: 'toBeDefined'
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
      value: 'toBeDefined'
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
                      iconPosition: 'right'
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
                    iconPosition: 'right'
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
                    iconPosition: 'right'
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
