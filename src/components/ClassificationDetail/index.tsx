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
      value: data?.debtPositionTypeOrgCode
    },
    {
      label: t(`${targetTransalationDebtTypeData}.paymentObject`),
      value: 'toBeDefined'
    },
    {
      label: t(`${targetTransalationDebtTypeData}.amount`),
      value: 'toBeDefined'
    },
    {
      label: t(`${targetTransalationDebtTypeData}.dataPayment`),
      value: data?.receiptPaymentDateTime,
      valueType: 'dateTime'
    },
    {
      label: t(`${targetTransalationDebtTypeData}.anagraficaAttestante`),
      value: data?.receiptDebtor?.fullName
    },
    {
      label: t(`${targetTransalationDebtTypeData}.CFAttestante`),
      value: data?.receiptDebtor?.fiscalCode
    },
    {
      label: t(`${targetTransalationDebtTypeData}.IUV`),
      value: data?.iuv
    },
    {
      label: t(`${targetTransalationDebtTypeData}.IUD`),
      value: data?.iud
    },
    {
      label: t(`${targetTransalationDebtTypeData}.IUR`),
      value: data?.iur
    },
    {
      label: t(`${targetTransalationDebtTypeData}.anagraficaPagatore`),
      value: data?.receiptPayer?.fullName
    },
    {
      label: t(`${targetTransalationDebtTypeData}.CFPagatore`),
      value: data?.receiptPayer?.fiscalCode
    },
    {
      label: t(`${targetTransalationDebtTypeData}.anagraficaVersante`),
      value: data?.receiptDebtor?.fullName
    },
    {
      label: t(`${targetTransalationDebtTypeData}.CFVersante`),
      value: data?.receiptDebtor?.fiscalCode
    }
  ];

  const targetTransalationNotifiedPayment =
    'classifications.detail.sections.notifiedPayment';
  const notifiedPayment: Array<DetailData> = [
    {
      label: t(`${targetTransalationNotifiedPayment}.debtType`),
      value: 'toBeDefined'
    },
    {
      label: t(`classifications.detail.sections.notifiedPayment.paymentObject`),
      value: 'toBeDefined'
    },
    {
      label: t(`classifications.detail.sections.notifiedPayment.amount`),
      value: 'toBeDefined'
    },
    {
      label: t(`${targetTransalationNotifiedPayment}.anagraficaPagatore`),
      value: 'toBeDefined'
    },
    {
      label: t(`${targetTransalationNotifiedPayment}.CFPagatore`),
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
      label: t(`${targetTransalationNotifiedPayment}.IUD`),
      value: 'toBeDefined'
    }
  ];

  const targetTransalationRendicontazione =
    'classifications.detail.sections.rendicontazione';
  const rendicontazione: Array<DetailData> = [
    {
      label: t(`${targetTransalationRendicontazione}.idRendicontazione`),
      value: data?.iuf
    },
    {
      label: t(`${targetTransalationRendicontazione}.data`),
      value: data?.flowDateTime,
      valueType: 'dateTime'
    },
    {
      label: t(`${targetTransalationRendicontazione}.idRegolamento`),
      value: data?.regulationUniqueIdentifier
    },
    {
      label: t(`${targetTransalationRendicontazione}.dataRegolamento`),
      value: data?.regionValueDate,
      valueType: 'dateTime'
    },
    {
      label: t(`${targetTransalationRendicontazione}.importoTotale`),
      value: data?.totalPayments,
      valueType: 'amount'
    }
  ];

  const targetTransalationCassa = 'classifications.detail.sections.cassa';
  const cassa: Array<DetailData> = [
    {
      label: t(`${targetTransalationCassa}.conto`),
      value: 'toBeDefined'
    },
    {
      label: t(`${targetTransalationCassa}.ordinante`),
      value: 'toBeDefined'
    },
    {
      label: t(`${targetTransalationCassa}.codiceDocumento`),
      value: data?.documentCode
    },
    {
      label: t(`${targetTransalationCassa}.dataValuta`),
      value: data?.billDate,
      valueType: 'date'
    },
    {
      label: t(`${targetTransalationCassa}.annoBolletta`),
      value: data?.billYear,
      valueType: 'date'
    },
    {
      label: t(`${targetTransalationCassa}.annoProvvisorio`),
      value: 'toBeDefined'
    },
    {
      label: t(`${targetTransalationCassa}.dataContabile`),
      value: data?.receptionDate,
      valueType: 'date'
    },
    {
      label: t(`${targetTransalationCassa}.codiceBolletta`),
      value: data?.billCode
    },
    {
      label: t(`${targetTransalationCassa}.codiceProvvisorio`),
      value: 'toBeDefined'
    }
  ];

  return (
    <>
      <TitleComponent title={t('commons.routes.CLASSIFICATIONS')} />
      <TabContext value={tabIndex} data-testid="ClassificationDetailTabs">
        <TabList
          onChange={handleChange}
          aria-label="classification detail tabs"
          centered
          variant="fullWidth"
          sx={{ backgroundColor: theme.palette.background.paper }}
        >
          <Tab
            label={t(`${targetTransalationDebtTypeData}.title`)}
            value={0}
            data-testid="classificationDetailTabDebtType"
          />
          <Tab
            label={t(`${targetTransalationRendicontazione}.title`)}
            value={1}
            data-testid="classificationDetailTabRendicontazione"
          />
          <Tab
            label={t(`${targetTransalationCassa}.title`)}
            value={2}
            data-testid="classificationDetailTabCassa"
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
          data-testid="ClassificationDetailTabPanelRendicontazione"
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
          data-testid="ClassificationDetailTabPanelCassa"
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
