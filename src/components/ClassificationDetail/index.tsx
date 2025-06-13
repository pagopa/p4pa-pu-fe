import { useStore } from '../../store/GlobalStore';
import { useParams } from 'react-router';
import { getClassificationDetails } from '../../api/getClassificationsDetail';
import { Stack, Tab, useTheme } from '@mui/material';
import { SyntheticEvent, useState } from 'react';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import DetailContainer, {
  DetailData
} from '../DetailContainer/DetailContainer';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import { useTranslation } from 'react-i18next';
import { formatDateTime } from '../../utils/formatters';
import TitleComponent from '../TitleComponent/TitleComponent';

export const ClassificationDetails = () => {
  const store = useStore();
  const { t } = useTranslation();
  const organizationId = store.state.organizationId;
  const { classificationId } = useParams();
  const { data } = getClassificationDetails(
    organizationId,
    Number(classificationId)
  );
  const [tabIndex, setTabIndex] = useState(0);
  const theme = useTheme();
  const handleChange = (_event: SyntheticEvent, value: number) => {
    setTabIndex(value);
  };

  const targetTransalationDebtTypeData =
    'classifications.detail.sections.telematicReceipt';
  const debtTypeData: Array<DetailData> = [
    {
      label: t(`${targetTransalationDebtTypeData}.debtType`),
      value: 'test'
    },
    {
      label: t(`${targetTransalationDebtTypeData}.paymentObject`),
      value: data?.remittanceDescription || ''
    },
    {
      label: t(`${targetTransalationDebtTypeData}.amount`),
      value: data?.receiptPaymentAmount || ''
    },
    {
      label: t(`${targetTransalationDebtTypeData}.dataPayment`),
      value: formatDateTime(data?.receiptPaymentDateTime)
    },
    {
      label: t(`${targetTransalationDebtTypeData}.anagraficaAttestante`),
      value: 'test'
    },
    {
      label: t(`${targetTransalationDebtTypeData}.CFAttestante`),
      value: 'test'
    },
    {
      label: t(`${targetTransalationDebtTypeData}.IUV`),
      value: data?.iuv || ''
    },
    {
      label: t(`${targetTransalationDebtTypeData}.IUD`),
      value: data?.iud || ''
    },
    {
      label: t(`${targetTransalationDebtTypeData}.IUR`),
      value: data?.iur || ''
    },
    {
      label: t(`${targetTransalationDebtTypeData}.anagraficaPagatore`),
      value: data?.receiptPayer?.fullName || ''
    },
    {
      label: t(`${targetTransalationDebtTypeData}.CFPagatore`),
      value: data?.receiptPayer?.fiscalCode || ''
    },
    {
      label: t(`${targetTransalationDebtTypeData}.anagraficaVersante`),
      value: data?.receiptDebtor?.fullName || ''
    },
    {
      label: t(`${targetTransalationDebtTypeData}.CFVersante`),
      value: data?.receiptDebtor?.fiscalCode || ''
    }
  ];

  const targetTransalationNotifiedPayment =
    'classifications.detail.sections.notifiedPayment';
  const notifiedPayment: Array<DetailData> = [
    {
      label: t(`${targetTransalationNotifiedPayment}.debtType`),
      value: 'test'
    },
    {
      label: t(`classifications.detail.sections.notifiedPayment.paymentObject`),
      value: data?.remittanceDescription || ''
    },
    {
      label: t(`classifications.detail.sections.notifiedPayment.amount`),
      value: data?.receiptPaymentAmount || ''
    },
    {
      label: t(`${targetTransalationNotifiedPayment}.anagraficaPagatore`),
      value: formatDateTime(data?.receiptPaymentDateTime)
    },
    {
      label: t(`${targetTransalationNotifiedPayment}.CFPagatore`),
      value: 'test'
    },
    {
      label: t(`${targetTransalationNotifiedPayment}.esecutionDate`),
      value: 'test'
    },
    {
      label: t(`${targetTransalationNotifiedPayment}.otherdata`),
      value: 'test'
    },
    {
      label: t(`${targetTransalationNotifiedPayment}.IUD`),
      value: data?.iud || ''
    }
  ];

  const targetTransalationRendicontazione =
    'classifications.detail.sections.rendicontazione';
  const rendicontazione: Array<DetailData> = [
    {
      label: t(`${targetTransalationRendicontazione}.idRendicontazione`),
      value: 'test'
    },
    {
      label: t(`${targetTransalationRendicontazione}.data`),
      value: data?.remittanceDescription || ''
    },
    {
      label: t(`${targetTransalationRendicontazione}.idRegolamento`),
      value: data?.receiptPaymentAmount || ''
    },
    {
      label: t(`${targetTransalationRendicontazione}.dataRegolamento`),
      value: data?.receiptPaymentAmount || ''
    },
    {
      label: t(`${targetTransalationRendicontazione}.importoTotale`),
      value: formatDateTime(data?.receiptPaymentDateTime)
    }
  ];

  const targetTransalationCassa = 'classifications.detail.sections.cassa';
  const cassa: Array<DetailData> = [
    {
      label: t(`${targetTransalationCassa}.conto`),
      value: 'test'
    },
    {
      label: t(`${targetTransalationCassa}.ordinante`),
      value: data?.remittanceDescription || ''
    },
    {
      label: t(`${targetTransalationCassa}.codiceDocumento`),
      value: data?.receiptPaymentAmount || ''
    },
    {
      label: t(`${targetTransalationCassa}.dataValuta`),
      value: data?.receiptPaymentAmount || ''
    },
    {
      label: t(`${targetTransalationCassa}.annoBolletta`),
      value: formatDateTime(data?.receiptPaymentDateTime)
    },
    {
      label: t(`${targetTransalationCassa}.annoProvvisorio`),
      value: data?.receiptPaymentAmount || ''
    },
    {
      label: t(`${targetTransalationCassa}.dataContabile`),
      value: data?.receiptPaymentAmount || ''
    },
    {
      label: t(`${targetTransalationCassa}.codiceBolletta`),
      value: formatDateTime(data?.receiptPaymentDateTime)
    }
  ];

  return (
    <>
      <TitleComponent title={t('commons.routes.CLASSIFICATIONS')} />
      <TabContext value={tabIndex} data-test-id="ClassificationDetailTabs">
        <TabList
          onChange={handleChange}
          aria-label="classification detail tabs"
          centered
          variant="fullWidth"
          sx={{ backgroundColor: theme.palette.background.paper }}
        >
          <Tab label={t(`${targetTransalationDebtTypeData}.title`)} value={0} />
          <Tab
            label={t(`${targetTransalationRendicontazione}.title`)}
            value={1}
          />
          <Tab label={t(`${targetTransalationCassa}.title`)} value={2} />
        </TabList>
        <TabPanel
          value={0}
          sx={{ padding: 0 }}
          data-test-id="ClassificationDetailTabNotifiedPayment"
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
                    label: t(`${targetTransalationDebtTypeData}.title`)
                  },
                  data: debtTypeData,
                  footerLink: {
                    label: t(`${targetTransalationDebtTypeData}.link`),
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
                  data: notifiedPayment
                }
              ]}
            />
          </Stack>
        </TabPanel>
        <TabPanel
          value={1}
          sx={{ padding: 0 }}
          data-test-id="ClassificationDetailTabNotifiedRendicontazione"
        >
          <DetailContainer
            sections={[
              {
                inline: true,
                title: {
                  label: t(`${targetTransalationRendicontazione}.title`),
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  fontSize: '14px'
                },
                data: rendicontazione,
                footerLink: {
                  label: t(`${targetTransalationRendicontazione}.link`),
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
          data-test-id="ClassificationDetailTabCassa"
        >
          <DetailContainer
            sections={[
              {
                inline: true,
                title: {
                  label: t(`${targetTransalationCassa}.title`),
                  fontWeight: 700,
                  fontSize: '14px',
                  textTransform: 'uppercase'
                },
                data: cassa,
                footerLink: {
                  label: t(`${targetTransalationCassa}.link`),
                  icon: <ArrowRightAltIcon />,
                  iconPosition: 'right'
                }
              }
            ]}
          />
        </TabPanel>
      </TabContext>
    </>
  );
};

export default ClassificationDetails;
