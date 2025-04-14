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
import { useNavigate } from 'react-router-dom';
import { useOrganizations } from '../../hooks/useOrganizations';
import { useStore } from '../../store/GlobalStore';
import { PartySwitchItem } from '@pagopa/mui-italia/dist/components/PartySwitch';
import { setOrganizationId } from '../../store/OrganizationIdStore';
import { setOperatorRole } from '../../store/OperatorRoleStore';
import { useTranslation } from 'react-i18next';
import { OperatorRoleEnum } from '../../../generated/apiClient';
import { PageRoutes } from '../../App';
import { useUserInfo } from '../../hooks/useUserInfo';

export type HeaderProps = {
  onAssistanceClick?: () => void;
  onDocumentationClick?: () => void;
};

export const Header = (props: HeaderProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state } = useStore();

  const organizations = useOrganizations();
  const userInfo = useUserInfo();

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
    organizations.data?.map((item) => ({
      id: item.organizationId.toString(),
      logoUrl: item.orgLogo,
      name: item.orgName || t('commons.unknownOrganization'),
      productRole: item.operatorRole
    })) || [];

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
      label: 'I tuoi dati',
      onClick: () => {
        /* TODO: create a userdata page */
        navigate('/');
      },
      icon: <SettingsIcon fontSize="small" color="inherit" />
    },
    {
      id: 'logout',
      label: 'Esci',
      onClick: logoutUser,
      icon: <LogoutRoundedIcon fontSize="small" color="inherit" />
    }
  ];

  const product: ProductEntity = {
    id: '0',
    title: 'Piattaforma Unitaria',
    productUrl: '#pu',
    linkType: 'internal'
  };

  const onSelectedParty = (organization: PartySwitchItem) => {
    setOrganizationId(Number(organization.id));
    setOperatorRole(organization.productRole as OperatorRoleEnum);
    navigate(0);
  };

  return organizations.isSuccess ? (
    <>
      <HeaderAccount
        rootLink={utils.config.pagopaLink}
        enableDropdown
        onAssistanceClick={onAssistanceClick}
        onDocumentationClick={onDocumentationClick}
        loggedUser={jwtUser}
        userActions={userActions}
      />
      {state?.organizationId ? (
        <HeaderProduct
          onSelectedParty={onSelectedParty}
          partyId={state?.organizationId?.toString()}
          partyList={organizationsToMenuItems}
          productsList={[product]}
        />
      ) : (
        ''
      )}
    </>
  ) : null;
};
