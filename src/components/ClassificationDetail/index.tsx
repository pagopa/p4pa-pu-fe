import { useStore } from '../../store/GlobalStore';
import { useParams } from 'react-router';
import { getClassificationDetails } from '../../api/getClassificationsDetail';
import { Stack, Tab } from '@mui/material';
import { SyntheticEvent, useState } from 'react';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import DetailContainer, {
  DetailData
} from '../DetailContainer/DetailContainer';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import { useTranslation } from 'react-i18next';
import { formatDateTime } from '../../utils/formatters';

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
  const handleChange = (_event: SyntheticEvent, value: number) => {
    console.log(value);
    setTabIndex(value);
  };

  const debtTypeData: Array<DetailData> = [
    {
      label: t('classifications.detail.sections.telematicReceipt.debtType'),
      value: 'test'
    },
    {
      label: t(
        'classifications.detail.sections.telematicReceipt.paymentObject'
      ),
      value: data?.remittanceDescription || ''
    },
    {
      label: t('classifications.detail.sections.telematicReceipt.amount'),
      value: data?.receiptPaymentAmount || ''
    },
    {
      label: t('classifications.detail.sections.telematicReceipt.dataPayment'),
      value: formatDateTime(data?.receiptPaymentDateTime)
    },
    {
      label: t(
        'classifications.detail.sections.telematicReceipt.anagraficaAttestante'
      ),
      value: 'test'
    },
    {
      label: t('classifications.detail.sections.telematicReceipt.CFAttestante'),
      value: 'test'
    },
    {
      label: t('classifications.detail.sections.telematicReceipt.IUV'),
      value: data?.iuv || ''
    },
    {
      label: t('classifications.detail.sections.telematicReceipt.IUD'),
      value: data?.iud || ''
    },
    {
      label: t('classifications.detail.sections.telematicReceipt.IUR'),
      value: data?.iur || ''
    },
    {
      label: t(
        'classifications.detail.sections.telematicReceipt.anagraficaPagatore'
      ),
      value: data?.receiptPayer?.fullName || ''
    },
    {
      label: t('classifications.detail.sections.telematicReceipt.CFPagatore'),
      value: data?.receiptPayer?.fiscalCode || ''
    },
    {
      label: t(
        'classifications.detail.sections.telematicReceipt.anagraficaVersante'
      ),
      value: data?.receiptDebtor?.fullName || ''
    },
    {
      label: t('classifications.detail.sections.telematicReceipt.CFVersante'),
      value: data?.receiptDebtor?.fiscalCode || ''
    }
  ];

  const notifiedPayment: Array<DetailData> = [
    {
      label: t('classifications.detail.sections.telematicReceipt.debtType'),
      value: 'test'
    },
    {
      label: t('classifications.detail.sections.notifiedPayment.paymentObject'),
      value: data?.remittanceDescription || ''
    },
    {
      label: t('classifications.detail.sections.notifiedPayment.amount'),
      value: data?.receiptPaymentAmount || ''
    },
    {
      label: t(
        'classifications.detail.sections.notifiedPayment.anagraficaPagatore'
      ),
      value: formatDateTime(data?.receiptPaymentDateTime)
    },
    {
      label: t('classifications.detail.sections.notifiedPayment.CFPagatore'),
      value: 'test'
    },
    {
      label: t('classifications.detail.sections.notifiedPayment.esecutionDate'),
      value: 'test'
    },
    {
      label: t('classifications.detail.sections.telematicReceipt.otherdata'),
      value: 'test'
    },
    {
      label: t('classifications.detail.sections.telematicReceipt.IUD'),
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
      label: t(`${targetTransalationCassa}.idRendicontazione`),
      value: 'test'
    },
    {
      label: t(`${targetTransalationCassa}.data`),
      value: data?.remittanceDescription || ''
    },
    {
      label: t(`${targetTransalationCassa}.idRegolamento`),
      value: data?.receiptPaymentAmount || ''
    },
    {
      label: t(`${targetTransalationCassa}.dataRegolamento`),
      value: data?.receiptPaymentAmount || ''
    },
    {
      label: t(`${targetTransalationCassa}.importoTotale`),
      value: formatDateTime(data?.receiptPaymentDateTime)
    }
  ];

  return (
    <>
      <TabContext value={tabIndex}>
        <TabList
          onChange={handleChange}
          aria-label="classification detail tabs"
          centered
          variant="fullWidth"
        >
          <Tab
            label={t('classifications.detail.sections.telematicReceipt.title')}
            value={0}
          />
          <Tab
            label={t('classifications.detail.sections.rendicontazione.title')}
            value={1}
          />
          <Tab
            label={t('classifications.detail.sections.cassa.title')}
            value={2}
          />
        </TabList>
        <TabPanel value={0} sx={{ padding: 0 }}>
          <Stack spacing={3}>
            <DetailContainer
              sections={[
                {
                  inline: true,
                  title: {
                    label: t(
                      'classifications.detail.sections.telematicReceipt.title'
                    ),
                    uppercase: true
                  },
                  data: debtTypeData,
                  footerLink: {
                    label: t(
                      'classifications.detail.sections.telematicReceipt.link'
                    ),
                    icon: <ArrowRightAltIcon />
                  }
                }
              ]}
            />
            <DetailContainer
              sections={[
                {
                  inline: true,
                  title: {
                    label: t(
                      'classifications.detail.sections.notifiedPayment.title'
                    ),
                    uppercase: true
                  },
                  data: notifiedPayment
                }
              ]}
            />
          </Stack>
        </TabPanel>
        <TabPanel value={1} sx={{ padding: 0 }}>
          <DetailContainer
            sections={[
              {
                inline: true,
                title: {
                  label: t(
                    'classifications.detail.sections.rendicontazione.title'
                  ),
                  uppercase: true
                },
                data: rendicontazione,
                footerLink: {
                  label: t(
                    'classifications.detail.sections.rendicontazione.link'
                  ),
                  icon: <ArrowRightAltIcon />
                }
              }
            ]}
          />
        </TabPanel>
        <TabPanel value={2} sx={{ padding: 0 }}>
          <DetailContainer
            sections={[
              {
                inline: true,
                title: {
                  label: t('classifications.detail.sections.cassa.title'),
                  uppercase: true
                },
                data: cassa,
                footerLink: {
                  label: t('classifications.detail.sections.cassa.link'),
                  icon: <ArrowRightAltIcon />
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
