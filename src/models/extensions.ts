import { ComponentType } from 'react';
import { LoaderFunction, RouteObject } from 'react-router';
import { RouteHandleObject } from '@core/models/Routes';
import { ISidebarMenuItem } from './SidebarMenuItem';

export type ExtensionRoute = RouteObject & {
  path: string;
  component: ComponentType;
  loader?: LoaderFunction;
  errorElement?: React.ReactNode;
  handle?: RouteHandleObject & {
    enterprise?: boolean;
    module?: string;
  };
};

export type ExtensionManifest = {
  sidebarItems: Array<ISidebarMenuItem>;
  routes: Array<ExtensionRoute>;
  metadata?: {
    name: string;
    version: string;
    author?: string;
  };
  onLoad?: () => void | Promise<void>;
};
