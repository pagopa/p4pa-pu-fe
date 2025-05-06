import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PreviewIcon from '@mui/icons-material/Preview';
import { z } from 'zod';
import { Trans, useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Link,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import MessageIcon from '@mui/icons-material/Message';
import WizardStepWrapper from '../../../components/Wizard/WizardStepWrapper';
import SectionBox from '../../../components/Wizard/SectionBox';
import WizardStepButtons from '../../../components/Wizard/WizardStepButtons';
import { FormComponent } from '../../../components/FormComponent';
import {
  DebtPositionTypeDetailDTO,
  DebtPositionTypeRequestBody
} from '../../../../generated/data-contracts';
import { useState } from 'react';
import { MarkdownPreview } from './MarkdownPreview';

export type Step2Data = Partial<DebtPositionTypeRequestBody> &
  Pick<
    DebtPositionTypeRequestBody,
    | 'flagMandatoryDueDate'
    | 'flagAnonymousFiscalCode'
    | 'flagNotifyIo'
    | 'ioTemplateSubject'
    | 'ioTemplateMessage'
  >;

export type Step2Props = {
  setData: (data: Step2Data) => void;
  onNext: () => void;
  onBack?: () => void;
  editmode?: boolean;
  prefilledData?: DebtPositionTypeDetailDTO;
};

export const Step2Settings = ({
  onBack,
  setData,
  onNext,
  editmode = false,
  prefilledData = undefined
}: Step2Props) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const schema = z
    .object({
      flagMandatoryDueDate: z.boolean().optional(),
      flagAnonymousFiscalCode: z.boolean().optional(),
      flagNotifyIo: z.boolean().optional(),
      ioTemplateSubject: z.string().optional().default(''),
      ioTemplateMessage: z.string().optional().default('')
    })
    .refine((data) => !data.flagNotifyIo || data.ioTemplateSubject, {
      message: t('debtTypeCreate.settings.subject.required'),
      path: ['ioTemplateSubject'] // Targets the ioTemplateSubject property
    })
    .refine((data) => !data.flagNotifyIo || data.ioTemplateMessage, {
      message: t('debtTypeCreate.settings.message.required'),
      path: ['ioTemplateMessage']
    });

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<Step2Data>({
    resolver: zodResolver(schema),
    mode: 'onTouched'
  });

  const onSubmit = (values: Step2Data) => {
    setData(values);
    onNext();
  };

  const options: Array<keyof Step2Data> = [
    'flagMandatoryDueDate',
    'flagAnonymousFiscalCode'
  ];
  const flagNotifyIo = watch('flagNotifyIo');
  const ioTemplateMessage = watch('ioTemplateMessage');
  const ioTemplateSubject = watch('ioTemplateSubject');

  return (
    <form>
      <WizardStepWrapper
        title={t('debtTypeCreate.settings.title')}
        subtitle={t('debtTypeCreate.settings.subtitle')}
      >
        <SectionBox
          title={t('debtTypeCreate.settings.behaviour')}
          adornment={<TuneIcon />}
        >
          <FormGroup>
            {options.map((optionKey) => {
              const defaultValue: boolean | undefined =
                prefilledData &&
                (prefilledData[
                  optionKey as keyof DebtPositionTypeDetailDTO
                ] as boolean);

              return (
                <Controller
                  key={optionKey}
                  name={optionKey}
                  control={control}
                  defaultValue={(editmode && defaultValue) || false}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={!!field.value} />}
                      label={
                        <Box>
                          <Typography variant="body1">
                            {t(
                              `debtTypeCreate.settings.${optionKey}.description`
                            )}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {t(`debtTypeCreate.settings.${optionKey}.subtitle`)}
                          </Typography>
                        </Box>
                      }
                    />
                  )}
                />
              );
            })}
          </FormGroup>
        </SectionBox>

        <SectionBox
          title={t('debtTypeCreate.settings.template.title')}
          subtitle={t('debtTypeCreate.settings.template.helper')}
          adornment={<MessageIcon />}
        >
          <Stack direction="column" gap={2} alignItems="left" width="100%">
            <Stack>
              <Controller
                name="flagNotifyIo"
                control={control}
                defaultValue={editmode ? prefilledData?.flagNotifyIo : false}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={!!field.value} />}
                    label={t('debtTypeCreate.settings.template.checkbox')}
                  />
                )}
              />

              {flagNotifyIo && (
                <Stack>
                  <Controller
                    name="ioTemplateSubject"
                    control={control}
                    defaultValue={
                      editmode ? prefilledData?.ioTemplateSubject : ''
                    }
                    render={({ field }) => (
                      <FormComponent.TextField
                        {...field}
                        ref={null}
                        noAdornment
                        required={flagNotifyIo}
                        label={t('debtTypeCreate.settings.subject.label')}
                        placeholder={t(
                          'debtTypeCreate.settings.subject.placeholder'
                        )}
                        error={flagNotifyIo && !!errors.ioTemplateSubject}
                        helperText={
                          flagNotifyIo && errors.ioTemplateSubject?.message
                        }
                        fullWidth
                        sx={{ my: 2 }}
                      />
                    )}
                  />
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="span"
                  >
                    <Trans
                      i18nKey="debtTypeCreate.settings.subject.guide"
                      components={[
                        <Link
                          key="link"
                          href="#"
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="none"
                        />
                      ]}
                    />
                  </Typography>

                  <Controller
                    name="ioTemplateMessage"
                    control={control}
                    defaultValue={
                      editmode ? prefilledData?.ioTemplateMessage : ''
                    }
                    render={({ field }) => (
                      <TextField
                        required={flagNotifyIo}
                        label={t('debtTypeCreate.settings.message.label')}
                        InputLabelProps={{ shrink: true }}
                        error={flagNotifyIo && !!errors.ioTemplateMessage}
                        helperText={
                          flagNotifyIo && errors.ioTemplateMessage?.message
                        }
                        fullWidth
                        multiline
                        rows={7}
                        sx={{ my: 2 }}
                        {...field}
                      />
                    )}
                  />
                  <MarkdownPreview
                    title={ioTemplateSubject || ''}
                    message={ioTemplateMessage || ''}
                    open={open}
                    onClose={() => setOpen(false)}
                  />

                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="span"
                  >
                    <Trans
                      i18nKey="debtTypeCreate.settings.message.guide"
                      components={[
                        <Link
                          key="link"
                          href="#"
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="none"
                        />,
                        <Link
                          key="link"
                          href="#"
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="none"
                        />
                      ]}
                    />
                  </Typography>
                </Stack>
              )}
            </Stack>
            {flagNotifyIo && (
              <Stack
                sx={{ whiteSpace: 'nowrap' }}
                direction="row"
                color="primary.main"
              >
                <Button
                  variant="text"
                  onClick={() => setOpen(true)}
                  sx={{ px: 0 }}
                  disabled={!(ioTemplateMessage && ioTemplateSubject)}
                >
                  <PreviewIcon sx={{ mr: 1 }} />
                  {t('debtTypeCreate.settings.preview')}
                </Button>
              </Stack>
            )}
          </Stack>
        </SectionBox>
      </WizardStepWrapper>
      <WizardStepButtons
        onBack={onBack}
        nextLabel={editmode ? t('commons.edit') : t('commons.create')}
        onNext={handleSubmit(onSubmit)}
      />
    </form>
  );
};
