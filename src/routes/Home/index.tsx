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
import { Drawer } from '../../components/Drawer';
import { HomeDrawerBody } from './components/HomeDrawerBody';
import { useDashboardByIuv } from '../../api/home';
import { DashboardResult, TABS } from './models';

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    state: { userInfo, organizationId }
  } = useStore();

  const [currentTab, setCurrentTab] = useState(TABS.IUV);
  const [error, setError] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [searchLabel, setSearchLabel] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<DashboardResult>();

  const dashboardByIuvMutation = useDashboardByIuv({ organizationId });

  useEffect(() => {
    const pendingNotification = sessionStorage.getItem('pendingNotification');
    if (pendingNotification) {
      const { message, type } = JSON.parse(pendingNotification);
      utils.notify.emit(message, type);
      sessionStorage.removeItem('pendingNotification');
    }
  }, []);

  const handleChange = (_event: React.SyntheticEvent, newTab: TABS) => {
    setCurrentTab(newTab);
    setError(false);
  };

  const user = userInfo ? `${userInfo.name} ${userInfo.familyName} ` : '';

  const cta: ActionMenuItem = {
    variant: 'contained',
    buttonText: t('home.cta'),
    icon: <AddIcon />,
    onActionClick: () => navigate(PageRoutes.DEBT_POSITION_CREATE_WIZARD)
  };

  const RotatedAltRouteIcon = () => {
    return <AltRouteIcon sx={{ transform: 'rotate(90deg)', mr: 1 }} />;
  };

  const tabsConfig = [
    {
      id: TABS.IUV,
      label: t('home.tabs.IUV.label'),
      icon: <ReceiptLongIcon />,
      searchLabel: t('home.tabs.IUV.fieldLabel'),
      searchName: 'iuv'
    },
    {
      id: TABS.FC,
      label: t('home.tabs.FC.label'),
      icon: <RotatedAltRouteIcon />,
      searchLabel: t('home.tabs.FC.fieldLabel'),
      searchName: 'cf'
    },
    {
      id: TABS.IUF,
      label: t('home.tabs.IUF.label'),
      icon: <PersonIcon />,
      searchLabel: t('home.tabs.IUF.fieldLabel'),
      searchName: 'iuf'
    }
  ];

  const mutationByTab = (currentTab: TABS) => {
    switch (currentTab) {
      case TABS.IUV:
        return dashboardByIuvMutation;
    // TODO: handle other tabs mutations
      case TABS.IUF:
        return null;
      case TABS.FC:
        return null;
      default:
        navigate(PageRoutes.RESPONSES_ERROR);
        return null;
    }
  };

  /**
   *
   * @param event Form event
   * @param formData Data extracted by the form submitted
   */
  const searchHandler = async (
    event: React.FormEvent<HTMLFormElement>,
    formData: FormData
  ) => {
    event?.preventDefault();
    const searchValue = formData.get('searchValue')?.toString() || '';

    if (!searchValue) {
      setError(true);
      return;
    }
    const mutation = mutationByTab(currentTab);

    if (!mutation) {
      setError(true);
      setShowDrawer(false);
      utils.notify.emit(t('errors.generic'));
      return;
    }

    try {
      const results = await mutation.mutateAsync(searchValue);
      setSearchResults(results);
      setSearchLabel(currentTab);
      setSearchValue(searchValue);
      setError(false);
      setShowDrawer(true);
    } catch (error) {
      console.error(error);
      setError(true);
      setShowDrawer(false);
      utils.notify.emit(t('errors.generic'));
    }
  };

  return (
    <>
      <TitleComponent
        title={t('home.opening', { user: user })}
        accessibleTitle={t('commons.routes.HOME')}
        callToAction={[cta]}
      />

      <Box>
        <TabContext value={currentTab}>
          <Box>
            <TabList
              onChange={handleChange}
              aria-label={t('home.tabsType')}
              variant="fullWidth"
              data-testid="home-tabs-list"
            >
              {tabsConfig.map((tab) => (
                <Tab
                  key={tab.id}
                  icon={tab.icon}
                  iconPosition={'start'}
                  label={tab.label}
                  value={tab.id}
                  data-testid={`home-tab-${tab.id}`}
                />
              ))}
            </TabList>
          </Box>
          {tabsConfig.map((tab) => (
            <TabPanel
              key={tab.id}
              value={tab.id}
              sx={{ bgcolor: 'background.paper' }}
              data-testid={`home-tabpanel-${tab.id}`}
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
                data-testid={`home-form-${tab.id}`}
                onSubmit={(event) =>
                  searchHandler(event, new FormData(event.currentTarget))
                }
              >
                <Stack
                  direction={'row'}
                  spacing={2}
                  alignItems={'center'}
                  justifyContent={'space-between'}
                >
                  <TextField
                    autoFocus
                    label={tab.searchLabel}
                    name={'searchValue'}
                    data-testid={`home-form-input-${tab.id}`}
                    size="small"
                    sx={{ flexGrow: 1 }}
                  />
                  <Button
                    variant="contained"
                    type={'submit'}
                    startIcon={<SearchIcon />}
                    data-testid={`home-form-btn-${tab.id}`}
                  >
                    {t('commons.search')}
                  </Button>
                </Stack>
              </FormControl>
            </TabPanel>
          ))}
        </TabContext>
      </Box>
      <Drawer
        open={showDrawer}
        onClose={() => {
          setShowDrawer(false);
        }}
        title={t('commons.results')}
      >
        <HomeDrawerBody
          searchLabel={searchLabel}
          searchValue={searchValue}
          searchResults={searchResults}
        />
      </Drawer>
    </>
  );
};

export default Home;
