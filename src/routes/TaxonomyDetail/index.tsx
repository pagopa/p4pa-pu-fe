import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import DetailContainer, {
  DetailData
} from '../../components/DetailContainer/DetailContainer';
import { useMemo, useEffect } from 'react';
import { formatDate } from '../../utils/formatters';
import { PageRoutes } from '../../routes';
import { getTaxonomyDetail } from '../../api/taxonomy';

export const TaxonomyDetailPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { taxonomyId } = useParams<{ taxonomyId: string }>();

  const { data, isError } = getTaxonomyDetail(Number(taxonomyId));

  useEffect(() => {
    if (isNaN(Number(taxonomyId)) || isError) {
      navigate(PageRoutes.RESPONSES_ERROR);
    }
  }, [taxonomyId, isError, navigate]);

  const taxonomyInfo: Array<DetailData> = useMemo(() => {
    if (!data) return [];

    return [
      {
        label: t('taxonomyPage.fields.organizationType'),
        value: data.organizationType
      },
      {
        label: t('taxonomyPage.fields.organizationTypeDescription'),
        value: data.organizationTypeDescription
      },
      {
        label: t('taxonomyPage.fields.macroAreaCode'),
        value: data.macroAreaCode
      },
      {
        label: t('taxonomyPage.fields.macroAreaName'),
        value: data.macroAreaName
      },
      {
        label: t('taxonomyPage.fields.serviceTypeCode'),
        value: data.serviceTypeCode
      },
      {
        label: t('taxonomyPage.fields.serviceType'),
        value: data.serviceType
      },
      {
        label: t('taxonomyPage.fields.serviceTypeDescription'),
        value: data.serviceTypeDescription
      },
      {
        label: t('taxonomyPage.fields.collectionReason'),
        value: data.collectionReason
      }
    ];
  }, [data, t]);

  const dateInfo: Array<DetailData> = useMemo(() => {
    if (!data) return [];

    return [
      {
        label: t('taxonomyPage.fields.startDateValidity'),
        value: formatDate(data.startDateValidity)
      },
      {
        label: t('taxonomyPage.fields.endDateOfValidity'),
        value: formatDate(data.endDateOfValidity)
      }
    ];
  }, [data, t]);

  return (
    <>
      {data && (
        <>
          <TitleComponent
            title={data.taxonomyCode}
            accessibleTitle={t('taxonomyPage.accessibleTitle', {
              taxonomyCode: data.taxonomyCode,
              interpolation: { escapeValue: false }
            })}
          />
          <Grid container spacing={3} my={2}>
            <Grid item md={6}>
              <DetailContainer
                sections={[
                  {
                    title: {
                      label: t('taxonomyPage.taxonomyInfo'),
                      variant: 'overline'
                    },
                    data: taxonomyInfo,
                    inline: true
                  }
                ]}
              />
            </Grid>
            <Grid item md={6}>
              <DetailContainer
                sections={[
                  {
                    title: {
                      label: t('taxonomyPage.dateInfo'),
                      variant: 'overline'
                    },
                    data: dateInfo
                  }
                ]}
              />
            </Grid>
          </Grid>
        </>
      )}
    </>
  );
};

export default TaxonomyDetailPage;
