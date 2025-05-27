import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import ActionCard from '../../components/ActionCard/ActionCard';
import utils from '../../utils';

export const TaxonomyPage = () => {
  const { t } = useTranslation();

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
              onActionClick={() =>
                utils.notify.emit(t('taxonomyPage.APIUpdateOK'), 'info')
              }
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default TaxonomyPage;
