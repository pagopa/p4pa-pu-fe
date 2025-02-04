import { Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import FileUploader from '../FileUploader/FileUploader';
import { useTranslation } from 'react-i18next';
import { AltRoute, ArrowBack } from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageRoutes } from '../../routes/routes';
import TitleComponent from '../TitleComponent/TitleComponent';

interface ImportFlowDetail {
  title: string,
  fileExtensionsAllowed: string[],
  backRoute: string,
  successRoute: string,
  requiredFieldDescription?: string,
  flowTypes?: string[]
}

type ImportFlowDetails = Record<string, ImportFlowDetail>


const importFlowConfig: ImportFlowDetails = {
  'telematic-receipt': {
    title: 'commons.routes.TELEMATIC_RECEIPT_IMPORT_FLOW',
    fileExtensionsAllowed: ['zip'],
    backRoute: PageRoutes.TELEMATIC_RECEIPT_IMPORT_OVERVIEW,
    successRoute: PageRoutes.TELEMATIC_RECEIPT_IMPORT_FLOW_THANK_YOU_PAGE
  },
  'reporting': {
    title: 'commons.routes.REPORTING_IMPORT_FLOW',
    fileExtensionsAllowed: ['zip'],
    backRoute: PageRoutes.REPORTING_IMPORT_OVERVIEW,
    successRoute: PageRoutes.REPORTING_IMPORT_FLOW_THANK_YOU_PAGE
  },
  'treasury': {
    title: 'commons.routes.TREASURY_IMPORT_FLOW',
    fileExtensionsAllowed: ['zip'],
    backRoute: PageRoutes.TREASURY,
    successRoute: PageRoutes.REPORTING_IMPORT_FLOW_THANK_YOU_PAGE,
    requiredFieldDescription: 'commons.requiredFieldDescription',
    flowTypes: ['Giornale di Cassa XLS', 'Giornale di Cassa CSV', 'Giornale di Cassa OPI', 'Estrato conto poste']
  }
};

const ImportFlow = () => {

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { category } = useParams<{category: string}>();

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [flowType, setFlowType] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const config = importFlowConfig[category as keyof typeof importFlowConfig];

  const handleDisabledButton = () => {
    const defaultCondition = uploading || !file;
    return config?.flowTypes ? (!flowType || defaultCondition) : defaultCondition;
  };
  
  return (
    <>
      <Grid container direction="column" alignItems="center" marginTop={2}>
        <Grid container direction="column" alignItems="left" marginTop={2} ml={1} mb={4}>
          <TitleComponent 
            title={t(config.title)}
            description={t('commons.flowImport.description')}
          />
          <Box bgcolor={theme.palette.common.white} borderRadius={0.5} p={3} gap={3}>
            <Grid item lg={12} mb={2}>
              <Grid item lg={12} mb={2}>
                <Typography variant='h6' gutterBottom>{t('commons.flowImport.boxTitle')}</Typography>
                <Typography variant='caption' gutterBottom>{t('commons.flowImport.boxDescription')}</Typography>
              </Grid>
              <Button variant='naked' size='small'>{t('commons.flowImport.manualLink')}</Button>
            </Grid>
            {config?.requiredFieldDescription &&          
                <Typography variant="caption" mb={3} display={'block'} sx={{ color: theme.palette.error.dark }}>
                  {t(config.requiredFieldDescription)}
                </Typography>
            }
            <Box borderRadius={1} border={1} p={3} gap={2} borderColor={theme.palette.divider}>
              <FileUploader 
                uploading={uploading} 
                setUploading={setUploading} 
                progress={progress} 
                setProgress={setProgress} 
                file={file} setFile={setFile} 
                description={t('FileUploaderFlowImport.description')} 
                requiredFileText={t('FileUploaderFlowImport.requiredFileText')} 
                fileExtensionsAllowed={config.fileExtensionsAllowed}
              />
            </Box>
            {config?.flowTypes && 
            <Box borderRadius={1} border={1} p={3} gap={2} mt={3} borderColor={theme.palette.divider}>
              <Grid container direction={'row'} mb={3}>
                <AltRoute sx={{ transform: 'rotate(90deg)' }}/>
                <Typography fontWeight={600} ml={1}>
                  {t('commons.flowType')}
                </Typography>
              </Grid>
              <FormControl role='select-flowType' required fullWidth size="small">
                <InputLabel id='select-label'>{t('commons.flowType')}</InputLabel>
                <Select
                  value={flowType}
                  labelId='select-label'
                  label={t('commons.flowType')}
                  onChange={(event) => setFlowType(event.target.value)}
                >
                  {config.flowTypes.map((option, i) => (
                    <MenuItem key={i} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            }
          </Box>
        </Grid>
      </Grid>
      <Grid container direction={'row'} justifyContent={'space-between'} ml={1}>
        <Grid item>
          <Button
            size="large"
            variant="outlined"
            fullWidth
            startIcon={<ArrowBack />} 
            onClick={() => navigate(config.backRoute) }
          >
            {t('commons.exit')}
          </Button>
        </Grid>
        <Grid item>
          <Button
            data-testid="success-button"
            size="large"
            variant="contained"
            fullWidth
            disabled = {handleDisabledButton()}
            onClick={() => navigate(config.successRoute) }
          >
            {t('commons.flowImport.uploadButton')}
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default ImportFlow;
