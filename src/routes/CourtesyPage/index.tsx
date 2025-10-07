import { useTranslation } from 'react-i18next';
import { AbacusIcon } from '../../assets/icons/abacus';
import ResponsePage from '../../components/ResponsePage/ResponsePage';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import utils from '../../utils';
import { operatorComputedRole } from '../../store/OperatorRoleStore';
import { ExtendedOperatoRole } from '../../models/OperatorRole';
import { WaitingIcon } from '../../assets/icons/waiting';

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
  const { spacing } = useTheme();
  const operatorRole = operatorComputedRole.value;

  const toHome = () => {
    window.location.replace(utils.config.loginUrl);
  };

  return (
    <Stack maxWidth={spacing(45)} margin="auto">
      <ResponsePage
        icon={<OperatorIcon operatorRole={operatorRole} />}
        title={t(`DraftCourtesyPage.${operatorRole}.title`)}
        description={t(`DraftCourtesyPage.${operatorRole}.description`)}
        buttonConfig={[
          {
            variant: 'contained',
            size: 'large',
            buttonLabel: t('commons.backToHome'),
            actionID: 'back',
            onButtonClick: toHome
          }
        ]}
      />
    </Stack>
  );
};
