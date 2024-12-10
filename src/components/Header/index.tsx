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

export interface HeaderProps {
  onAssistanceClick?: () => void;
  onDocumentationClick?: () => void;
}

export const Header = (props: HeaderProps) => {
  /* istanbul ignore next */
  const { onAssistanceClick = () => null } = props;
  const { onDocumentationClick = () => null } = props;
  const navigate = useNavigate();

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
  const partyList: Array<PartyEntity> = [
    {
      id: '0',
      name: `Commissario straordinario per la realizzazione di
      approdi temporanei e di interventi complementari per la
      salvaguardia di Venezia`,
      productRole: 'Amministratore',
      logoUrl: '',
    },
    {
      id: '1',
      logoUrl: '',
      name: 'Comune di Roma',
      productRole: 'Operatore',
    },
    {
      id: '2',
      logoUrl: '',
      name: 'Comune di Parma',
      productRole: 'Operatore',
    }];

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
        productsList={[product]}
        partyList={partyList}
        onSelectedParty={e => console.log('Selected Item:', e.name)} />
    </>
  );
};
