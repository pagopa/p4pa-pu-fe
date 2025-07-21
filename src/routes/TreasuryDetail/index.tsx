import { Download } from '@mui/icons-material';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useNavigate } from 'react-router';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import DetailContainer, {
  DetailData
} from '../../components/DetailContainer/DetailContainer';
import { getTreasuryDetail } from '../../api/treasuryDetail';
import { useEffect } from 'react';
import { PageRoutes } from '../../routes';

export const TreasuryDetail = () => {
  const { t } = useTranslation();
  const { state } = useStore();
  const navigate = useNavigate();

  const id = useLoaderData();
  const organizationId = Number(state[STATE.ORGANIZATION_ID]);

  if (!id) {
    navigate(PageRoutes.RESPONSES_ERROR);
    return null;
  }

  const { data, isError, error } = getTreasuryDetail(organizationId, id);

  useEffect(() => {
    if (isError && error) {
      console.error('Error loading treasury detail:', error);
      navigate(PageRoutes.RESPONSES_ERROR);
    }
  }, [isError, error, navigate]);

  const summaryData: Array<DetailData> = [
    {
      label: t('treasurySearchResults.billingCode'),
      value: data?.billCode || ''
    },
    {
      label: t('treasurySearchResults.billingYear'),
      value: data?.billYear || ''
    },
    {
      label: t('treasurySearchResults.reportingId'),
      value: data?.iuf || ''
    },
    {
      label: t('commons.amount'),
      valueType: 'amount',
      value: data?.billAmountCents || ''
    },
    {
      label: t('treasury.payer'),
      value: data?.pspLastName || ''
    },
    {
      label: t('treasurySearchResults.valueDate'),
      value: data?.regionValueDate || ''
    },
    {
      label: t('treasurySearchResults.accountingDate'),
      value: data?.receptionDate || ''
    },
    {
      label: t('treasury.account'),
      value: data?.accountCode || ''
    },
    {
      label: t('treasury.billingYear'),
      value: data?.documentYear || ''
    },
    {
      label: t('treasury.documentCode'),
      value: data?.documentCode || ''
    },
    {
      label: t('treasury.account'),
      value: data?.accountCode || ''
    },
    {
      label: t('treasury.tempDocumentYear'),
      value: data?.provisionalAe || ''
    },
    {
      label: t('treasury.documentCode'),
      value: data?.provisionalCode || ''
    },
    {
      label: t('commons.reason'),
      value: data?.remittanceDescription || ''
    }
  ];

  return (
    <>
      <TitleComponent
        title={t('treasury.billDetail')}
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
          <Grid item md={12}>
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
        </Grid>
      }
    </>
  );
};

export default TreasuryDetail;
