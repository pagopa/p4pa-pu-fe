import { useState, useCallback } from 'react';
import { Typography, Box, Paper, Grid, Button } from '@mui/material';
import {
  Receipt,
  PlaylistAddCheck,
  RequestPage,
  Inventory,
  AccountTree,
  ArrowBack
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FormProvider } from 'react-hook-form';

import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { FormSection } from './components/FormSection';
import { FormComponent } from '../../components/FormComponent';
import { useClassificationExport } from '../../hooks/useClassificationExport';
import { LabelEnum } from '../../../generated/apiClient';
import { createClassificationsExportFile } from '../../api/createExportFile';
import { PageRoutes } from '../../routes';
import { useStore } from '../../store/GlobalStore';
import utils from '../../utils';

const ClassificationExportPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    state: { organizationId }
  } = useStore();

  const { formMethods, validateForm, buildApiPayload } =
    useClassificationExport(organizationId);

  const createClassificationsExport = createClassificationsExportFile();

  const classificationOptions = Object.values(LabelEnum).map((value) => ({
    label: t(`classificationsExport.classificationsOptions.${value}`),
    value: value
  }));

  const versionOptions = [
    { label: '1.3', value: 'v1.3' },
    { label: '1.4', value: 'v1.4' }
  ];

  const [dateRanges, setDateRanges] = useState({
    classification: { from: null as Date | null, to: null as Date | null },
    payment: { from: null as Date | null, to: null as Date | null },
    reporting: { from: null as Date | null, to: null as Date | null },
    accounting: { from: null as Date | null, to: null as Date | null },
    value: { from: null as Date | null, to: null as Date | null },
    payDate: { from: null as Date | null, to: null as Date | null }
  });

  const updateDateRange = useCallback(
    (
      rangeName: keyof typeof dateRanges,
      field: 'from' | 'to',
      date: Date | null
    ) => {
      setDateRanges((prev) => ({
        ...prev,
        [rangeName]: {
          ...prev[rangeName],
          [field]: date
        }
      }));
    },
    []
  );

  const getDateRangeValidation = useCallback(
    (rangeName: keyof typeof dateRanges) => {
      const range = dateRanges[rangeName];
      const hasOnlyOne =
        (!!range.from && !range.to) || (!range.from && !!range.to);

      if (hasOnlyOne) {
        return {
          hasError: true,
          errorMessage: t(
            'classificationsExport.errorMessages.singleInstanceBothDates'
          )
        };
      }

      return {
        hasError: false,
        errorMessage: ''
      };
    },
    [dateRanges, t]
  );

  const renderValidatedDateRange = useCallback(
    (
      rangeName: keyof typeof dateRanges,
      rangeLabel: string,
      required = false
    ) => {
      const validation = getDateRangeValidation(rangeName);

      return (
        <Box sx={{ mb: 2 }}>
          <FormComponent.DateRange
            rangeLabel={rangeLabel}
            required={required}
            from={{
              value: dateRanges[rangeName].from,
              onChange: (date) => updateDateRange(rangeName, 'from', date),
              errorMessage: validation.hasError
                ? validation.errorMessage
                : undefined
            }}
            to={{
              value: dateRanges[rangeName].to,
              onChange: (date) => updateDateRange(rangeName, 'to', date),
              errorMessage: validation.hasError
                ? validation.errorMessage
                : undefined
            }}
          />
          {validation.hasError && (
            <Typography
              variant="caption"
              color="error.dark"
              sx={{ mt: 1, display: 'block' }}
            >
              {validation.errorMessage}
            </Typography>
          )}
        </Box>
      );
    },
    [dateRanges, updateDateRange, getDateRangeValidation]
  );

  const areDatePairsValid = useCallback((): boolean => {
    return Object.keys(dateRanges).every((key) => {
      const validation = getDateRangeValidation(key as keyof typeof dateRanges);
      return !validation.hasError;
    });
  }, [dateRanges, getDateRangeValidation]);

  const handleSubmit = useCallback(() => {
    const formData = formMethods.getValues();

    if (!validateForm(formData, dateRanges)) {
      utils.notify.emit(
        t('classificationsExport.errorMessages.missingRequiredFields')
      );
      return;
    }

    if (!areDatePairsValid()) {
      utils.notify.emit(t('classificationsExport.errorMessages.bothDates'));
      return;
    }

    const payload = buildApiPayload(formData, dateRanges);

    createClassificationsExport.mutate(
      { data: payload },
      {
        onSuccess: () =>
          navigate(PageRoutes.RESPONSES_SUCCESS, {
            state: { category: 'classification-export' }
          }),
        onError: () => utils.notify.emit(t('exportFlow.errorMessage'))
      }
    );
  }, [
    areDatePairsValid,
    formMethods,
    validateForm,
    buildApiPayload,
    dateRanges,
    createClassificationsExport,
    navigate,
    t
  ]);

  const handleBack = useCallback(() => {
    navigate(PageRoutes.CLASSIFICATIONS_EXPORT_OVERVIEW);
  }, [navigate]);

  return (
    <FormProvider {...formMethods}>
      <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
        <TitleComponent
          title={t('classificationsExport.title')}
          description={t('classificationsExport.description')}
        />

        <Paper sx={{ p: 4, mt: 3 }}>
          <Typography variant="h6" fontWeight={700}>
            {t('classificationsExport.subTitle')}
          </Typography>
          <Typography variant="body2" my={2}>
            {t('classificationsExport.subDescription')}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: 'error.dark' }}>
            {t('commons.requiredFieldDescription')}
          </Typography>

          {/* payment classification */}
          <FormSection
            icon={<PlaylistAddCheck />}
            title={t(
              'classificationsExport.sections.paymentClassification.title'
            )}
            data-testid="classification-section"
          >
            <FormComponent.ControlledSelect
              name="label"
              label={t(
                'classificationsExport.sections.paymentClassification.type'
              )}
              options={classificationOptions}
              control={formMethods.control}
              required={true}
              sx={{ mb: 2 }}
              data-testid="classification-section-type"
            />
            {renderValidatedDateRange(
              'classification',
              t(
                'classificationsExport.sections.paymentClassification.lastUpdateDate'
              ),
              true
            )}
          </FormSection>

          {/* trace version */}
          <FormSection
            icon={<AccountTree />}
            title={t('classificationsExport.sections.traceVersion.title')}
            data-testid="trace-section"
          >
            <FormComponent.ControlledSelect
              name="fileVersion"
              label={t(
                'classificationsExport.sections.traceVersion.fileVersion'
              )}
              options={versionOptions}
              control={formMethods.control}
              required
              data-testid="trace-section-version"
            />
          </FormSection>

          {/* notice */}
          <FormSection
            icon={<Receipt />}
            title="Avviso"
            data-testid="notice-section"
          >
            <FormComponent.ControlledTextField
              name="iuv"
              label={t('commons.iuv')}
              control={formMethods.control}
              required={false}
              noAdornment
              sx={{ mb: 2 }}
              data-testid="notice-section-iuv"
            />
            <FormComponent.ControlledTextField
              name="remittanceInformation"
              label={t(
                'classificationsExport.sections.notice.remittanceInformation'
              )}
              control={formMethods.control}
              required={false}
              noAdornment
              sx={{ mb: 2 }}
              data-testid="notice-section-remittanceInformation"
            />
            <FormComponent.ControlledTextField
              name="pspCompanyName"
              label={t('classificationsExport.sections.notice.applicant')}
              control={formMethods.control}
              required={false}
              noAdornment
              sx={{ mb: 2 }}
            />
            {renderValidatedDateRange(
              'payment',
              t('classificationsExport.sections.notice.paymentDate')
            )}
            <FormComponent.ControlledTextField
              name="iur"
              label={t('commons.iur')}
              control={formMethods.control}
              required={false}
              noAdornment
              sx={{ mb: 2, mt: 2 }}
              data-testid="notice-section-iur"
            />
            <FormComponent.ControlledTextField
              name="iud"
              label={t('commons.iud')}
              control={formMethods.control}
              required={false}
              noAdornment
              sx={{ mb: 2 }}
              data-testid="notice-section-iud"
            />
            <FormComponent.ControlledTextField
              name="iuf"
              label={t('commons.iuf')}
              control={formMethods.control}
              required={false}
              noAdornment
              data-testid="notice-section-iuf"
            />
          </FormSection>

          {/* reporting */}
          <FormSection
            icon={<RequestPage />}
            title={t('classificationsExport.sections.reporting.title')}
            data-testid="reporting-section"
          >
            {renderValidatedDateRange(
              'reporting',
              t('classificationsExport.sections.reporting.paymentDate')
            )}
            {renderValidatedDateRange(
              'payDate',
              t('classificationsExport.sections.reporting.regulationDate')
            )}
            <FormComponent.ControlledTextField
              name="regulationUniqueIdentifier"
              label={t(
                'classificationsExport.sections.reporting.regulationUniqueIdentifier'
              )}
              control={formMethods.control}
              required={false}
              noAdornment
              data-testid="reporting-section-regulationUniqueIdentifier"
            />
          </FormSection>

          {/* treasury */}
          <FormSection
            icon={<Inventory />}
            title={t('classificationsExport.sections.treasury.title')}
            data-testid="treasury-section"
          >
            <FormComponent.ControlledTextField
              name="billAmountCents"
              label={t('classificationsExport.sections.treasury.amount')}
              control={formMethods.control}
              required={false}
              noAdornment
              inputProps={{
                type: 'number',
                min: 0,
                step: 0.01,
                inputMode: 'decimal'
              }}
              sx={{ mb: 2 }}
              data-testid="treasury-section-billAmountCents"
            />
            {renderValidatedDateRange(
              'accounting',
              t('classificationsExport.sections.treasury.accountDate')
            )}
            {renderValidatedDateRange(
              'value',
              t('classificationsExport.sections.treasury.valueDate')
            )}
            <FormComponent.ControlledTextField
              name="accountRegistryCode"
              label={t(
                'classificationsExport.sections.treasury.accountRegistryCode'
              )}
              control={formMethods.control}
              required={false}
              noAdornment
              sx={{ mt: 2 }}
              data-testid="treasury-section-accountRegistryCode"
            />
          </FormSection>
        </Paper>

        <Grid container justifyContent="space-between" mt={3}>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={handleBack}
              type="button"
              data-testid="backButton"
            >
              {t('commons.back')}
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              onClick={handleSubmit}
              type="button"
              data-testid="confirmButton"
            >
              {t('exportFlow.buttonConfirmReservation')}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </FormProvider>
  );
};

export default ClassificationExportPage;
