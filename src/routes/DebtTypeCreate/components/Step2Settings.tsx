import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PreviewIcon from '@mui/icons-material/Preview';
import { z } from 'zod';
import { Trans, useTranslation } from 'react-i18next';
import {
  Box,
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
import { DebtPositionTypeRequestBody } from '../../../../generated/data-contracts';

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
};

export const Step2Settings = ({ onBack, setData, onNext }: Step2Props) => {
  const { t } = useTranslation();

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
            {options.map((optionKey) => (
              <Controller
                key={optionKey}
                name={optionKey}
                control={control}
                defaultValue={false}
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
            ))}
          </FormGroup>
        </SectionBox>

        <SectionBox
          title={t('debtTypeCreate.settings.template.title')}
          subtitle={t('debtTypeCreate.settings.template.helper')}
          adornment={<MessageIcon />}
        >
          <Stack direction="row" gap={2} alignItems="center" width="100%">
            <Stack>
              <Controller
                name="flagNotifyIo"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={!!field.value} />}
                    label={t('debtTypeCreate.settings.template.checkbox')}
                  />
                )}
              />

              <Controller
                name="ioTemplateSubject"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <FormComponent.TextField
                    {...field}
                    ref={null}
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
                render={({ field }) => (
                  <TextField
                    required={flagNotifyIo}
                    label={t('debtTypeCreate.settings.message.label')}
                    InputLabelProps={{ shrink: true }}
                    error={flagNotifyIo && !!errors.ioTemplateMessage}
                    helperText={
                      flagNotifyIo && errors.ioTemplateMessage?.message
                    }
                    defaultValue=""
                    fullWidth
                    multiline
                    rows={7}
                    sx={{ my: 2 }}
                    {...field}
                  />
                )}
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
            <Stack
              sx={{ whiteSpace: 'nowrap' }}
              direction="row"
              gap={1}
              color="primary.main"
            >
              <PreviewIcon />
              <Link>{t('debtTypeCreate.settings.preview')}</Link>
            </Stack>
          </Stack>
        </SectionBox>
      </WizardStepWrapper>
      <WizardStepButtons
        onBack={onBack}
        nextLabel={t('commons.create')}
        onNext={handleSubmit(onSubmit)}
      />
    </form>
  );
};
