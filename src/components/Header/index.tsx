import {
  HeaderAccount,
  HeaderProduct,
  JwtUser,
  LogoPagoPAProduct,
  ProductEntity,
  UserAction
} from '@pagopa/mui-italia';
import utils from '../../utils';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useNavigate } from 'react-router-dom';
import { Link } from '@mui/material';
import { PageRoutes } from '../../routes/routes';

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
    title: ``,
    productUrl: '#no-title',
    linkType: 'external',
    icon: (
      <Link href={PageRoutes.HOME} target="_self">
        <LogoPagoPAProduct color="default" title="PagoPA" />
      </Link>
    )
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
      <HeaderProduct productsList={[product]} />
    </>
  );
};
