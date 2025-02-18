import { Box, Grid, useTheme } from '@mui/material';
import { CalendarToday, Downloading, Search } from '@mui/icons-material';
import FlowDataGrid from '../../components/FlowDataGrid/FlowDataGrid';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageRoutes } from '../../App';
import TitleComponent from '../TitleComponent/TitleComponent';
import FilterContainer, { COMPONENT_TYPE } from '../FilterContainer/FilterContainer';

const TelematicReceiptFlowExportOverview = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <TitleComponent 
        title= {t('commons.routes.TELEMATIC_RECEIPT_EXPORT_OVERVIEW')} 
        callToAction={
          [
            {
              icon: <Downloading />, 
              variant: 'outlined', 
              buttonText: t('telematicReceiptFlowExportOverview.buttonReservationExport'), 
              onActionClick: () => navigate(PageRoutes.TELEMATIC_RECEIPT_EXPORT_FLOW_RESERVATION)
            },
          ]
        } 
        description= {t('telematicReceiptFlowExportOverview.description')}
      />
      <Grid container direction="row" spacing={2} alignItems={'center'}
        justifyContent={'space-between'} my={2}
      >
        <FilterContainer
          items={[
            { type: COMPONENT_TYPE.textField, label: t('commons.searchName'), icon: <Search />, gridWidth: 5 },
            { type: COMPONENT_TYPE.textField, label: t('telematicReceiptFlowExportOverview.exportFrom'), icon: <CalendarToday />, gridWidth: 3 },
            { type: COMPONENT_TYPE.textField, label: t('commons.to'), icon: <CalendarToday />, gridWidth: 3 },
            { type: COMPONENT_TYPE.button, label: t('commons.filters.filterResults'), gridWidth: 1, onClick: () => console.log('Filter applied') },
          ]}
        />
      </Grid>
      <Box
        sx={{
          bgcolor: theme.palette.grey[200],
          padding: 2
        }}
      >
        <FlowDataGrid />
      </Box>
    </>
  );
};

export default TelematicReceiptFlowExportOverview;
