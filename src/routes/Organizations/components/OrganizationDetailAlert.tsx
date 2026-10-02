import { AlertTitle, Button, Box, Typography } from '@mui/material';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import type { OrganizationDetail } from '../../../../generated/core/data-contracts';
import { MIAlert } from '@pagopa/mui-italia/components/MIAlert';

type MandatoryField = Extract<
  keyof OrganizationDetail,
  'iban' | 'orgLogo' | 'segregationCode'
>;

const MISSING_PLACEHOLDER = '-';

const MANDATORY_FIELD_LABEL_KEYS: Record<MandatoryField, string> = {
  iban: 'commons.iban',
  orgLogo: 'organizations.orgLogo',
  segregationCode: 'commons.segregationCode'
};

const MANDATORY_FIELDS = Object.keys(
  MANDATORY_FIELD_LABEL_KEYS
) as Array<MandatoryField>;

const isMissing = (value?: string) => {
  const trimmed = value?.trim();
  return !trimmed || trimmed === MISSING_PLACEHOLDER;
};

export type OrganizationDetailAlertProps = {
  organizationDetailData: OrganizationDetail;
  onEdit: () => void;
};

export const OrganizationDetailAlert = ({
  organizationDetailData,
  onEdit
}: OrganizationDetailAlertProps) => {
  const { t } = useTranslation();
  const titleId = useId();
  const bodyId = useId();

  const missingFields = MANDATORY_FIELDS.filter((field) =>
    isMissing(organizationDetailData[field])
  ).map((field) => t(MANDATORY_FIELD_LABEL_KEYS[field]));

  if (missingFields.length === 0) {
    return null;
  }

  return (
    <MIAlert
      severity="warning"
      data-testid="org-empty-fields-error"
      aria-labelledby={titleId}
      aria-describedby={bodyId}
    >
      <Box color="Color/Status Warning/Warning 850">
        <AlertTitle color="inherit" id={titleId}>
          {t('organizations.alertTitle')}
        </AlertTitle>
        <Typography
          id={bodyId}
          color="inherit"
          variant="body2"
          component="p"
          mt={0.5}
        >
          {t('organizations.alertBody', {
            emptyFields: missingFields.join(', '),
            interpolation: { escapeValue: false }
          })}
        </Typography>
        <Button
          variant="naked"
          sx={{ color: 'inherit', mt: 2 }}
          onClick={onEdit}
          aria-describedby={bodyId}
        >
          {t('organizations.alertButton')}
        </Button>
      </Box>
    </MIAlert>
  );
};
