import SendIcon from '@mui/icons-material/Send';
import { ExtensionManifest } from '@core/models/extensions';
import { TelematicReceiptsPage } from './pages/TelematicReceiptsPage';
import './i18n';

export const extensions: ExtensionManifest = {
  sidebarItems: [
    {
      label: 'Enterprise SEND',
      icon: SendIcon,
      route: 'enterprise/send/telematic-receipts',
      priority: 75
    }
  ],

  routes: [
    {
      path: 'enterprise/send/telematic-receipts',
      component: TelematicReceiptsPage
    }
  ],

  metadata: {
    name: 'PU Enterprise - SEND Module',
    version: '1.0.0'
  }
};
