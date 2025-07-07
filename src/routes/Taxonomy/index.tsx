import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import ActionCard from '../../components/ActionCard/ActionCard';
import utils from '../../utils';
import { useNavigate } from 'react-router';
import { PageRoutes } from '..';
import { TaxonomyFilter } from '../../components/TaxonomyFilter';
import { FormProvider, useForm } from 'react-hook-form';
import SearchCard, {
  ErrorMessage
} from '../../components/SearchCard/SearchCard';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { TaxonomyFields } from '../../models/Taxonomy';
import { useState } from 'react';
import { noFilterSetted } from '../../utils/filtersValidation';
import { synchronizeTaxonomy } from '../../api/taxonomy';

export const TaxonomyPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState<boolean>(false);

  const form = useForm({
    resolver: zodResolver(
      z.object({
        orgType: z.string({
          required_error: 'taxonomy.orgType.required'
        }),
        macroAreaCode: z.string().optional(),
        serviceTypeCode: z.string().optional(),
        collectingReason: z.string().optional(),
        taxonomyCode: z.string().optional()
      })
    ),
    mode: 'onTouched'
  });

  const syncMutation = synchronizeTaxonomy();

  const handleUpdateCTA = async () => {
    try {
      const result = await syncMutation.mutateAsync();
      if (result) utils.notify.emit(t('taxonomyPage.APIUpdateOK'), 'info');
    } catch (error) {
      console.error(error);
      utils.notify.emit(t('taxonomyPage.APIUpdateKO'), 'error');
    }
  };

  const handleSearch = () => {
    const currentValues = form.getValues();
    const optionalFilters = {
      macroAreaCode: currentValues.macroAreaCode,
      serviceTypeCode: currentValues.serviceTypeCode,
      collectingReason: currentValues.collectingReason,
      taxonomyCode: currentValues.taxonomyCode
    };

    if (noFilterSetted(optionalFilters)) {
      setError(true);
    } else {
      setError(false);
    }

    form.handleSubmit(onSubmit)();
  };

  const onSubmit = async (filters: Partial<TaxonomyFields>) => {
    if (error) {
      return;
    }

    navigate(PageRoutes.BACKOFFICE_TAXONOMY_SEARCH_RESULTS, {
      state: { filters }
    });
  };

  const handleReset = () => {
    form.reset();
    setError(false);
  };

  return (
    <FormProvider {...form}>
      <form>
        <TitleComponent title={t('commons.routes.BACKOFFICE_TAXONOMY_INDEX')} />

        <Grid container spacing={2}>
          <Grid item xs={12} lg={6}>
            <SearchCard
              title={t('Cerca tassonomia')}
              render={
                <>
                  <Grid mb={2}>{error && ErrorMessage}</Grid>
                  <TaxonomyFilter />
                </>
              }
              description={t(
                'Inserisci al meno un filtro per avviare la ricerca.'
              )}
              button={[
                {
                  label: t('commons.filters.remove'),
                  variant: 'outlined',
                  onClick: handleReset
                },
                {
                  label: t('commons.filters.filterResults'),
                  onClick: handleSearch,
                  variant: 'contained'
                }
              ]}
            />
          </Grid>

          <Grid item xs={12} lg={6}>
            <ActionCard
              title={t('taxonomyPage.APIUpdate')}
              description={t('taxonomyPage.APIUpdateText')}
              actionLabel={t('taxonomyPage.APIUpdateCTA')}
              footerText={t('commons.lastUpdate')}
              actionButtonVariant="contained"
              onActionClick={handleUpdateCTA}
            />
          </Grid>
        </Grid>
      </form>
    </FormProvider>
  );
};

export default TaxonomyPage;
