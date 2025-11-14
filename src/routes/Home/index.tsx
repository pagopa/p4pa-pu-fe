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
import {
  Box,
  FormControl,
  FormControlLabel,
  Link,
  Radio,
  RadioGroup,
  Typography
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PersonIcon from '@mui/icons-material/Person';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import { Drawer } from '../../components/Drawer';
import { HomeDrawerBody } from './components/HomeDrawerBody';
import {
  useDashboardByIuf,
  useDashboardByIuv,
  useDashboardByFiscalCode
} from '../../api/home';
import {
  DashboardResult,
  TABS,
  tabsConfigProps,
  tabsPerProfile,
  USER_PROFILES
} from './models';
import GenericDialog from '../../components/GenericDialog/GenericDialog';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import { HomeTabs } from './components/HomeTabs';
import {
  isValidFiscalCodeOrPIVA,
  normalizeFiscalCodeOrPIVA,
  normalizeCompact
} from '../../utils/fieldValidation';

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    state: { userInfo, organizationId }
  } = useStore();

  const [currentTab, setCurrentTab] = useState(TABS.IUV);
  const [dialogOpen, setDialogOpen] = useState(true);
  const [error, setError] = useState(false);
  const [fiscalCodeError, setFiscalCodeError] = useState<string | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [searchLabel, setSearchLabel] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<DashboardResult>();
  const defaultUserProfile = USER_PROFILES.DP;
  const [radioValue, setRadioValue] =
    useState<USER_PROFILES>(defaultUserProfile);

  const dashboardByIuvMutation = useDashboardByIuv({ organizationId });
  const dashboardByIufMutation = useDashboardByIuf({ organizationId });
  const dashboardByFiscalCodeMutation = useDashboardByFiscalCode({
    organizationId
  });

  useEffect(() => {
    const pendingNotification = sessionStorage.getItem('pendingNotification');
    if (pendingNotification) {
      const { message, type } = JSON.parse(pendingNotification);
      utils.notify.emit(message, type);
      sessionStorage.removeItem('pendingNotification');
    }
  }, []);

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

  const tabsConfig: Array<tabsConfigProps> = [
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
      icon: <PersonIcon />,
      searchLabel: t('home.tabs.FC.fieldLabel'),
      searchName: 'cf'
    },
    {
      id: TABS.IUF,
      label: t('home.tabs.IUF.label'),
      icon: <RotatedAltRouteIcon />,
      searchLabel: t('home.tabs.IUF.fieldLabel'),
      searchName: 'iuf'
    }
  ];

  const tabsPerProfile: tabsPerProfile = {
    [USER_PROFILES.DP]: [TABS.IUV, TABS.FC],
    [USER_PROFILES.TM]: [TABS.IUF, TABS.IUV],
    [USER_PROFILES.OM]: [TABS.IUV, TABS.FC, TABS.IUF]
  };

  const mutationByTab = (currentTab: TABS) => {
    switch (currentTab) {
      case TABS.IUV:
        return dashboardByIuvMutation;
      case TABS.IUF:
        return dashboardByIufMutation;
      case TABS.FC:
        return dashboardByFiscalCodeMutation;
      default:
        navigate(PageRoutes.RESPONSES_ERROR);
        return null;
    }
  };

  const tabsAvailableForProfile = (profile: USER_PROFILES) => {
    const tabs = tabsPerProfile[profile]
      .map((tabId) => tabsConfig.find((tab) => tab.id === tabId))
      .filter(Boolean);
    return (tabs as Array<tabsConfigProps>) || tabsConfig;
  };

  const [profileSelected, setProfileSelected] =
    useState<USER_PROFILES>(defaultUserProfile);

  const tabsHandleChange = (_event: React.SyntheticEvent, newTab: TABS) => {
    setCurrentTab(newTab);
    setError(false);
    setFiscalCodeError(null); // Clear fiscal code error when switching tabs
    setSearchValue(''); // Reset search input when switching tabs
  };

  const userProfileConfirmChange = () => {
    const tabsPerProfile = tabsAvailableForProfile(radioValue as USER_PROFILES);
    setProfileSelected(radioValue as USER_PROFILES);
    setCurrentTab(tabsPerProfile[0].id);
    setDialogOpen(false);
  };

  const userProfileCancelChange = () => {
    setRadioValue(profileSelected);
    setDialogOpen(false);
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
    let searchValue = formData.get('searchValue')?.toString() || '';

    if (!searchValue) {
      setError(true);
      return;
    }

    // Normalize/validate per tab
    if (currentTab === TABS.FC) {
      // Normalize the value (remove spaces, uppercase)
      searchValue = normalizeFiscalCodeOrPIVA(searchValue);
      // Reflect normalized value in the input immediately
      setSearchValue(searchValue);
      if (!isValidFiscalCodeOrPIVA(searchValue)) {
        setFiscalCodeError(t('commons.validation.invalidFiscalCodeOrVat'));
        setError(false);
        return;
      }
      // Clear error if validation passes
      setFiscalCodeError(null);
    } else {
      // For IUV and IUF: normalize by removing spaces and reflect in input
      searchValue = normalizeCompact(searchValue);
      setSearchValue(searchValue);
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

      <Typography variant="body2">
        {t(`home.viewAs`)}
        <Link
          role="button"
          fontWeight={600}
          data-testid="home-choose-widget-btn"
          ml={1}
          display={'inline-flex'}
          color={'inherit'}
          href="#"
          onClick={() => setDialogOpen(true)}
        >
          {t(`home.chooseWidget.profiles.${profileSelected}.title`)}
          <ModeEditIcon
            fontSize="small"
            color="primary"
            aria-hidden="true"
            sx={{ ml: 1, lineHeight: 'inherit' }}
          />
        </Link>
      </Typography>

      <HomeTabs
        tabsHandleChange={tabsHandleChange}
        currentTab={currentTab}
        tabsAvailableForProfile={tabsAvailableForProfile}
        profileSelected={profileSelected}
        defaultUserProfile={defaultUserProfile}
        searchHandler={searchHandler}
        error={error}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        fiscalCodeError={fiscalCodeError}
        setFiscalCodeError={setFiscalCodeError}
      />

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
      <GenericDialog
        open={dialogOpen}
        title={t('home.chooseWidget.title')}
        confirmLabel={t('commons.continue')}
        cancelLabel={t('commons.close')}
        data-testid="home-choose-widget"
        fullWidth={true}
        onConfirm={userProfileConfirmChange}
        onClose={userProfileCancelChange}
      >
        <Typography variant="body1" mb={2}>
          {t('home.chooseWidget.message')}
        </Typography>
        <Box my={{ xs: 1, sm: 2 }}>
          <FormControl>
            <RadioGroup
              aria-label={t('home.chooseWidget.title')}
              name="chooseprofile"
              defaultValue={defaultUserProfile}
              value={radioValue}
              data-testid="home-choose-widget-radio-group"
              onChange={(event) =>
                setRadioValue(event.target.value as USER_PROFILES)
              }
            >
              {Object.values(USER_PROFILES).map((profile) => (
                <FormControlLabel
                  sx={{ my: 1 }}
                  key={profile}
                  value={profile}
                  aria-label={t(`home.chooseWidget.profiles.${profile}.title`)}
                  control={<Radio />}
                  data-testid={`home-choose-widget-radio-item`}
                  label={
                    <>
                      <Typography variant="body1">
                        {t(`home.chooseWidget.profiles.${profile}.title`)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t(`home.chooseWidget.profiles.${profile}.description`)}
                      </Typography>
                    </>
                  }
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Box>
        <Typography variant="body2">
          {t('home.chooseWidget.closingText')}
        </Typography>
      </GenericDialog>
    </>
  );
};

export default Home;
