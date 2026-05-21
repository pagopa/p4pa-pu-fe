import SendIcon from '@mui/icons-material/Send';
import { ExtensionManifest } from '@core/models/extensions';
import './send/src/i18n';
import { EnterpriseTelematicReceipt } from './send/src/pages/EnterpriseTelematicReceipt';

export const extensions: ExtensionManifest = {
  sidebarItems: [
    {
      label: 'Enterprise Module 1',
      icon: SendIcon,
      route: 'enterprise/module1/telematic-receipts',
      priority: 75
    }
  ],

  routes: [
    {
      path: 'enterprise/module1/telematic-receipts',
      component: EnterpriseTelematicReceipt
    }
  ]
};
