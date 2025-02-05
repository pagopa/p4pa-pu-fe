import { Grid, Typography, useTheme } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../TitleComponent/TitleComponent';
import DetailContainer, { DetailData } from '../DetailContainer/DetailContainer';
import { useParams } from 'react-router-dom';
import FilterContainer, { COMPONENT_TYPE } from '../FilterContainer/FilterContainer';
import { CalendarToday, Search } from '@mui/icons-material';
import ReportingDetailDataGrid from './ReportingDetailDataGrid';

export const ReportingDetail = () => {

  const { t } = useTranslation();
  const theme = useTheme();
  const { id } = useParams<{ id: string}>();
  const idReporting = id ?? '';

  const summaryData: DetailData[] = [
    { label: 'ID Rendicontazione / IUF', value: idReporting },
    { label: 'ID Regolamento', value: '49509-241009-39X-451585346538' },
    { label: 'Data e ora', value: '10/10/2024 14:00:40' },
    { label: 'Data regolamento', value: '10/10/2024' }
  ];

  const paymentData: DetailData[] = [
    { label: 'Totale pagamenti', value: '100' },
    { label: 'Importo totale', value: '100,00 €' }
  ];

  return (
    <>

      <TitleComponent 
        title={idReporting}
        callToAction={[
          {
            icon: <DownloadIcon fontSize="small"/>,
            buttonText: t('commons.files.downloadFlow'),
            onActionClick: () => console.log('Download')
          }
        ]}
      />
      <Grid container spacing={2}>
        <Grid item lg={12} md={12}>
          <DetailContainer 
            sections={[
              {
                title: t('commons.summary'),
                data: [...summaryData],
                inline: true
              },
              {
                title: t('commons.payment'),
                data: [...paymentData],
                inline: true
              },
            ]}
          />
        </Grid>
      </Grid>
      <Grid container marginTop={4}>
        <Typography variant="h6">{t('commons.detail')}</Typography>
        <Grid container direction="row" spacing={2} alignItems={'center'}
          justifyContent={'space-between'} my={1}
        >
          <FilterContainer
            items={[
              { type: COMPONENT_TYPE.textField, label: t('commons.searchIUV'), icon: <Search />, gridWidth: 5 },
              { type: COMPONENT_TYPE.textField, label: t('commons.from'), icon: <CalendarToday />, gridWidth: 2 },
              { type: COMPONENT_TYPE.textField, label: t('commons.to'), icon: <CalendarToday />, gridWidth: 2 },
              { type: COMPONENT_TYPE.select, label: t('commons.duetype'), gridWidth: 2, options: [
                { label: 'TARI', value: 'TARI' },
                { label: 'DOVUTO', value: 'DOVUTO' },
              ]},
              { type: COMPONENT_TYPE.button, label: t('commons.filters.filterResults'), gridWidth: 1, onClick: () => console.log('Filter applied') },
            ]}
          />
        </Grid>
        <Grid 
          container
          p={2}
          height="100%"
          sx={{
            bgcolor: theme.palette.grey[200],
            overflow: 'auto'
          }}
          aria-label='results-table'
        >
          <ReportingDetailDataGrid />
        </Grid>
      </Grid>
    </>
  );
};

export default ReportingDetail;