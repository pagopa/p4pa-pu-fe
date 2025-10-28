import { useEffect, useState } from 'react';
import utils from '../../utils';
import TitleComponent, {
  ActionMenuItem
} from '../../components/TitleComponent/TitleComponent';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store/GlobalStore';
import { PageRoutes } from '..';
import { useNavigate } from 'react-router';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import {
  Alert,
  Box,
  Button,
  FormControl,
  Stack,
  Tab,
  TextField
} from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PersonIcon from '@mui/icons-material/Person';
import AltRouteIcon from '@mui/icons-material/AltRoute';

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    state: { userInfo }
  } = useStore();

  const [value, setValue] = useState('1');
  const [error, setError] = useState(false);

  useEffect(() => {
    const pendingNotification = sessionStorage.getItem('pendingNotification');
    if (pendingNotification) {
      const { message, type } = JSON.parse(pendingNotification);
      utils.notify.emit(message, type);
      sessionStorage.removeItem('pendingNotification');
    }
  }, []);

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
    setError(false);
  };

  const user = userInfo ? `${userInfo.name} ${userInfo.familyName} ` : '';

  const cta: ActionMenuItem = {
    variant: 'contained',
    buttonText: t('home.cta'),
    icon: <AddIcon></AddIcon>,
    onActionClick: () => navigate(PageRoutes.DEBT_POSITION_CREATE_WIZARD)
  };

  const RotatedAltRouteIcon = () => {
    return <AltRouteIcon sx={{ transform: 'rotate(90deg)', mr: 1 }} />;
  };

  const tabsConfig = [
    {
      value: '1',
      label: t('home.tabs.1.label'),
      icon: <ReceiptLongIcon />,
      searchLabel: t('home.tabs.1.fieldLabel'),
      searchName: 'iuv'
    },
    {
      value: '2',
      label: t('home.tabs.2.label'),
      icon: <PersonIcon />,
      searchLabel: t('home.tabs.2.fieldLabel'),
      searchName: 'cf'
    },
    {
      value: '3',
      label: t('home.tabs.3.label'),
      icon: <RotatedAltRouteIcon />,
      searchLabel: t('home.tabs.3.fieldLabel'),
      searchName: 'iuf'
    }
  ];

  /**
   *
   * @param event Form event
   * @param formData Data extracted by the form submitted
   * @param searchName Distinguish name between the different type of search
   */
  const searchHandler = (
    event: React.FormEvent<HTMLFormElement>,
    formData: FormData,
    searchName: string
  ) => {
    event?.preventDefault();
    const searchValue = formData.get('searchValue');

    if (!searchValue) {
      setError(true);
      return;
    }

    setError(false);

    // TO-DO
    console.log(searchValue, searchName);
  };

  return (
    <>
      <TitleComponent
        title={t('home.opening', { user: user })}
        accessibleTitle={t('commons.routes.HOME')}
        callToAction={[cta]}
      ></TitleComponent>

      <Box>
        <TabContext value={value}>
          <Box>
            <TabList
              onChange={handleChange}
              aria-label={t('home.tabsType')}
              variant="fullWidth"
              data-testid="home-tabs-list"
            >
              {tabsConfig.map((tab) => (
                <Tab
                  key={tab.value}
                  icon={tab.icon}
                  iconPosition={'start'}
                  label={tab.label}
                  value={tab.value}
                  data-testid={`home-tab-${tab.value}`}
                />
              ))}
            </TabList>
          </Box>
          {tabsConfig.map((tab) => (
            <TabPanel
              key={tab.value}
              value={tab.value}
              sx={{ bgcolor: 'background.paper' }}
              data-testid={`home-tabpanel-${tab.value}`}
            >
              {error && (
                <Alert
                  severity="error"
                  data-testid="home-tabs-error"
                  sx={{ mb: 2 }}
                >
                  {t('home.fillAtLeast')}
                </Alert>
              )}
              <FormControl
                fullWidth={true}
                component={'form'}
                name={tab.searchName}
                data-testid={`home-form-${tab.value}`}
                onSubmit={(event) =>
                  searchHandler(
                    event,
                    new FormData(event.currentTarget),
                    tab.searchName
                  )
                }
              >
                <Stack
                  direction={'row'}
                  spacing={2}
                  alignItems={'center'}
                  justifyContent={'space-between'}
                >
                  <TextField
                    label={tab.searchLabel}
                    name={'searchValue'}
                    data-testid={`home-form-input-${tab.value}`}
                    size="small"
                    sx={{ flexGrow: 1 }}
                  ></TextField>
                  <Button
                    variant="contained"
                    type={'submit'}
                    startIcon={<SearchIcon />}
                    data-testid={`home-form-btn-${tab.value}`}
                  >
                    {t('commons.search')}
                  </Button>
                </Stack>
              </FormControl>
            </TabPanel>
          ))}
        </TabContext>
      </Box>
    </>
  );
};

export default Home;
