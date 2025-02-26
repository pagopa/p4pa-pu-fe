import {
  HeaderAccount,
  HeaderProduct,
  JwtUser,
  PartyEntity,
  ProductEntity,
  UserAction
} from '@pagopa/mui-italia';
import utils from '../../utils';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useNavigate } from 'react-router-dom';
import { useOrganizations } from '../../hooks/useOrganizations';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';
import { PartySwitchItem } from '@pagopa/mui-italia/dist/components/PartySwitch';

export interface HeaderProps {
  onAssistanceClick?: () => void;
  onDocumentationClick?: () => void;
}

export const Header = (props: HeaderProps) => {
  /* istanbul ignore next */
  const { onAssistanceClick = () => null } = props;
  const { onDocumentationClick = () => null } = props;
  const navigate = useNavigate();
  const organizations = useOrganizations();
  const { setState, state } = useStore();

  const organizationsToMenuItems: PartyEntity[] | undefined = organizations?.map(item => ({
    id: item.organizationId.toString(),
    logoUrl: item.orgLogo,
    name: item.orgName || 'Ente senza nome',
    productRole: item.operatorRole || ''
  }));

  async function logoutUser() {
    /* TO-DO define a logout strategy */
    navigate('/');
  }

  /* Mocked data */
  /* TO-DO call a service */
  const jwtUser: JwtUser | undefined =
    {
      id: 'marcopolo',
      name: 'Marco',
      surname: 'Polo',
      email: ''
    };

  const userActions: UserAction[] = [
    {
      id: 'profile',
      label: 'I tuoi dati',
      onClick: () => {
        /* TO-DO create a userdata page */
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
    setState(STATE.ORGANIZATION_ID, organization.id);
    setState(STATE.OPERATOR_ROLE, organization.productRole);
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
      <HeaderProduct
        onSelectedParty={e => onSelectedParty(e)}
        partyId={state.organizationId ? state.organizationId.toString() : undefined}
        partyList={organizationsToMenuItems}
        productsList={[product]}
      />
    </>
  );
};
