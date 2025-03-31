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

export type HeaderProps = {
  onAssistanceClick?: () => void;
  onDocumentationClick?: () => void;
};

export const Header = (props: HeaderProps) => {
  const { onAssistanceClick = () => null } = props;
  const { onDocumentationClick = () => null } = props;
  const navigate = useNavigate();
  const { organizations, isSuccess } = useOrganizations();
  const { t } = useTranslation();
  const { state } = useStore();

  const organizationsToMenuItems: Array<PartySwitchItem> =
    organizations?.map((item) => ({
      // TODO: Mui-italia should fix this type
      // passing a number here will break HeaderProduct
      id: item.organizationId.toString(),
      logoUrl: item.orgLogo,
      name: item.orgName || t('commons.unknownOrganization'),
      productRole: item.operatorRole
    })) || [];

  async function logoutUser() {
    // TODO: define logout
    navigate('/');
  }

  /* TODO: call user service */
  const jwtUser: JwtUser | undefined = {
    id: 'marcopolo',
    name: 'Marco',
    surname: 'Polo',
    email: ''
  };

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

  return isSuccess ? (
    <>
      <HeaderAccount
        rootLink={utils.config.pagopaLink}
        enableDropdown
        onAssistanceClick={onAssistanceClick}
        onDocumentationClick={onDocumentationClick}
        loggedUser={jwtUser}
        userActions={userActions}
      />
      <HeaderProduct
        onSelectedParty={onSelectedParty}
        partyId={state?.organizationId?.toString()}
        partyList={organizationsToMenuItems}
        productsList={[product]}
      />
    </>
  ) : null;
};
