import SearchCard from '../SearchCard/SearchCard';
import ActionCard from '../ActionCard/ActionCard';
import DownloadIcon from '@mui/icons-material/Download';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../TitleComponent/TitleComponent';
import { useMultiFilters } from '../../hooks/useMultiFilters';
import { PageRoutes } from '../../routes';
import { useNavigate } from 'react-router-dom';

export const Classifications = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
                  onClick: () => console.log('searchClick')
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
              onLinkClick={() =>
                navigate(PageRoutes.CLASSIFICATIONS_EXPORT_OVERVIEW)
              }
              onActionClick={() => navigate(PageRoutes.EXPORT_CLASSIFICATIONS)}
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default Classifications;
