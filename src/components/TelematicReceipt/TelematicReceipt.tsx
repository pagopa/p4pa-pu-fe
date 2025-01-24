import SearchCard from '../SearchCard/SearchCard';
import ActionCard from '../ActionCard/ActionCard';
import { CalendarToday, Download, Search, Upload } from '@mui/icons-material';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageRoutes } from '../../routes/routes';
import TitleComponent from '../TitleComponent/TitleComponent';

export const TelematicReceipt = () => {

  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <TitleComponent 
        title={t('telematicReceipts.title')}
        description={t('telematicReceipts.description')}
      />
      <Grid container direction="row">
        <Grid container spacing={2} 
          // width={900}
        >
          <Grid item xs={12} md={6}>
            <SearchCard
              title={t('telematicReceipts.search')}
              description={t('telematicReceipts.searchdescription')}
              searchFields={[
                { label: t('telematicReceipts.iuv'), icon: <Search /> },
                { label: t('telematicReceipts.from'), icon: <CalendarToday />, gridWidth: 6},
                { label: t('telematicReceipts.to'), icon: <CalendarToday />, gridWidth: 6 },
              ]}
              selectLabel={t('telematicReceipts.duetype')}
              selectOptions={[
                { label: t('telematicReceipts.tari'), value: 'tari' },
                { label: t('telematicReceipts.trafficoffence'), value: 'violation' },
                { label: 'Reset', value: ''}
              ]}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <ActionCard
              title={t('telematicReceipts.downloadflowstitle')}
              description={t('telematicReceipts.downloadflowsdescription')}
              actionLabel={t('telematicReceipts.exportrequestbutton')}
              actionIcon={<Download/>}
              linkLabel={t('telematicReceipts.exportedflowsviewbutton')}
              onActionClick={() => navigate(PageRoutes.TELEMATIC_RECEIPT_EXPORT_FLOW_RESERVATION)}
              onLinkClick={() => navigate(PageRoutes.TELEMATIC_RECEIPT_EXPORT_OVERVIEW)}
            />

            <ActionCard
              title={t('telematicReceipts.importflowstitle')}
              description={t('telematicReceipts.importflowsdescription')}
              actionLabel={t('telematicReceipts.importflowbutton')}
              actionIcon={<Upload/>}
              linkLabel={t('telematicReceipts.importedflowsviewbutton')}
              onActionClick={() => navigate(PageRoutes.TELEMATIC_RECEIPT_IMPORT_FLOW)}
              onLinkClick={() => navigate(PageRoutes.TELEMATIC_RECEIPT_IMPORT_OVERVIEW)}
            />
          </Grid>
        </Grid>

      </Grid>
    </>
  );
};

export default TelematicReceipt;
