import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography
} from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import FileUploader from '../FileUploader/FileUploader';
import { useTranslation } from 'react-i18next';
import { AltRoute, ArrowBack } from '@mui/icons-material';
import { useState } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import TitleComponent from '../TitleComponent/TitleComponent';
import { importFlowConfig } from '../../models/ImportDetails';
import { PageRoutes } from '../../App';
import { uploadIngestionFlowFile } from '../../api/ingestionFlowFiles';
import { useStore } from '../../store/GlobalStore';
import { IngestionFlowFileType } from '../../../generated/fileshare/fileshareClient';

const ImportFlow = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { category } = useParams<{ category: string }>();

  const {
    state: { organizationId }
  } = useStore();

  const config = importFlowConfig[category as keyof typeof importFlowConfig];
  const thankyouPage = generatePath(PageRoutes.RESPONSES_THANKYOU, {category: config.successRoute});

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [flowType, setFlowType] = useState<IngestionFlowFileType>(config.flowTypes[0]);
  const [file, setFile] = useState<File | null>(null);

  const ingestionFlowFile = uploadIngestionFlowFile({
    organizationId,
    ingestionFlowFileType: flowType
  });

  const handleFileUpload = () => {
    if (file) {
      ingestionFlowFile.mutate(file, {
        onSuccess: () => navigate(thankyouPage)
      });
    }
  };

  const buttonDisabled = uploading || !file;

  const fileUploaderDescriptionKey = `FileUploaderFlowImport.${category}.description`;

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
                <Typography variant="h6" gutterBottom>
                  {t('commons.flowImport.boxTitle')}
                </Typography>
                <Typography variant="caption" gutterBottom>
                  {t('commons.flowImport.boxDescription')}
                </Typography>
              </Grid>
              <Button variant="naked" size="small">
                {t('commons.flowImport.manualLink')}
              </Button>
            </Grid>
            {config?.requiredFieldDescription && (
              <Typography
                variant="caption"
                mb={3}
                display={'block'}
                sx={{ color: theme.palette.error.dark }}>
                {t(config.requiredFieldDescription)}
              </Typography>
            )}
            <Box borderRadius={1} border={1} p={3} gap={2} borderColor={theme.palette.divider}>
              <FileUploader
                uploading={uploading}
                setUploading={setUploading}
                progress={progress}
                setProgress={setProgress}
                file={file}
                setFile={setFile}
                description={t(fileUploaderDescriptionKey)}
                requiredFileText={t('FileUploaderFlowImport.requiredFileText')}
                fileExtensionsAllowed={config.fileExtensionsAllowed}
              />
            </Box>
            {config.flowTypes.length > 1 && (
              <Box
                borderRadius={1}
                border={1}
                p={3}
                gap={2}
                mt={3}
                borderColor={theme.palette.divider}>
                <Grid container direction={'row'} mb={3}>
                  <AltRoute sx={{ transform: 'rotate(90deg)' }} />
                  <Typography fontWeight={600} ml={1}>
                    {t('commons.flowType')}
                  </Typography>
                </Grid>
                <FormControl role="select-flowType" required fullWidth size="small">
                  <InputLabel id="select-label">{t('commons.flowType')}</InputLabel>
                  <Select
                    value={flowType}
                    labelId="select-label"
                    label={t('commons.flowType')}
                    onChange={(event) => {
                      setFlowType(event.target.value as IngestionFlowFileType);
                    }}>
                    {config.flowTypes.map((option, i) => (
                      <MenuItem key={i} value={option}>
                        {t(`commons.flowTypes.${option}`)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
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
            onClick={() => navigate(PageRoutes[config.backRoute])}>
            {t('commons.exit')}
          </Button>
        </Grid>
        <Grid item>
          <Button
            data-testid="success-button"
            size="large"
            variant="contained"
            fullWidth
            disabled={buttonDisabled}
            onClick={handleFileUpload}>
            {t('commons.flowImport.uploadButton')}
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default ImportFlow;
