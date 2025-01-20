import { Box, Button, Grid, Typography } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import UploadFileField from '../FileUploader/FileUploader';
import { useTranslation } from 'react-i18next';
import { ArrowBack } from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageRoutes } from '../../routes/routes';

const TelematicReceiptFlowImport = () => {

  const { t } = useTranslation();
  const navigate = useNavigate();

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);

  return (
    <>
      <Grid container direction="column" alignItems="center" marginTop={2}>
        <Grid container direction="column" alignItems="left" marginTop={2} ml={1} mb={4}>
          <Grid item marginBottom={1}>
            <Typography align='left' variant="h4" gutterBottom>{t('telematicReceiptFlowImport.title')}</Typography>
          </Grid>
          <Grid item>
            <Typography align='left' variant="body1" marginBottom={3}>
              {t('telematicReceiptFlowImport.description')}
            </Typography>
          </Grid>
          <Box bgcolor={theme.palette.common.white} borderRadius={0.5} p={3} gap={3}>
            <Grid item lg={12} mb={3}>
              <Grid item lg={12} mb={2}>
                <Typography variant='h6' gutterBottom>{t('telematicReceiptFlowImport.boxTitle')}</Typography>
                <Typography variant='caption' gutterBottom>{t('telematicReceiptFlowImport.boxDescription')}</Typography>
              </Grid>
              <Button variant='naked' size='small'>{t('telematicReceiptFlowImport.manualLink')}</Button>
            </Grid>
            <Box borderRadius={1} border={1} p={3} gap={2} borderColor={theme.palette.divider}>
              <Grid container direction={'row'}>
              </Grid>
              <UploadFileField 
                uploading={uploading} 
                setUploading={setUploading} 
                progress={progress} 
                setProgress={setProgress} 
                file={file} setFile={setFile} 
                description={t('FileUploaderFlowImport.description')} 
                requiredFieldText={t('FileUploaderFlowImport.requiredFieldText')} 
                fileExtensionAllowed={'.zip'}
              />
            </Box>
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
            onClick={() => navigate(PageRoutes.TELEMATIC_RECEIPT_EXPORT_OVERVIEW) }
          >
            {t('commons.exit')}
          </Button>
        </Grid>
        <Grid item>
          <Button
            size="large"
            variant="contained"
            fullWidth
            disabled = {(uploading || !file) ?? true}
            onClick={() => navigate(PageRoutes.TELEMATIC_RECEIPT_IMPORT_FLOW_THANK_YOU_PAGE) }
          >
            {t('telematicReceiptFlowImport.uploadButton')}
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default TelematicReceiptFlowImport;
