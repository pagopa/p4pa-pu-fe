import SearchCard from '../SearchCard/SearchCard';
import ActionCard from '../ActionCard/ActionCard';
import { Download, Upload } from '@mui/icons-material';
import { Box, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate } from 'react-router';
import { PageRoutes } from '../../routes';
import TitleComponent from '../TitleComponent/TitleComponent';
import { useCallback, useState } from 'react';
import {
  noFilterSetted,
  shouldShowGeneralError
} from '../../utils/filtersValidation';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import utils from '../../utils';
import useTelematicReceiptsFilters from '../../hooks/useTelematicReceiptsFilters';
import { TelematicReceiptsFilters } from '../../api/receipts/mappings';
import { FilterFieldValue } from '../../models/Filters';
import { FilterFieldIds } from '../../models/SearchCardFields';
import {
  isValidFiscalCodeOrPIVA,
  normalizeFiscalCodeOrPIVA,
  normalizeCompact
} from '../../utils/fieldValidation';
import {
  clearFieldError,
  setFieldError,
  stripErrorFields
} from '../../utils/filterErrors';

type TelematicReceiptsFiltersWithErrors = TelematicReceiptsFilters & {
  fiscalCode_error?: string;
};

export const TelematicReceipt = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<TelematicReceiptsFiltersWithErrors>(
    {}
  );
  const [error, setError] = useState<boolean>(false);

  const navigateToResults = useCallback(() => {
    // Prepare working copy and normalize IUV if present
    let nextFilters = { ...filters } as TelematicReceiptsFiltersWithErrors;
    const iuv = (filters as Record<string, unknown>)[
      FilterFieldIds.IUV_CODE
    ] as string | undefined;
    if (iuv && typeof iuv === 'string' && iuv.trim() !== '') {
      const normalizedIUV = normalizeCompact(iuv);
      nextFilters = {
        ...nextFilters,
        [FilterFieldIds.IUV_CODE]: normalizedIUV
      };
      setFilters(nextFilters);
    }
    // Validate fiscalCode when present
    const fiscalCode = filters.fiscalCode as string | undefined;
    if (
      fiscalCode &&
      typeof fiscalCode === 'string' &&
      fiscalCode.trim() !== ''
    ) {
      // Normalize the value (remove spaces, uppercase)
      const normalizedFiscalCode = normalizeFiscalCodeOrPIVA(fiscalCode);
      const isValid = isValidFiscalCodeOrPIVA(normalizedFiscalCode);
      if (!isValid) {
        setFilters(
          (prev) =>
            setFieldError(
              prev,
              FilterFieldIds.FISCAL_CODE,
              t('commons.validation.invalidFiscalCodeOrVat')
            ) as typeof prev
        );
        return;
      }
      // Prepare next filters with normalized value and cleared error
      nextFilters = {
        ...nextFilters,
        fiscalCode: normalizedFiscalCode,
        fiscalCode_error: ''
      };
      setFilters(nextFilters);
    }

    if (noFilterSetted(nextFilters)) {
      setError(shouldShowGeneralError(nextFilters));
    } else {
      setError(false);
      // Exclude field errors from URL params
      const cleanedFilters = stripErrorFields(nextFilters);
      const params = utils.URI.encode(cleanedFilters);
      navigate(`${PageRoutes.TELEMATIC_RECEIPT_SEARCH_RESULTS}#${params}`);
    }
  }, [filters, navigate, t]);

  const resetCurrentFilters = useCallback(() => {
    setFilters({});
  }, [filters]);

  const handleFilterChange = (id: string, value: FilterFieldValue) => {
    if (id === FilterFieldIds.FISCAL_CODE) {
      setFilters(
        (prev) =>
          clearFieldError(
            {
              ...prev,
              fiscalCode: (value as string) ?? ''
            },
            FilterFieldIds.FISCAL_CODE
          ) as typeof prev
      );
      return;
    }
    if (id === FilterFieldIds.IUV_CODE) {
      setFilters((prev) => ({
        ...prev,
        iuv: (value as string) ?? ''
      }));
      return;
    }
    if (id === FilterFieldIds.TYPE_ORG) {
      setFilters((prev) => ({
        ...prev,
        typeOrgId: (value as number) ?? undefined
      }));
      return;
    }
    if (id === FilterFieldIds.DATE_RANGE) {
      const range = value as
        | { from?: Date | null; to?: Date | null }
        | undefined;
      const normalized =
        range && range.from && range.to
          ? { from: range.from as Date, to: range.to as Date }
          : undefined;
      setFilters((prev) => ({
        ...prev,
        dateRange: normalized as
          | TelematicReceiptsFilters['dateRange']
          | undefined
      }));
    }
  };

  const { filters: filtersGrid } = useTelematicReceiptsFilters({
    layout: 'grid'
  });

  return (
    <>
      <TitleComponent
        title={t('commons.routes.TELEMATIC_RECEIPT')}
        description={t('telematicReceipts.description')}
      />
      <Grid container direction="row">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <SearchCard
              title={t('telematicReceipts.search')}
              description={t('telematicReceipts.searchdescription')}
              fields={filtersGrid}
              filterValues={filters}
              onFilterChange={handleFilterChange}
              onSubmit={navigateToResults}
              render={error && <ErrorMessage />}
              button={[
                {
                  label: t('commons.filters.remove'),
                  variant: 'outlined',
                  onClick: resetCurrentFilters,
                  id: 'telematic-receipt-reset-btn'
                },
                {
                  label: t('commons.filters.filterResults'),
                  variant: 'contained',
                  id: 'telematic-receipt-search-btn'
                }
              ]}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Box mb={2}>
              <ActionCard
                title={t('telematicReceipts.downloadflowstitle')}
                description={t('telematicReceipts.downloadflowsdescription')}
                actionLabel={t('telematicReceipts.exportrequestbutton')}
                actionIcon={<Download />}
                linkLabel={t('telematicReceipts.exportedflowsviewbutton')}
                onActionClick={() =>
                  navigate(
                    generatePath(PageRoutes.EXPORT_FLOWS, {
                      category: 'receipt'
                    })
                  )
                }
                onLinkClick={() =>
                  navigate(PageRoutes.TELEMATIC_RECEIPT_EXPORT_OVERVIEW)
                }
              />
            </Box>

            <Box>
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
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
