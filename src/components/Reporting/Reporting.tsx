import SearchCard from '../SearchCard/SearchCard';
import ActionCard from '../ActionCard/ActionCard';
import { CalendarToday, FileUpload, Search } from '@mui/icons-material';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { PageRoutes } from '../../routes/routes';

export const Reporting = () => {

  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <Grid container direction="row">
        <Grid container direction="column">
          <Grid item mb={2}>
            <Typography variant="h3" >
              {t('reporting.title')}
            </Typography>
          </Grid>
          <Grid item mb={3}>
            <Typography variant="body1">
              {t('reporting.description')}
            </Typography>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <SearchCard
              title={t('reporting.searchTitleContainer')}
              description={t('reporting.searchDescriptionContainer')}
              searchFields={[
                { label: t('reporting.searchReportingId'), icon: <Search /> },
                { label: t('reporting.searchRegulationId'), icon: <Search /> },
                { label: t('reporting.regulationFrom'), icon: <CalendarToday />, gridWidth: 6},
                { label: t('reporting.regulationTo'), icon: <CalendarToday />, gridWidth: 6 },
              ]}
              button={[
                { text: t('reporting.removeFilter'), variant: 'outlined', onClick: () => console.log('remove filter') },
                { text: t('reporting.filterButton'), variant: 'contained', onClick: () => console.log('filter')}
              ]}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <ActionCard
              title={t('reporting.importFlowsTitleContainer')}
              description={t('reporting.importFlowsDescriptionContainer')}
              actionLabel={t('reporting.importFlowButton')}
              actionIcon={<FileUpload/>}
              linkLabel={t('reporting.showAllFlows')}
              onActionClick={() => navigate(PageRoutes.REPORTING_IMPORT_FLOW)}
              onLinkClick={() => console.log('show all flows')}
            />
          </Grid>
        </Grid>

      </Grid>
    </>
  );
};

export default Reporting;
