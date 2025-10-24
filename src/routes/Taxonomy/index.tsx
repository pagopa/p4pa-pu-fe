import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import ActionCard from '../../components/ActionCard/ActionCard';
import utils from '../../utils';
import { useNavigate } from 'react-router';
import { PageRoutes } from '..';
import { TaxonomyFilter } from '../../components/TaxonomyFilter';
import { FormProvider, useForm } from 'react-hook-form';
import SearchCard from '../../components/SearchCard/SearchCard';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { TaxonomyFields } from '../../models/Taxonomy';
import { useState } from 'react';
import {
  getScheduleLastUpdatedTime,
  synchronizeTaxonomy
} from '../../api/taxonomy';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { ScheduleEnum } from '../../../generated/data-contracts';
import { formatDateTime } from '../../utils/formatters';

export const TaxonomyPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState<boolean>(false);

  const form = useForm({
    resolver: zodResolver(
      z
        .object({
          orgType: z.string().optional(),
          macroAreaCode: z.string().optional(),
          serviceTypeCode: z.string().optional(),
          collectingReason: z.string().optional(),
          taxonomyCode: z.string().optional()
        })
        .refine(
          (data) => {
            // orgType is required for submission
            return data.orgType !== undefined && data.orgType !== '';
          },
          {
            message: 'taxonomy.orgType.required',
            path: ['orgType']
          }
        )
    ),
    mode: 'onSubmit'
  });

  const syncMutation = synchronizeTaxonomy();

  const lastUpdatedTime = getScheduleLastUpdatedTime(
    ScheduleEnum.SYNCHRONIZE_TAXONOMY_PAGOPA_FETCH
  );

  const handleUpdateCTA = async () => {
    try {
      lastUpdatedTime.refetch();
      const result = await syncMutation.mutateAsync();
      if (result) utils.notify.emit(t('taxonomyPage.APIUpdateOK'), 'info');
    } catch (error) {
      console.error(error);
      utils.notify.emit(t('taxonomyPage.APIUpdateKO'), 'error');
    }
  };

  const onSubmit = (data: Partial<TaxonomyFields>) => {
    setError(false);
    const params = utils.URI.encode(data);
    navigate(`${PageRoutes.BACKOFFICE_TAXONOMY_SEARCH_RESULTS}#${params}`);
  };

  const onError = () => {
    setError(true);
  };

  const handleReset = () => {
    form.reset();
    setError(false);
  };

  return (
    <FormProvider {...form}>
      <TitleComponent title={t('commons.routes.BACKOFFICE_TAXONOMY_INDEX')} />

      <Grid container spacing={2}>
        <Grid item xs={12} lg={6}>
          <SearchCard
            title={t('taxonomy.search')}
            render={
              <>
                <Grid mb={2}>
                  {error && <ErrorMessage testId="multifilters-error-text" />}
                </Grid>
                <TaxonomyFilter />
              </>
            }
            description={t('taxonomy.searchDescription')}
            button={[
              {
                label: t('commons.filters.remove'),
                variant: 'outlined',
                type: 'button',
                onClick: handleReset
              },
              {
                label: t('commons.filters.filterResults'),
                variant: 'contained',
                type: 'submit'
              }
            ]}
            onSubmit={form.handleSubmit(onSubmit, onError)}
          />
        </Grid>

        <Grid item xs={12} lg={6}>
          <ActionCard
            title={t('taxonomyPage.APIUpdate')}
            description={t('taxonomyPage.APIUpdateText')}
            actionLabel={t('taxonomyPage.APIUpdateCTA')}
            footerText={
              lastUpdatedTime.isSuccess && lastUpdatedTime.data?.lastUpdatedAt
                ? `${t('commons.lastUpdate')} ${formatDateTime(lastUpdatedTime.data.lastUpdatedAt)}`
                : ''
            }
            actionButtonVariant="contained"
            onActionClick={handleUpdateCTA}
          />
        </Grid>
      </Grid>
    </FormProvider>
  );
};

export default TaxonomyPage;
