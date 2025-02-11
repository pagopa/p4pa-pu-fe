import { ArrowBack, CalendarToday, Dashboard, InsertDriveFile } from '@mui/icons-material';
import { Button, Grid, GridDirection } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageRoutes } from '../../routes/routes';
import TitleComponent from '../TitleComponent/TitleComponent';
import ExportFlowContainer from '../ExportFlowContainer/ExportFlowContainer';
import { useState } from 'react';

export const ExportFlowPage = () => {

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { category } = useParams<{category: string}>();

  const [formData, setFormData] = useState({
    from: '',
    to: '',
    fileVersion: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const isButtonEnabled = formData.from && formData.to && formData.fileVersion;

  const selectOptionsFileVersion = [
    { label: 'version1', value: 'version1' },
    { label: 'version2', value: 'version2' },
    { label: 'version3', value: 'version3' }
  ];

  const selectOptionsDueType = [
    { label: 'test1', value: 'test1' },
    { label: 'test12', value: 'test12' },
    { label: 'test123', value: 'test123' }
  ];

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
              icon: <InsertDriveFile sx={{marginRight: 1}}/>,
              label: t('commons.paymentDate')
            },
            inputFields: [
              {
                required: true,
                label: t('commons.from'),
                icon: <CalendarToday />,
                gridWidth: 6,
                fieldKey: 'from'
              },
              {
                required: true,
                label: t('commons.to'),
                icon: <CalendarToday />,
                gridWidth: 6,
                fieldKey: 'to'
              }
            ]
          },
          {
            direction: 'column',
            title: {
              icon: <InsertDriveFile sx={{marginRight: 1}}/>,
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
                selectOptions: selectOptionsDueType
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
            size="large"
            variant="outlined"
            fullWidth
            startIcon={<ArrowBack />} 
            onClick={() => navigate(PageRoutes.TELEMATIC_RECEIPT_EXPORT_OVERVIEW) }
          >
            {t('commons.exit')}
          </Button>
        </Grid>
        <Grid item>
          <Button
            disabled={!isButtonEnabled}
            size="large"
            variant="contained"
            fullWidth
            onClick={() => navigate(PageRoutes.TELEMATIC_RECEIPT_EXPORT_FLOW_THANK_YOU_PAGE) }
          >
            {t('exportFlow.buttonConfirmReservation')}
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default ExportFlowPage;
