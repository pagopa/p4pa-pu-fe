import { FieldValues, FormProvider, useForm } from 'react-hook-form';
import { FileUpload } from '@mui/icons-material';
import { generatePath, useNavigate } from 'react-router';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ActionCard from '../../components/ActionCard/ActionCard';
import { noFilterSetted } from '../../utils/filtersValidation';
import { PageRoutes } from '../../routes';
import { ReportingFilters } from '../../hooks/useReportingFilters';
import SearchCard from '../../components/SearchCard/SearchCard';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { useState } from 'react';
import utils from '../../utils';

export const Reporting = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const form = useForm();
  const [error, setError] = useState<boolean>(false);

  const navigateToResults = (filters: FieldValues) => {
    if (noFilterSetted(filters)) {
      setError(true);
    } else {
      const params = utils.URI.encode(filters);
      navigate(`${PageRoutes.REPORTING_SEARCH_RESULTS}#${params}`);
    }
  };

  return (
    <>
      <TitleComponent
        title={t('reporting.title')}
        description={t('reporting.description')}
      />
      <Grid container direction="row">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormProvider {...form}>
              <form noValidate onSubmit={form.handleSubmit(navigateToResults)}>
                <SearchCard
                  title={t('reporting.searchTitleContainer')}
                  description={t('reporting.searchDescriptionContainer')}
                  button={[
                    {
                      label: t('commons.filters.remove'),
                      variant: 'outlined',
                      onClick: form.reset,
                      id: 'reporting-reset-btn'
                    },
                    {
                      label: t('commons.filters.filterResults'),
                      variant: 'contained',
                      type: 'submit',
                      id: 'reporting-search-btn'
                    }
                  ]}
                  render={<ReportingFilters layout="grid" error={error} />}
                />
              </form>
            </FormProvider>
          </Grid>

          <Grid item xs={12} md={6}>
            <ActionCard
              title={t('reporting.importFlowsTitleContainer')}
              description={t('reporting.importFlowsDescriptionContainer')}
              actionLabel={t('commons.importFlow')}
              actionIcon={<FileUpload />}
              linkLabel={t('commons.showAllFlows')}
              onActionClick={() =>
                navigate(
                  generatePath(PageRoutes.IMPORT_FLOWS, {
                    category: 'reporting'
                  })
                )
              }
              onLinkClick={() => navigate(PageRoutes.REPORTING_IMPORT_OVERVIEW)}
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default Reporting;
