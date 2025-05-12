import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PreviewIcon from '@mui/icons-material/Preview';
import { Trans, useTranslation } from 'react-i18next';
import MessageIcon from '@mui/icons-material/Message';
import Typography from '@mui/material/Typography';
import { TFunction } from 'i18next';
import { z } from 'zod';
import SectionBox from '../../../components/Wizard/SectionBox';
import WizardStepWrapper from '../../../components/Wizard/WizardStepWrapper';
import { FormComponent } from '../../../components/FormComponent';
import WizardStepButtons from '../../../components/Wizard/WizardStepButtons';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useState } from 'react';
import { MarkdownPreview } from '../../DebtTypeCreate/components/MarkdownPreview';
import Link from '@mui/material/Link';

export type Step4Data = {
  enableNotifications?: boolean;
  serviceApiKey?: string;
  messageSubject?: string;
  messageBody?: string;
};

export type Step4Props = {
  setData: (data: Step4Data) => void;
  onNext: () => void;
  onBack: () => void;
};

const validationSchema = (t: TFunction) =>
  z
    .object({
      enableNotifications: z.boolean().optional().default(false),
      serviceApiKey: z.string().optional(),
      messageSubject: z.string().optional(),
      messageBody: z.string().optional()
    })
    .refine((data) => !data.enableNotifications || data.serviceApiKey, {
      message: t('debtTypeCreateEC.notifications.serviceApiKey.required'),
      path: ['serviceApiKey']
    })
    .refine((data) => !data.enableNotifications || data.messageSubject, {
      message: t('debtTypeCreateEC.notifications.messageSubject.required'),
      path: ['messageSubject']
    })
    .refine((data) => !data.enableNotifications || data.messageBody, {
      message: t('debtTypeCreateEC.notifications.messageBody.required'),
      path: ['messageBody']
    });

export const Step4Notifications = ({ setData, onNext, onBack }: Step4Props) => {
  const { t } = useTranslation();
  const schema = validationSchema(t);
  const [open, setOpen] = useState(false);
  const form = useForm<Step4Data>({
    resolver: zodResolver(schema),
    defaultValues: {
      enableNotifications: false,
      serviceApiKey: '',
      messageSubject: '',
      messageBody: ''
    },
    mode: 'onTouched'
  });
  const { control, handleSubmit, watch } = form;
  const enableNotifications = watch('enableNotifications');
  const messageSubject = watch('messageSubject');
  const messageBody = watch('messageBody');

  const onSubmit = async (values: Step4Data) => {
    setData(values);
    onNext();
  };

  return (
    <form aria-label="form">
      <WizardStepWrapper
        title={t('debtTypeCreateEC.notifications.title')}
        subtitle={t('debtTypeCreateEC.notifications.subtitle')}
        alertMessage={t('debtTypeCreateEC.notifications.alertMessage')}
      >
        <FormComponent.ControlledSwitch
          label={t('debtTypeCreateEC.notifications.enableNotifications')}
          name="enableNotifications"
          control={control}
        />
        {enableNotifications && (
          <SectionBox
            title={t('debtTypeCreateEC.notifications.section.message')}
            adornment={<MessageIcon />}
          >
            <Stack gap={3}>
              <Stack gap={0.5}>
                <FormComponent.ControlledTextField
                  name="serviceApiKey"
                  control={control}
                  label={t(
                    'debtTypeCreateEC.notifications.serviceApiKey.label'
                  )}
                  required
                />
                <Typography variant="caption" ml={2}>
                  {t('debtTypeCreateEC.notifications.serviceApiKey.caption')}
                </Typography>
              </Stack>
              <Stack gap={0.5}>
                <FormComponent.ControlledTextField
                  name="messageSubject"
                  control={control}
                  label={t(
                    'debtTypeCreateEC.notifications.messageSubject.label'
                  )}
                  required
                />
                <Typography variant="caption" component="span" ml={2}>
                  <Trans
                    i18nKey="debtTypeCreateEC.notifications.messageSubject.caption"
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
              </Stack>
              <Stack gap={0.5}>
                <FormComponent.ControlledTextField
                  name="messageBody"
                  control={control}
                  label={t('debtTypeCreateEC.notifications.messageBody.label')}
                  multiline
                  rows={4}
                  required
                />
                <Typography variant="caption" component="span" ml={2}>
                  <Trans
                    i18nKey="debtTypeCreateEC.notifications.messageBody.caption"
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
              </Stack>
            </Stack>
            <Stack
              sx={{ whiteSpace: 'nowrap' }}
              direction="row"
              color="primary.main"
            >
              <Button
                variant="text"
                onClick={() => setOpen(true)}
                disabled={!messageSubject || !messageBody}
                sx={{ px: 0 }}
              >
                <PreviewIcon sx={{ mr: 1 }} />
                {t('debtTypeCreate.settings.preview')}
              </Button>
            </Stack>
          </SectionBox>
        )}
      </WizardStepWrapper>
      <WizardStepButtons onBack={onBack} onNext={handleSubmit(onSubmit)} />
      <MarkdownPreview
        title={messageSubject || ''}
        message={messageBody || ''}
        open={open}
        onClose={() => setOpen(false)}
      />
    </form>
  );
};
