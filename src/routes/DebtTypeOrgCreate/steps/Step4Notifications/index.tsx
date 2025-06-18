import { useFormContext } from 'react-hook-form';
import PreviewIcon from '@mui/icons-material/Preview';
import { Trans, useTranslation } from 'react-i18next';
import MessageIcon from '@mui/icons-material/Message';
import Typography from '@mui/material/Typography';
import SectionBox from '../../../../components/Wizard/SectionBox';
import WizardStepWrapper from '../../../../components/Wizard/WizardStepWrapper';
import { FormComponent } from '../../../../components/FormComponent';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useState } from 'react';
import { MarkdownPreview } from '../../../DebtTypeCreate/components/MarkdownPreview';
import Link from '@mui/material/Link';
import { DebtTypeOrgForm } from '../../types';

export const Step4Notifications = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { control, watch } = useFormContext<DebtTypeOrgForm>();

  const flagNotifyIo = watch('flagNotifyIo');
  const ioTemplateSubject = watch('ioTemplateSubject');
  const ioTemplateMessage = watch('ioTemplateMessage');

  return (
    <>
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
                  data-testId="serviceId"
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
                  data-testId="ioTemplateSubject"
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
                  data-testId="ioTemplateMessage"
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
                data-testId="open-message-preview"
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
      <MarkdownPreview
        title={ioTemplateSubject || ''}
        message={ioTemplateMessage || ''}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
};
