import { useState } from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import FileUploader, { FileUploaderProps } from '../FileUploader/FileUploader';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

export type _ControlledFileUploaderProps<T extends FieldValues> = {
  name: Path<T>;
  description: string;
  fileExtensionsAllowed: Array<string>;
  control: Control<T>;
} & Omit<
  FileUploaderProps,
  | 'uploading'
  | 'setUploading'
  | 'progress'
  | 'setProgress'
  | 'file'
  | 'setFile'
  | 'requiredFileText'
>;

export const _ControlledFileUploader = <T extends FieldValues>({
  name,
  description,
  fileExtensionsAllowed,
  control,
  ...fileUploaderProps
}: _ControlledFileUploaderProps<T>) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <Stack>
          <FileUploader
            uploading={uploading}
            setUploading={setUploading}
            progress={progress}
            setProgress={setProgress}
            file={value}
            setFile={(file) => {
              onChange(file);
            }}
            description={description}
            fileExtensionsAllowed={fileExtensionsAllowed}
            {...fileUploaderProps}
          />
          <Typography variant="body2" color="error">
            {error?.message}
          </Typography>
        </Stack>
      )}
    />
  );
};
