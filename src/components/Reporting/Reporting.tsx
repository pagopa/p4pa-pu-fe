import SearchCard from '../SearchCard/SearchCard';
import ActionCard from '../ActionCard/ActionCard';
import { CalendarToday, FileUpload, Search } from '@mui/icons-material';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../TitleComponent/TitleComponent';

export const Reporting = () => {

  const { t } = useTranslation();

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
              onActionClick={() => console.log('import flow')}
              onLinkClick={() => console.log('show all flows')}
            />
          </Grid>
        </Grid>

      </Grid>
    </>
  );
};

export default Reporting;
