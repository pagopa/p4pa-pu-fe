import React from 'react';
import { Box, Tab, Tabs, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';

type ServiceTabsProps = {
  activeTab: number;
  onTabChange: (newValue: number) => void;
  serviceConfigs: Record<number, { labelKey: string }>;
};

export const ServiceTabs: React.FC<ServiceTabsProps> = ({
  activeTab,
  onTabChange,
  serviceConfigs
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    onTabChange(newValue);
  };

  return (
    <Box width={'100%'} display={'flex'} justifyContent={'center'}>
      <Box borderBottom={1} borderColor={theme.palette.divider} width={'100%'}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="org sil services tabs"
          centered
          variant="fullWidth"
        >
          {Object.entries(serviceConfigs).map(([key, config]) => (
            <Tab key={key} label={t(config.labelKey)} />
          ))}
        </Tabs>
      </Box>
    </Box>
  );
};
