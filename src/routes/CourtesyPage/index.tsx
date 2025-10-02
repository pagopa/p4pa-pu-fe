import { useTranslation } from 'react-i18next';
import { AbacusIcon } from '../../assets/icons/abacus';
import ResponsePage from '../../components/ResponsePage/ResponsePage';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import utils from '../../utils';

export const CourtesyPage = () => {
  const { t } = useTranslation();
  const { spacing } = useTheme();

  const toLogin = () => {
    window.location.replace(utils.config.loginUrl);
  };

  return (
    <Stack maxWidth={spacing(45)} margin="auto">
      <ResponsePage
        icon={<AbacusIcon />}
        title={t('DraftCourtesyPage.superadmin.title')}
        description={t('DraftCourtesyPage.superadmin.description')}
        buttonConfig={[
          {
            variant: 'outlined',
            size: 'large',
            buttonLabel: t('commons.close'),
            actionID: 'back',
            onButtonClick: toLogin
          }
        ]}
      />
    </Stack>
  );
};
