import SearchCard from '../SearchCard/SearchCard';
import ActionCard from '../ActionCard/ActionCard';
import { Download, Search, Upload } from '@mui/icons-material';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate } from 'react-router-dom';
import { PageRoutes } from '../../App';
import TitleComponent from '../TitleComponent/TitleComponent';
import { COMPONENT_TYPE } from '../FilterContainer/FilterContainer';
import { useCallback, useState } from 'react';
import { BaseFilterValues, FilterFieldValue } from '../../models/Filters';
import { FilterFieldIds } from '../../models/SearchCardFields';
import { useDebtPositionsTypeOrg } from '../../hooks/useDebtPositionsTypeOrg';
import { useStore } from '../../store/GlobalStore';

export const TelematicReceipt = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Array<BaseFilterValues>>([{}]);
  const {
    state: { organizationId }
  } = useStore();
  const debtPositionsTypes = useDebtPositionsTypeOrg({ organizationId });

  const navigateToResults = useCallback(() => {
    navigate(PageRoutes.TELEMATIC_RECEIPT_SEARCH_RESULTS, {
      state: {
        filters: filters[0]
      }
    });
  }, [0, filters, navigate]);

  const resetCurrentFilters = useCallback(() => {
    const newFilters = [...filters];
    newFilters[0] = {};
    setFilters(newFilters);
  }, [0, filters]);

  const handleFilterChange = useCallback(
    (id: string, value: FilterFieldValue) => {
      setFilters((prevFilters) => {
        const newFilters = [...prevFilters];
        newFilters[0] = {
          ...newFilters[0],
          [id]: value
        };
        return newFilters;
      });
    },
    [0]
  );

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
              filterValues={filters[0]}
              onFilterChange={handleFilterChange}
              fields={[
                {
                  type: COMPONENT_TYPE.textField,
                  label: t('commons.iuv'),
                  adornment: <Search />,
                  id: FilterFieldIds.IUV_CODE
                },
                {
                  type: COMPONENT_TYPE.dateRange,
                  label: 'daterange',
                  from: { label: t('dates.from') },
                  to: { label: t('dates.to') },
                  id: FilterFieldIds.DATE_RANGE
                },
                {
                  type: COMPONENT_TYPE.select,
                  label: t('commons.duetype'),
                  id: FilterFieldIds.TYPE_ORG,
                  options: debtPositionsTypes.optionsMap,
                  defaultValue: 0
                }
              ]}
              button={[
                {
                  label: t('commons.filters.remove'),
                  variant: 'outlined',
                  onClick: resetCurrentFilters
                },
                {
                  label: t('commons.filters.filterResults'),
                  variant: 'contained',
                  onClick: navigateToResults
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
              onActionClick={() =>
                navigate(
                  generatePath(PageRoutes.EXPORT_FLOWS, { category: 'receipt' })
                )
              }
              onLinkClick={() =>
                navigate(PageRoutes.TELEMATIC_RECEIPT_EXPORT_OVERVIEW)
              }
            />

            <ActionCard
              title={t('telematicReceipts.importflowstitle')}
              description={t('telematicReceipts.importflowsdescription')}
              actionLabel={t('commons.importFlow')}
              actionIcon={<Upload />}
              linkLabel={t('telematicReceipts.importedflowsviewbutton')}
              onActionClick={() =>
                navigate(
                  generatePath(PageRoutes.IMPORT_FLOWS, {
                    category: 'telematic-receipt'
                  })
                )
              }
              onLinkClick={() =>
                navigate(PageRoutes.TELEMATIC_RECEIPT_IMPORT_OVERVIEW)
              }
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default TelematicReceipt;
