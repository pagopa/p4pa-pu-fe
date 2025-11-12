import { TabContext, TabList, TabPanel } from '@mui/lab';
import {
  Alert,
  Box,
  Button,
  FormControl,
  Stack,
  Tab,
  TextField
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import { TABS, tabsConfigProps, USER_PROFILES } from '../models';

type HomeTabsProps = {
  tabsHandleChange: (event: React.SyntheticEvent, newTab: TABS) => void;
  currentTab: TABS;
  tabsAvailableForProfile: (profile: USER_PROFILES) => Array<tabsConfigProps>;
  profileSelected: USER_PROFILES;
  defaultUserProfile: USER_PROFILES;
  searchHandler: (
    event: React.FormEvent<HTMLFormElement>,
    formData: FormData
  ) => Promise<void>;
  error: boolean;
  searchValue: string;
  setSearchValue: (value: string) => void;
  fiscalCodeError: string | null;
  setFiscalCodeError: (error: string | null) => void;
};

export const HomeTabs = ({
  tabsHandleChange,
  currentTab,
  tabsAvailableForProfile,
  profileSelected,
  defaultUserProfile,
  searchHandler,
  error,
  searchValue,
  setSearchValue,
  fiscalCodeError,
  setFiscalCodeError
}: HomeTabsProps) => {
  const { t } = useTranslation();

  return (
    <Box py={2}>
      <TabContext value={currentTab}>
        <Box>
          <TabList
            onChange={tabsHandleChange}
            aria-label={t('home.tabsType')}
            variant="fullWidth"
            data-testid="home-tabs-list"
          >
            {tabsAvailableForProfile(profileSelected || defaultUserProfile).map(
              (tab) => (
                <Tab
                  key={tab.id}
                  icon={tab.icon}
                  iconPosition={'start'}
                  label={tab.label}
                  value={tab.id}
                  data-testid={`home-tab-${tab.id}`}
                />
              )
            )}
          </TabList>
        </Box>
        {tabsAvailableForProfile(profileSelected || defaultUserProfile).map(
          (tab) => (
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
                    value={tab.id === currentTab ? searchValue : ''}
                    error={tab.id === TABS.FC && !!fiscalCodeError}
                    helperText={
                      tab.id === TABS.FC ? fiscalCodeError : undefined
                    }
                    onChange={(e) => {
                      setSearchValue((e.target as HTMLInputElement).value);
                      // Clear fiscal code error when user types
                      if (tab.id === TABS.FC && fiscalCodeError) {
                        setFiscalCodeError(null);
                      }
                    }}
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
          )
        )}
      </TabContext>
    </Box>
  );
};
