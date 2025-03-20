import { Download } from '@mui/icons-material';
import { CircularProgress, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router-dom';
import { getReceiptDetail } from '../../api/receiptDetail';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import DetailContainer, {
  DetailData
} from '../../components/DetailContainer/DetailContainer';

export const TelematicReceiptDetail = () => {
  const { t } = useTranslation();
  const { state } = useStore();

  const id = useLoaderData();
  const organizationId = Number(state[STATE.ORGANIZATION_ID]);

  if (isNaN(id)) {
    // TO-DO
    // raise error
    console.error('ID is not a number');
  }

  const { data, isLoading } = getReceiptDetail(organizationId, Number(id));
  const debtorType: string =
    data?.debtor.entityType === 'F' ? `(${t('commons.person')})` : '';

  const summaryData: Array<DetailData> = [
    {
      label: t('commons.iuv'),
      value: data?.iuv || ''
    },
    {
      label: t('commons.amount'),
      value: (data?.paymentAmountCents as number) || 0
    },
    {
      label: t('commons.reason'),
      value: data?.debtPositionTypeOrgDescription || ''
    },
    {
      label: t('commons.duetype'),
      value: data?.remittanceInformation || ''
    },
    {
      label: t('commons.debtor'),
      value: data?.debtor.fullName || ''
    },
    {
      label: t('commons.fiscalCodeorVat'),
      value: `${data?.debtor.fiscalCode || ''} ${debtorType}`
    }
  ];

  const paymentData: Array<DetailData> = [
    {
      label: t('commons.paymentdate'),
      value: data?.paymentDateTime
        ? new Date(data.paymentDateTime).toLocaleDateString('it-IT')
        : ''
    },
    {
      label: t('commons.auditor'),
      value: data?.pspCompanyName || ''
    },
    {
      label: t('commons.iud'),
      value: data?.iud || ''
    },
    {
      label: t('commons.iur'),
      value: data?.iur || ''
    }
  ];

  return (
    <>
      {!isLoading && (
        <>
          <TitleComponent
            title={t('telematicReceiptDetail.title')}
            callToAction={[
              {
                icon: <Download />,
                variant: 'contained',
                buttonText: t('commons.files.download'),
                onActionClick: () => console.log('download')
              }
            ]}
          />
          {
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
          }
        </>
      )}

      {isLoading && <CircularProgress></CircularProgress>}
    </>
  );
};

export default TelematicReceiptDetail;
