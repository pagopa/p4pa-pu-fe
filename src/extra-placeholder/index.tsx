import { ExtensionManifest } from '@core/models/extensions';

/**
 * Placeholder when no enterprise module is installed
 * Ensures app always works even without extensions
 */
export const extensions: ExtensionManifest = {
  sidebarItems: [],
  routes: []
};
