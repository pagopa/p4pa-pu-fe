import SearchCard from '../SearchCard/SearchCard';
import ActionCard from '../ActionCard/ActionCard';
import { FileUpload } from '@mui/icons-material';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../TitleComponent/TitleComponent';
import { getTabsConfig } from './DebtTabsConfig';

export const DebtPositionsPage = () => {
  const { t } = useTranslation();
  const debtTabsConfig = getTabsConfig(t);

  return (
    <>
      <TitleComponent title={t('commons.routes.DEBT_POSITIONS')}
        callToAction={
          [
            {
              variant: 'contained', 
              buttonText: t('commons.createNew'), 
              onActionClick: () => console.log('create new')
            },
          ]
        } 
      />
      <Grid container direction="row">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <SearchCard
              title={t('debtPositions.searchCardTitle')}
              description={t('debtPositions.searchCardDescription')}
              tabsConfig={debtTabsConfig}
              button={[
                {
                  label: t('commons.filters.remove'),
                  variant: 'outlined',
                  // onClick: () => //TODO
                },
                {
                  label: t('commons.filters.filterResults'),
                  variant: 'contained',
                  onClick: () => console.log('go to results'),
                  // disabled: //TODO
                }
              ]}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <ActionCard
              title={t('debtPositions.importDebtFlow')}
              description={t('debtPositions.importDebtFlowDescription')}
              actionLabel={t('commons.importFlow')}
              actionIcon={<FileUpload />}
              linkLabel={t('commons.showAllFlows')}
              onActionClick={() => console.log('go to all flows')}
              onLinkClick={() => console.log('import flow')}
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default DebtPositionsPage;
