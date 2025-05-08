import SearchCard from '../SearchCard/SearchCard';
import ActionCard from '../ActionCard/ActionCard';
import DownloadIcon from '@mui/icons-material/Download';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../TitleComponent/TitleComponent';
import { useMultiFilters } from '../../hooks/useMultiFilters';

export const Classifications = () => {
  const { t } = useTranslation();
  const { filterMap, removeAllFilters } = useMultiFilters({
    clearOnMount: true
  });

  return (
    <>
      <TitleComponent
        title={t('commons.routes.CLASSIFICATIONS')}
        description={t('classifications.description')}
      />
      <Grid container direction="row">
        <Grid container spacing={2}>
          <Grid item xs={12} lg={6}>
            <SearchCard
              title={t('classifications.search')}
              description={t('classifications.searchdescription')}
              multiFilterConfig={filterMap}
              button={[
                {
                  label: t('commons.filters.remove'),
                  variant: 'outlined',
                  onClick: removeAllFilters
                },
                {
                  label: t('commons.filters.filterResults'),
                  variant: 'contained',
                  onClick: () => console.log('go to results')
                }
              ]}
            />
          </Grid>

          <Grid item xs={12} lg={6}>
            <ActionCard
              title={t('classifications.exportTitle')}
              description={t('classifications.exportDescription')}
              actionLabel={t('exportFlow.buttonReservationExport')}
              actionIcon={<DownloadIcon />}
              linkLabel={t('classifications.showAllResults')}
              onLinkClick={() => console.log('onLinkClick')}
              onActionClick={() => console.log('onActionClick')}
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default Classifications;
