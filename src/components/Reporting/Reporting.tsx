import SearchCard from '../SearchCard/SearchCard';
import ActionCard from '../ActionCard/ActionCard';
import { CalendarToday, FileUpload, Search } from '@mui/icons-material';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../TitleComponent/TitleComponent';
import { useNavigate } from 'react-router';
import { PageRoutes } from '../../routes/routes';

export const Reporting = () => {

  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <TitleComponent 
        title={t('reporting.title')}
        description={t('reporting.description')}
      />
      <Grid container direction="row">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <SearchCard
              title={t('reporting.searchTitleContainer')}
              description={t('reporting.searchDescriptionContainer')}
              searchFields={[
                { label: t('reporting.searchReportingId'), icon: <Search /> },
                { label: t('reporting.searchRegulationId'), icon: <Search /> },
                { label: t('reporting.regulationFrom'), icon: <CalendarToday />, gridWidth: 6},
                { label: t('commons.to'), icon: <CalendarToday />, gridWidth: 6 },
              ]}
              button={[
                { text: t('commons.filters.remove'), variant: 'outlined', onClick: () => console.log('remove filter') },
                { text: t('commons.filters.filterResults'), variant: 'contained', onClick: () => console.log('filter')}
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
              onLinkClick={() => navigate(PageRoutes.REPORTING_IMPORT_OVERVIEW)}  
            />
          </Grid>
        </Grid>

      </Grid>
    </>
  );
};

export default Reporting;
