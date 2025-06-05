import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import ActionCard from '../../components/ActionCard/ActionCard';
import utils from '../../utils';
import { synchronizeTaxonomy } from '../../api/taxonomy';
import { useNavigate } from 'react-router';
import { PageRoutes } from '..';
import { TaxonomyFilter } from '../../components/TaxonomyFilter';
import { FormProvider, useForm } from 'react-hook-form';
import SearchCard from '../../components/SearchCard/SearchCard';
import { taxonomySchema } from '../../components/TaxonomyFilter/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { TaxonomyFields } from '../../models/Taxonomy';

export const TaxonomyPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(taxonomySchema),
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

  const onSubmit = async (values: TaxonomyFields) => {
    //TODO navigate to results page with filters
    console.debug(values);
    navigate(PageRoutes.BACKOFFICE_TAXONOMY_SEARCH_RESULTS);
  };

  return (
    <FormProvider {...form}>
      <form>
        <TitleComponent title={t('commons.routes.BACKOFFICE_TAXONOMY_INDEX')} />

        <Grid container spacing={2}>
          <Grid item xs={12} lg={6}>
            <SearchCard
              title={t('Cerca tassonomia')}
              render={<TaxonomyFilter />}
              description={t(
                'Inserisci al meno un filtro per avviare la ricerca.'
              )}
              button={[
                {
                  label: t('commons.filters.remove'),
                  variant: 'outlined'
                },
                {
                  label: t('commons.filters.filterResults'),
                  onClick: form.handleSubmit(onSubmit),
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
