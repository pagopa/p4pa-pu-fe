import React, { createContext, useContext, ReactNode } from 'react';
import { STATE, State, StoreContextProps } from './types';
import { organizationIdState } from './OrganizationIdStore';
import { userInfoState } from './UserInfoStore';
import { configFeState } from './ConfigFeStore';
import { appState } from './AppStateStore';
import { operatorRoleState } from './OperatorRoleStore';
import { filterValues, selectedFilters } from './FilterStore';
import { idTokenPayloadState } from './IdTokenStore';
import { organizationsState } from './OrganizationsStore';

const StoreContext = createContext<StoreContextProps | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const combinedState: State = {
    [STATE.APP_STATE]: appState?.value,
    [STATE.CONFIG_FE]: configFeState?.value,
    [STATE.ORGANIZATIONS]: organizationsState.value,
    [STATE.ORGANIZATION_ID]: organizationIdState.state?.value,
    [STATE.USER_INFO]: userInfoState?.value,
    [STATE.SELECTED_FILTERS]: selectedFilters?.value,
    [STATE.FILTER_VALUES]: filterValues?.value,
    [STATE.OPERATOR_ROLE]: operatorRoleState.value,
    [STATE.ID_TOKEN]: idTokenPayloadState.value
  };

  return (
    <StoreContext.Provider value={{ state: combinedState }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextProps => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
