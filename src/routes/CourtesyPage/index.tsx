import { useTranslation } from 'react-i18next';
import { AbacusIcon } from '../../assets/icons/abacus';
import ResponsePage, {
  ButtonConfig
} from '../../components/ResponsePage/ResponsePage';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import utils from '../../utils';
import { operatorComputedRole } from '../../store/OperatorRoleStore';
import { ExtendedOperatoRole } from '../../models/OperatorRole';
import { WaitingIcon } from '../../assets/icons/waiting';
import { generatePath, useNavigate } from 'react-router';
import { PageRoutes } from '..';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';

const OperatorIcon = ({
  operatorRole
}: {
  operatorRole: ExtendedOperatoRole;
}) =>
  operatorRole !== ExtendedOperatoRole.ROLE_OPER ? (
    <AbacusIcon />
  ) : (
    <WaitingIcon />
  );

export const CourtesyPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state } = useStore();
  const { spacing } = useTheme();
  const operatorRole = operatorComputedRole.value;
  const ctaButton: Array<ButtonConfig> = [];

  const toHome = () => {
    window.location.replace(utils.config.loginUrl);
  };

  const toEdit = () => {
    navigate(
      generatePath(PageRoutes.ORGANIZATIONS_EDIT, {
        organizationId: state[STATE.ORGANIZATION_ID]
      })
    );
  };

  if (operatorRole === ExtendedOperatoRole.ROLE_SUPERADMIN) {
    ctaButton.push({
      variant: 'contained',
      size: 'large',
      buttonLabel: t('commons.configure'),
      actionID: 'edit',
      onButtonClick: toEdit
    });
  } else {
    ctaButton.push({
      variant: 'contained',
      size: 'large',
      buttonLabel: t('commons.backToHome'),
      actionID: 'back',
      onButtonClick: toHome
    });
  }

  return (
    <Stack maxWidth={spacing(45)} margin="auto">
      <ResponsePage
        icon={<OperatorIcon operatorRole={operatorRole} />}
        title={t(`DraftCourtesyPage.${operatorRole}.title`)}
        description={t(`DraftCourtesyPage.${operatorRole}.description`)}
        buttonConfig={[...ctaButton]}
      />
    </Stack>
  );
};
