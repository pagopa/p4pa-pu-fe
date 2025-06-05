import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import ActionCard from '../../components/ActionCard/ActionCard';
import utils from '../../utils';
import { synchronizeTaxonomy } from '../../api/taxonomy';

export const TaxonomyPage = () => {
  const { t } = useTranslation();

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

  return (
    <>
      <TitleComponent title={t('commons.routes.BACKOFFICE_TAXONOMY_INDEX')} />
      <Grid container direction="row">
        <Grid container spacing={2}>
          <Grid item xs={12} md={7}>
            TASSONOMIA TO-DO
          </Grid>

          <Grid item xs={12} md={5}>
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
      </Grid>
    </>
  );
};

export default TaxonomyPage;
