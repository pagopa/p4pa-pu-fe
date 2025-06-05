import { ArrowBack, Dashboard, InsertDriveFile } from '@mui/icons-material';
import { Button, Grid, GridDirection } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import TitleComponent from '../TitleComponent/TitleComponent';
import ExportFlowContainer from '../ExportFlowContainer/ExportFlowContainer';
import { useState } from 'react';
import { PageRoutes } from '../../routes';
import { useDebtPositionsTypeOrg } from '../../hooks/useDebtPositionsTypeOrg';
import { useStore } from '../../store/GlobalStore';
import { useDateRange } from '../../hooks/useDateRange';
import { FormComponent } from '../FormComponent';
import {
  ExportFileTypeEnum,
  PaidExportFileRequest,
  ReceiptsArchivingExportFileRequest
} from '../../../generated/apiClient';
import {
  createPaidExportFile,
  createReceiptsArchivingExportFile
} from '../../api/createExportFile';
import utils from '../../utils';

export const ExportFlowPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { category } = useParams<{ category: string }>();

  const {
    state: { organizationId }
  } = useStore();

  const [formData, setFormData] = useState<{
    fileVersion: string;
    dueType?: string;
  }>({
    fileVersion: ''
  });

  const {
    fromDate,
    toDate,
    setFromDateToday,
    setToDateToday,
    setFromError,
    setToError,
    isButtonDisabled
  } = useDateRange(0, false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const types = useDebtPositionsTypeOrg({ organizationId });

  const selectOptionsFileVersion = [
    { label: '1.0', value: 'v1.0' },
    { label: '1.1', value: 'v1.1' },
    { label: '1.2', value: 'v1.2' },
    { label: '1.3', value: 'v1.3' }
  ];

  const createPaidExport = createPaidExportFile();
  const createReceiptsArchivingExport = createReceiptsArchivingExportFile();

  const handleExportClick = () => {
    if (!fromDate || !toDate) return;

    const formattedFrom = new Date(fromDate).toISOString().split('T')[0];
    const formattedTo = new Date(toDate).toISOString().split('T')[0];

    if (category === 'receipt') {
      const exportRequest: PaidExportFileRequest = {
        organizationId,
        exportFileType: ExportFileTypeEnum.PAID,
        fileVersion: formData.fileVersion,
        filterFields: {
          paymentDate: {
            from: formattedFrom,
            to: formattedTo
          },
          ...(formData.dueType && {
            debtPositionTypeOrgId: Number(formData.dueType)
          })
        }
      };

      createPaidExport.mutate(
        { data: exportRequest },
        {
          onSuccess: () => {
            navigate(PageRoutes.RESPONSES_SUCCESS, {
              state: {
                category: 'telematic-receipt-export'
              }
            });
          },
          onError: (error) => {
            console.error(error);
            utils.notify.emit(t('exportFlow.errorMessage'));
          }
        }
      );
    } else if (category === 'conservation') {
      const exportRequest: ReceiptsArchivingExportFileRequest = {
        organizationId,
        exportFileType: ExportFileTypeEnum.RECEIPTS_ARCHIVING,
        fileVersion: 'v1.0',
        filterFields: {
          paymentDate: {
            from: formattedFrom,
            to: formattedTo
          }
        }
      };

      createReceiptsArchivingExport.mutate(
        { data: exportRequest },
        {
          onSuccess: () => {
            navigate(PageRoutes.RESPONSES_SUCCESS, {
              state: {
                category: 'conservation-export'
              }
            });
          },
          onError: (error) => {
            console.error(error);
            utils.notify.emit(t('exportFlow.errorMessage'));
          }
        }
      );
    }
  };

  const handleExitButton = () => {
    if (category === 'receipt') {
      navigate(PageRoutes.TELEMATIC_RECEIPT_EXPORT_OVERVIEW);
    } else if (category === 'conservation') {
      navigate(PageRoutes.CONSERVATION);
    }
  };

  return (
    <>
      <TitleComponent
        title={t('exportFlow.title')}
        description={t('exportFlow.description')}
      />
      <ExportFlowContainer
        section={[
          {
            direction: 'row',
            title: {
              icon: <InsertDriveFile sx={{ marginRight: 1 }} />,
              label: t('commons.paymentDate')
            },
            inputFields: [{ fieldKey: 'dateRange', label: '' }],
            dateRange: (
              <FormComponent.DateRange
                required
                from={{
                  value: fromDate,
                  todayValue: new Date(),
                  onChange: setFromDateToday,
                  errorMessage: t('dates.validations.from')
                }}
                to={{
                  value: toDate,
                  todayValue: new Date(),
                  onChange: setToDateToday,
                  errorMessage: t('dates.validations.to')
                }}
                onFromErrorChange={setFromError}
                onToErrorChange={setToError}
              />
            )
          },
          ...(category !== 'conservation'
            ? [
                {
                  direction: 'column' as GridDirection,
                  title: {
                    icon: <InsertDriveFile sx={{ marginRight: 1 }} />,
                    label: t('exportFlow.fileVersion')
                  },
                  inputFields: [
                    {
                      required: true,
                      label: t('exportFlow.fileVersion'),
                      gridWidth: 12,
                      fieldKey: 'fileVersion'
                    }
                  ],
                  selectOptions: selectOptionsFileVersion
                },
                {
                  direction: 'column' as GridDirection,
                  title: {
                    icon: <Dashboard sx={{ marginRight: 1 }} />,
                    label: t('exportFlow.dueType')
                  },
                  inputFields: [
                    {
                      label: t('exportFlow.dueTypePlaceHolder'),
                      gridWidth: 12,
                      fieldKey: 'dueType'
                    }
                  ],
                  selectOptions: types.optionsMap
                }
              ]
            : [])
        ]}
        formData={formData}
        onSelectChange={handleChange}
      />

      <Grid container direction={'row'} justifyContent={'space-between'}>
        <Grid item>
          <Button
            data-testid="exit-button"
            size="large"
            variant="outlined"
            fullWidth
            startIcon={<ArrowBack />}
            onClick={handleExitButton}
          >
            {t('commons.exit')}
          </Button>
        </Grid>
        <Grid item>
          <Button
            data-testid="success-button"
            disabled={isButtonDisabled}
            size="large"
            variant="contained"
            fullWidth
            onClick={handleExportClick}
          >
            {t('exportFlow.buttonConfirmReservation')}
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default ExportFlowPage;
