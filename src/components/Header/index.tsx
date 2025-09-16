import {
  HeaderAccount,
  HeaderProduct,
  JwtUser,
  ProductEntity,
  UserAction
} from '@pagopa/mui-italia';
import utils from '../../utils';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useNavigate } from 'react-router';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';
import { PartySwitchItem } from '@pagopa/mui-italia/dist/components/PartySwitch';
import { setOrganizationId } from '../../store/OrganizationIdStore';
import { setOperatorRole } from '../../store/OperatorRoleStore';
import { useTranslation } from 'react-i18next';
import { OperatorRole } from '../../../generated/apiClient';
import { PageRoutes } from '../../routes';
import config from '../../utils/config';

export type HeaderProps = {
  onAssistanceClick?: () => void;
  onDocumentationClick?: () => void;
};

export const Header = (props: HeaderProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    state: { userInfo, organizations },
    state
  } = useStore();
  const organizationId = Number(state[STATE.ORGANIZATION_ID]);

  const { onAssistanceClick = () => null } = props;
  const { onDocumentationClick = () => null } = props;

  const jwtUser: JwtUser | undefined = userInfo
    ? {
        id: userInfo.userId,
        name: userInfo.name,
        surname: userInfo.familyName
      }
    : undefined;

  const organizationsToMenuItems: Array<PartySwitchItem> =
    organizations?.map((org) => ({
      id: org.organizationId.toString(),
      logoUrl: org.orgLogo,
      name: org.orgName || t('commons.unknownOrganization'),
      productRole: t(`commons.roles.${org.operatorRole}`, org.operatorRole)
    })) || [];

  const currentOrgExists =
    organizationId &&
    organizationsToMenuItems.some((item) => Number(item.id) === organizationId);

  let partyIdToUse: string | undefined;

  if (currentOrgExists && organizationId) {
    partyIdToUse = organizationId.toString();
  } else if (organizationsToMenuItems.length > 0) {
    partyIdToUse = organizationsToMenuItems[0].id;
  }

  async function logoutUser() {
    try {
      await utils.apiClient.bff.logout();
    } catch (e) {
      console.warn(e);
    } finally {
      utils.storage.clear();
      navigate(PageRoutes.LOGGED_OUT);
    }
  }

  const userActions: Array<UserAction> = [
    {
      id: 'profile',
      label: t('commons.userActions.yourdata'),
      onClick: () => {
        /* TODO: create a userdata page */
        navigate('/');
      },
      icon: <SettingsIcon fontSize="small" color="inherit" />
    },
    {
      id: 'logout',
      label: t('commons.userActions.logout'),
      onClick: logoutUser,
      icon: <LogoutRoundedIcon fontSize="small" color="inherit" />
    }
  ];

  const product: ProductEntity = {
    id: '0',
    title: t('commons.appName'),
    productUrl: '#pu',
    linkType: 'internal'
  };

  const onSelectedParty = (organization: PartySwitchItem) => {
    setOrganizationId(Number(organization.id));
    setOperatorRole(organization.productRole as OperatorRole);
    window.location.replace(config.deployPath);
  };

  return (
    <>
      <HeaderAccount
        rootLink={utils.config.pagopaLink}
        enableDropdown
        onAssistanceClick={onAssistanceClick}
        onDocumentationClick={onDocumentationClick}
        loggedUser={jwtUser}
        userActions={userActions}
      />
      {partyIdToUse && organizationsToMenuItems.length > 0 ? (
        <HeaderProduct
          onSelectedParty={onSelectedParty}
          partyId={partyIdToUse}
          partyList={organizationsToMenuItems}
          productsList={[product]}
        />
      ) : null}
    </>
  );
};
