/* eslint-disable sonarjs/function-return-type */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { PageRoutes } from '../../routes';
import utils from '../../utils';

export type RouteGuardProps = {
  /**
   * Where to redirect if the user is not authorized
   * @default 'PageRoutes.HOME'
   */
  redirectTo?: string;
  children: React.ReactNode;
  /**
   * Function that should returns true if the user is authorized to access the route
   */
  evaluation: () => boolean;
};

export const RouteGuard = ({
  redirectTo = PageRoutes.HOME,
  children,
  evaluation
}: RouteGuardProps) => {
  const isAuthorized = evaluation();
  if (!isAuthorized) {
    console.warn('user not authorized to access this route');
  }
  return isAuthorized ? children : <Navigate to={redirectTo} />;
};

export const AdminRouteGuard = (props: Pick<RouteGuardProps, 'children'>) => {
  const adminGuardCondition = () => utils.roles.useWhichRole() == 'ROLE_ADMIN';
  return (
    <RouteGuard evaluation={adminGuardCondition}>{props.children}</RouteGuard>
  );
};

export const SuperAdminRouteGuard = (
  props: Pick<RouteGuardProps, 'children'>
) => {
  const superAdminGuardCondition = () => utils.roles.useIsSuperAdmin() || false;
  return (
    <RouteGuard evaluation={superAdminGuardCondition}>
      {props.children}
    </RouteGuard>
  );
};
