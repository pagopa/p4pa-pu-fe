import React, { createContext, useContext, ReactNode } from 'react';
import { STATE, State, StoreContextProps } from './types';
import { organizationIdState, setOrganizationId } from './OrganizationIdStore';
import { OrganizationIdMemo } from '../models/Organization';
import { UserInfo } from '../models/User';
import { setUserInfo, userInfoState } from './UserInfoStore';
import { configFeState } from './ConfigFeStore';
import { appState, setAppState } from './AppStateStore';
import { AppState } from '../models/AppState';
import { filtersState } from './FilterStore';
import { setSuperAdmin, superAdminState } from './SuperAdminStore';
import { operatorRoleState, setOperatorRole } from './operatorRoleStore';
import { OperatoRole } from '../models/OperatorRole';

const StoreContext = createContext<StoreContextProps | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const combinedState: State = {
    [STATE.APP_STATE]: appState?.value,
    [STATE.CONFIG_FE]: configFeState?.value,
    [STATE.ORGANIZATION_ID]: organizationIdState.state?.value,
    [STATE.USER_INFO]: userInfoState.state?.value,
    [STATE.FILTERS]: filtersState?.value,
    [STATE.SUPER_ADMIN]: superAdminState.value,
    [STATE.OPERATOR_ROLE]: operatorRoleState.value,

  };

  const setState = (key: STATE, value: unknown) => {
    if (key === STATE.ORGANIZATION_ID) {
      setOrganizationId(value as OrganizationIdMemo);
    }
    if (key === STATE.USER_INFO) {
      setUserInfo(value as UserInfo);
    }
    if (key === STATE.APP_STATE) {
      setAppState(value as AppState);
    }
    if (key === STATE.SUPER_ADMIN) {
      setSuperAdmin(value as boolean);
    }
    if (key === STATE.OPERATOR_ROLE) {
      setOperatorRole(value as OperatoRole);
    }
  };

  return (
    <StoreContext.Provider value={{ state: combinedState, setState }}>
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
