/* eslint-disable sonarjs/function-return-type */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { PageRoutes } from '../../App';

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
