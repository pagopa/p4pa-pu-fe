import SearchCard from '../SearchCard/SearchCard';
import ActionCard from '../ActionCard/ActionCard';
import { Download, Search, Upload } from '@mui/icons-material';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate } from 'react-router-dom';
import { PageRoutes } from '../../routes/routes';
import TitleComponent from '../TitleComponent/TitleComponent';
import { COMPONENT_TYPE } from '../FilterContainer/FilterContainer';

export const TelematicReceipt = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <TitleComponent
        title={t('commons.routes.TELEMATIC_RECEIPT')}
        description={t('telematicReceipts.description')}
      />
      <Grid container direction="row">
        <Grid
          container
          spacing={2}
          // width={900}
        >
          <Grid item xs={12} md={6}>
            <SearchCard
              title={t('telematicReceipts.search')}
              description={t('telematicReceipts.searchdescription')}
              fields={[
                { type: COMPONENT_TYPE.textField, label: t('commons.iuv'), icon: <Search /> },
                { type: COMPONENT_TYPE.dateRange, label: 'daterange' },
                {
                  type: COMPONENT_TYPE.select,
                  label: t('commons.duetype'),
                  options: [
                    { label: t('telematicReceipts.tari'), value: 'tari' },
                    { label: t('telematicReceipts.trafficoffence'), value: 'violation' }
                  ]
                }
              ]}
              button={[
                {
                  text: t('commons.search'),
                  variant: 'contained',
                  onClick: () => navigate(PageRoutes.TELEMATIC_RECEIPT_SEARCH_RESULTS)
                }
              ]}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <ActionCard
              title={t('telematicReceipts.downloadflowstitle')}
              description={t('telematicReceipts.downloadflowsdescription')}
              actionLabel={t('telematicReceipts.exportrequestbutton')}
              actionIcon={<Download />}
              linkLabel={t('telematicReceipts.exportedflowsviewbutton')}
              onActionClick={() => navigate(PageRoutes.TELEMATIC_RECEIPT_EXPORT_FLOW_RESERVATION)}
              onLinkClick={() => navigate(PageRoutes.TELEMATIC_RECEIPT_EXPORT_OVERVIEW)}
            />

            <ActionCard
              title={t('telematicReceipts.importflowstitle')}
              description={t('telematicReceipts.importflowsdescription')}
              actionLabel={t('telematicReceipts.importflowbutton')}
              actionIcon={<Upload />}
              linkLabel={t('telematicReceipts.importedflowsviewbutton')}
              onActionClick={() =>
                navigate(generatePath(PageRoutes.IMPORT_FLOWS, { category: 'telematic-receipt' }))
              }
              onLinkClick={() => navigate(PageRoutes.TELEMATIC_RECEIPT_IMPORT_OVERVIEW)}
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default TelematicReceipt;
