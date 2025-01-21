import {
  Box,
  Button,
  Typography,
  IconButton,
  LinearProgress,
  Grid,
  Alert,
} from '@mui/material';
import { CloudUpload, AttachFile, Close, InsertDriveFile } from '@mui/icons-material';
import { theme } from '@pagopa/mui-italia';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

type FileUploaderProps = {
  uploading: boolean;
  setUploading: React.Dispatch<React.SetStateAction<boolean>>;
  progress: number;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  description: string;
  requiredFieldText: string;
  fileExtensionsAllowed: string[];
};

const FileUploader = ({
  uploading,
  setUploading,
  progress,
  setProgress,
  file,
  setFile,
  description,
  requiredFieldText,
  fileExtensionsAllowed,
}: FileUploaderProps) => {
  const { t } = useTranslation();

  const [error, setError] = useState<string | null>(null);

  const isExtensionAllowed = (fileName: string) => {
    const fileExtension = fileName.split('.').pop();
    return fileExtensionsAllowed.some((ext) => ext === fileExtension);
  };  

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!isExtensionAllowed(selectedFile.name)) {
        setError(t('commons.fileNotValid'));
        return;
      }
      setError(null);
      uploadFile(selectedFile);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const selectedFile = event.dataTransfer.files[0];
    if (selectedFile) {
      if (!isExtensionAllowed(selectedFile.name)) {
        setError(t('commons.fileNotValid'));
        return;
      }
      setError(null);
      uploadFile(selectedFile);
    }
  };

  const uploadFile = (selectedFile: File) => {
    setUploading(true);
    setProgress(0);

    const reader = new FileReader();

    reader.onloadstart = () => {
      setProgress(0);
    };

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentLoaded = Math.round((event.loaded / event.total) * 100);
        setProgress(percentLoaded);
      }
    };

    reader.onloadend = () => {
      setUploading(false);
      setProgress(100);
      setFile(selectedFile);
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleRemoveFile = () => {
    setFile(null);
    setProgress(0);
    setError(null);
  };

  const formatFileSize = (size: number) => {
    if (size >= 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    } else if (size >= 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    } else {
      return `${size} Bytes`;
    }
  };

  return (
    <>
      <Grid container direction={'row'} mb={3}>
        <InsertDriveFile />
        <Typography fontWeight={600} ml={1}>
          {t('commons.file')}
        </Typography>
      </Grid>

      {error && (
        <Alert
          action={
            <IconButton
              size="small"
              onClick={() => setError(null)}
              sx={{ color: theme.palette.primary.dark }}
            >
              <Close fontSize="small" />
            </IconButton>
          }
          severity="error" 
          variant="standard" 
          sx={{ mb: 2, fontWeight: 600 }}>
          {error}
        </Alert>
      )}

      {!file && !uploading && (
        <Box
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          sx={{
            border: '2px dashed #90caf9',
            borderRadius: 2,
            p: 3,
            bgcolor: '#e3f2fd',
            textAlign: 'center',
          }}
        >
          <CloudUpload sx={{ fontSize: 40, color: '#1976d2' }} />
          <Typography variant="body1" mt={2} mb={3}>
            {description}
          </Typography>
          <Button
            variant="contained"
            component="label"
            sx={{
              padding: 1.5,
            }}
          >
            {t('commons.uploadButtonText')}
            <input
              type="file"
              hidden
              onChange={handleFileUpload}
              accept={fileExtensionsAllowed.map((ext) => `.${ext}`).join(',')}
            />
          </Button>
        </Box>
      )}

      {uploading && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body1" mb={2}>
            {t('commons.uploadInProgress')}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 5,
              bgcolor: '#bbdefb',
              '& .MuiLinearProgress-bar': {
                bgcolor: '#1976d2',
              },
            }}
          />
        </Box>
      )}

      {file && !uploading && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid #90caf9',
            borderRadius: 2,
            p: 2,
            mt: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AttachFile sx={{ color: '#1976d2', mr: 1 }} />
            <Typography variant="body1" sx={{ fontWeight: 400 }} color={'#0073E6'}>
              {file.name}
            </Typography>
            <Typography variant="body2" fontWeight={700} sx={{ marginLeft: 2 }}>
              {formatFileSize(file.size)}
            </Typography>
          </Box>
          <IconButton
            aria-label="Rimuovi file"
            onClick={handleRemoveFile}
            sx={{ color: theme.palette.primary.main }}
          >
            <Close />
          </IconButton>
        </Box>
      )}

      <Typography variant="body2" mt={2} color="textSecondary">
        {requiredFieldText}
      </Typography>
    </>
  );
};

export default FileUploader;
