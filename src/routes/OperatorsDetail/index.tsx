import { useState } from 'react';
import { Grid, Typography, useTheme, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import FilterContainer, {
  COMPONENT_TYPE
} from '../../components/FilterContainer/FilterContainer';
import { Search } from '@mui/icons-material';
import OperatorDetailDataGrid from './components/OperatorDetailDataGrid';
import { PageRoutes } from '../../routes';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import utils from '../../utils';
import { FieldValues } from 'react-hook-form';
import { useSearch } from '../../hooks/useSearch';
import { FilterFieldValue } from '../../models/Filters';
import { useOperatorDetailSearch } from '../../api/organizationOperators';
import DetailContainer, {
  DetailSection
} from '../../components/DetailContainer/DetailContainer';
import { useDebtPositionTypesByOrg } from '../../hooks/useDebtPositionTypesByOrg';
import { useBreadcrumbs } from './hooks/useBreadcrumbs';

export const OperatorDetail = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const initialFilters: FieldValues = utils.URI.decode(window.location.hash);

  const { organizationId: paramOrganizationId, mappedExternalUserId } =
    useParams();

  const organizationId = Number(paramOrganizationId);

  if (isNaN(organizationId) || !mappedExternalUserId) {
    navigate(PageRoutes.RESPONSES_ERROR);
  }

  const debtPositionTypesByOrg = useDebtPositionTypesByOrg({
    organizationId
  });

  const [filters, setFilters] = useState(initialFilters);

  const query = useOperatorDetailSearch(
    organizationId,
    mappedExternalUserId as string
  );

  useBreadcrumbs(query);

  const {
    query: { isError, error, data, isSuccess },
    applyFilters
  } = useSearch({ query, filters });

  if (isError) {
    console.error('Error loading operator details:', error);
    navigate(PageRoutes.RESPONSES_ERROR);
  }

  const detailSections: Array<DetailSection> = [
    {
      title: {
        label: t('commons.summary').toUpperCase(),
        variant: 'overline'
      },
      inline: true,
      data: [
        {
          label: t('commons.id').toUpperCase(),
          value: data?.operatorId
        },
        {
          label: t('commons.role'),
          value: t(`commons.roles.${data?.operatorRole}`) || data?.operatorRole
        },
        {
          label: t('commons.fiscalCode'),
          value: data?.operatorFiscalCode
        }
      ]
    }
  ];

  const filterItems = [
    {
      id: 'debtPositionTypeOrgDescription',
      type: COMPONENT_TYPE.textField,
      label: t('commons.searchForDescription'),
      adornment: <Search />,
      gridWidth: 4
    },
    {
      id: 'debtPositionTypeOrgCode',
      type: COMPONENT_TYPE.textField,
      label: t('commons.searchForCode'),
      adornment: <Search />,
      gridWidth: 3
    },
    {
      type: COMPONENT_TYPE.select,
      id: 'debtPositionTypeId',
      label: t('commons.debtType'),
      gridWidth: 4,
      options: debtPositionTypesByOrg?.data?.optionsMap
    },
    {
      type: COMPONENT_TYPE.button,
      label: t('commons.filters.filterResults'),
      gridWidth: 1,
      onClick: () => applyFilters(filters)
    }
  ];

  const handleFilterChange = (id: string, value: FilterFieldValue) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [id]: value
    }));
  };

  return (
    <>
      <TitleComponent
        title={
          isSuccess
            ? `${data?.operatorName || ''} ${data?.operatorLastName || ''}`
            : '-'
        }
        accessibleTitle={t('OperatorDetail.accessibleTitle', {
          operatorId: data?.operatorId,
          interpolation: { escapeValue: false }
        })}
      />
      <Grid container spacing={2}>
        <Grid item md={12}>
          <DetailContainer sections={detailSections} />
        </Grid>
      </Grid>

      <Grid container marginTop={4}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            mb: 2
          }}
        >
          <Typography variant="h6">
            {t('OperatorDetail.associatedDebtPositionTypes')}
          </Typography>
        </Box>
        <Grid
          container
          direction="row"
          my={2}
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <FilterContainer
            onChange={handleFilterChange}
            values={filters}
            items={filterItems}
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
          aria-label="results-table"
        >
          <OperatorDetailDataGrid data={data?.pagedDebtPositionTypeOrg} />
        </Grid>
      </Grid>
    </>
  );
};

export default OperatorDetail;
