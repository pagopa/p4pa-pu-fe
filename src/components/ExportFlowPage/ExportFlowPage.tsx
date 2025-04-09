import { ArrowBack, Dashboard, InsertDriveFile } from '@mui/icons-material';
import { Button, Grid, GridDirection } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import TitleComponent from '../TitleComponent/TitleComponent';
import ExportFlowContainer from '../ExportFlowContainer/ExportFlowContainer';
import { useState } from 'react';
import { PageRoutes } from '../../App';
import { useDebtPositionsTypeOrg } from '../../hooks/useDebtPositionsTypeOrg';
import { useStore } from '../../store/GlobalStore';
import { useDateRange } from '../../hooks/useDateRange';
import { FormComponent } from '../FormComponent';
import {
  ExportFileRequestDTO,
  ExportFileTypeEnum
} from '../../../generated/apiClient';
import { createExportFile } from '../../api/createExportFile';

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
    setFromDate,
    setToDate,
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

  const selectOptionsFileVersion =
    category === 'conservation'
      ? [{ label: '1.0', value: '1.0' }]
      : [
          { label: '1.0', value: '1.0' },
          { label: '1.1', value: '1.1' },
          { label: '1.2', value: '1.2' },
          { label: '1.3', value: '1.3' }
        ];

  //TODO add API
  const createExportReceipt = createExportFile();
  const createExportConservation = createExportFile();

  const handleExportClick = () => {
    if (!formData.fileVersion || !fromDate || !toDate) return;

    const formattedFrom = new Date(fromDate).toISOString().split('T')[0];
    const formattedTo = new Date(toDate).toISOString().split('T')[0];

    if (category === 'receipt') {
      const exportRequest: ExportFileRequestDTO = {
        organizationId,
        exportFileType: ExportFileTypeEnum.PAID,
        fileVersion: formData.fileVersion,
        filterFields: {
          paymentDate: {
            from: formattedFrom,
            to: formattedTo
          },
          ...(formData.dueType && { debtPositionTypeCode: formData.dueType })
        }
      };

      createExportReceipt.mutate(
        { data: exportRequest },
        {
          onSuccess: () => {
            navigate(
              generatePath(PageRoutes.RESPONSES_THANKYOU, {
                category: 'telematic-receipt-export'
              })
            );
          },
          onError: (error) => {
            console.error('Errore export receipt:', error);
          }
        }
      );
    } else if (category === 'conservation') {
      const exportRequest: ExportFileRequestDTO = {
        organizationId,
        exportFileType: ExportFileTypeEnum.PAYMENTS_REPORTING,
        fileVersion: formData.fileVersion,
        filterFields: {
          paymentDate: {
            from: formattedFrom,
            to: formattedTo
          }
        }
      };

      createExportConservation.mutate(
        { data: exportRequest },
        {
          onSuccess: () => {
            navigate(
              generatePath(PageRoutes.RESPONSES_THANKYOU, {
                category: 'conservation'
              })
            );
          },
          onError: (error) => {
            console.error('Errore export conservation:', error);
          }
        }
      );
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
                  onChange: setFromDate,
                  errorMessage: t('dates.validations.from')
                }}
                to={{
                  value: toDate,
                  onChange: setToDate,
                  errorMessage: t('dates.validations.to')
                }}
                onFromErrorChange={setFromError}
                onToErrorChange={setToError}
              />
            )
          },
          {
            direction: 'column',
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
          ...(category !== 'conservation'
            ? [
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
            onClick={() =>
              navigate(PageRoutes.TELEMATIC_RECEIPT_EXPORT_OVERVIEW)
            }
          >
            {t('commons.exit')}
          </Button>
        </Grid>
        <Grid item>
          <Button
            data-testid="success-button"
            disabled={isButtonDisabled || !formData.fileVersion}
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
