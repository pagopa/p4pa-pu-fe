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
import { getIngestionFlowFile } from '../../api/ingestionFlowFiles';
import { downloadBlob } from '../../utils/download';
import utils from '../../utils';

export const TreasuryDetail = () => {
  const { t } = useTranslation();
  const { state } = useStore();
  const navigate = useNavigate();

  const id = useLoaderData();
  const organizationId = Number(state[STATE.ORGANIZATION_ID]);

  if (!id) {
    navigate(PageRoutes.RESPONSES_ERROR);
  }

  const { data, isError, error } = getTreasuryDetail(organizationId, id);

  const mutation = getIngestionFlowFile(organizationId);

  useEffect(() => {
    if (isError && error) {
      console.error('Error loading treasury detail:', error);
      navigate(PageRoutes.RESPONSES_ERROR);
    }
  }, [isError, error, navigate]);

  // Downloads the ingestion flow file associated with this treasury record.
  const downloadIngestionFlowFile = async () => {
    if (!data?.ingestionFlowFileId) {
      utils.notify.emit(t('commons.files.downloadFailed'));
      return;
    }

    try {
      const { fileName, data: fileData } = await mutation.mutateAsync(
        data.ingestionFlowFileId
      );

      downloadBlob(fileData, fileName);
    } catch (error) {
      console.error('Error downloading treasury file:', error);
      utils.notify.emit(t('commons.files.downloadFailed'));
    }
  };

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
      value: data?.regionValueDate || '',
      valueType: 'date'
    },
    {
      label: t('treasurySearchResults.accountingDate'),
      value: data?.receptionDate || '',
      valueType: 'date'
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
      label: t('treasury.tempDocumentYear'),
      value: data?.provisionalAe || ''
    },
    {
      label: t('treasury.provisionalCode'),
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
            onActionClick: downloadIngestionFlowFile
          }
        ]}
      />
      {
        <Grid container spacing={3}>
          <Grid item md={12}>
            <DetailContainer
              sections={[
                {
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
