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
  flagNotifyIo?: boolean;
  serviceId?: string;
  ioTemplateSubject?: string;
  ioTemplateMessage?: string;
};

export type Step4Props = {
  setData: (data: Step4Data) => void;
  onNext: () => void;
  onBack: () => void;
};

const validationSchema = (t: TFunction) =>
  z
    .object({
      flagNotifyIo: z.boolean().optional().default(false),
      serviceId: z.string().optional(),
      ioTemplateSubject: z.string().optional(),
      ioTemplateMessage: z.string().optional()
    })
    .refine((data) => !data.flagNotifyIo || data.serviceId, {
      message: t('debtTypeOrgCreate.notifications.serviceApiKey.required'),
      path: ['serviceId']
    })
    .refine((data) => !data.flagNotifyIo || data.ioTemplateSubject, {
      message: t('debtTypeOrgCreate.notifications.messageSubject.required'),
      path: ['ioTemplateSubject']
    })
    .refine((data) => !data.flagNotifyIo || data.ioTemplateMessage, {
      message: t('debtTypeOrgCreate.notifications.messageBody.required'),
      path: ['ioTemplateMessage']
    });

export const Step4Notifications = ({ setData, onNext, onBack }: Step4Props) => {
  const { t } = useTranslation();
  const schema = validationSchema(t);
  const [open, setOpen] = useState(false);
  const form = useForm<Step4Data>({
    resolver: zodResolver(schema),
    defaultValues: {
      flagNotifyIo: false,
      serviceId: '',
      ioTemplateSubject: '',
      ioTemplateMessage: ''
    },
    mode: 'onTouched'
  });
  const { control, handleSubmit, watch } = form;
  const flagNotifyIo = watch('flagNotifyIo');
  const ioTemplateSubject = watch('ioTemplateSubject');
  const ioTemplateMessage = watch('ioTemplateMessage');

  const onSubmit = async (values: Step4Data) => {
    setData(values);
    onNext();
  };

  return (
    <form aria-label="form">
      <WizardStepWrapper
        title={t('debtTypeOrgCreate.notifications.title')}
        subtitle={t('debtTypeOrgCreate.notifications.subtitle')}
        alertMessage={t('debtTypeOrgCreate.notifications.alertMessage')}
      >
        <FormComponent.ControlledSwitch
          label={t('debtTypeOrgCreate.notifications.enableNotifications')}
          name="flagNotifyIo"
          control={control}
        />
        {flagNotifyIo && (
          <SectionBox
            title={t('debtTypeOrgCreate.notifications.section.message')}
            adornment={<MessageIcon />}
          >
            <Stack gap={3}>
              <Stack gap={0.5}>
                <FormComponent.ControlledTextField
                  name="serviceId"
                  control={control}
                  label={t(
                    'debtTypeOrgCreate.notifications.serviceApiKey.label'
                  )}
                  required
                />
                <Typography variant="caption" ml={2}>
                  {t('debtTypeOrgCreate.notifications.serviceApiKey.caption')}
                </Typography>
              </Stack>
              <Stack gap={0.5}>
                <FormComponent.ControlledTextField
                  name="ioTemplateSubject"
                  control={control}
                  label={t(
                    'debtTypeOrgCreate.notifications.messageSubject.label'
                  )}
                  required
                />
                <Typography variant="caption" component="span" ml={2}>
                  <Trans
                    i18nKey="debtTypeOrgCreate.notifications.messageSubject.caption"
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
                  name="ioTemplateMessage"
                  control={control}
                  label={t('debtTypeOrgCreate.notifications.messageBody.label')}
                  multiline
                  rows={4}
                  required
                />
                <Typography variant="caption" component="span" ml={2}>
                  <Trans
                    i18nKey="debtTypeOrgCreate.notifications.messageBody.caption"
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
                disabled={!ioTemplateSubject || !ioTemplateMessage}
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
        title={ioTemplateSubject || ''}
        message={ioTemplateMessage || ''}
        open={open}
        onClose={() => setOpen(false)}
      />
    </form>
  );
};
