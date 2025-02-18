import config from '../utils/config';
interface Route {
  path: string;
  children?: Record<string, Route>;
};

interface PageRoutes {
  [key: string]: Route;
}

const deployPath = config.deployPath;

export const PageRoutesConf: PageRoutes = {
  HOME: {
    path: `${deployPath}/home`
  },
  CONSERVATION: {
    path: `${deployPath}/flows/conservation`
  },
  TELEMATIC_RECEIPT: {
    path: `${deployPath}/flows/telematic-receipt/`,
    children: {
      EXPORT_OVERVIEW: { path: 'export-overview' },
      SEARCH_RESULTS: { path: 'search-results' },
      EXPORT_FLOW_RESERVATION: { path: 'export-overview/export-flow-reservation' },
      EXPORT_FLOW_THANK_YOU_PAGE: { path: 'export-overview/export-flow-thank-you-page' },
      IMPORT_FLOW_THANK_YOU_PAGE: { path: 'import-flow/import-flow-thank-you-page' },
      IMPORT_OVERVIEW: { path: 'import-overview' },
    }
  },
  TREASURY: {
    path: `${deployPath}/flows/treasury/`,
    children: {
      IMPORT_OVERVIEW: { path: 'import-overview'},
      SEARCH_RESULTS: { path: 'search-results' }
    }
  },
  REPORTING: {
    path: `${deployPath}/flows/reporting/`,
    children: {
      SEARCH_RESULTS: { path: 'search-results' },
      IMPORT_FLOW_THANK_YOU_PAGE: { path: 'import-flow/import-flow-thank-you-page' },
      IMPORT_OVERVIEW: { path: 'import-overview' },
      DETAIL: { path: 'detail/:id' }
    }
  },
  IMPORT: {
    path: `${deployPath}/import/`,
    children: {
      FLOWS: { path: 'flows/:category' }
    }
  },
  DETAIL: {
    path: `${deployPath}/detail/`,
    children: {
      FLOWS: { path: 'flows/:category' }
    }
  },
  EXPORT: {
    path: `${deployPath}/export/`,
    children: {
      FLOWS: { path: 'flows/:category' }
    }
  }
};

export const generateFlatRoutes = (routes: PageRoutes = PageRoutesConf): Record<string, string> => {
  return Object.entries(routes).reduce((acc, [key, value]) => {
    acc[key] = value.path;

    if (value.children) {
      Object.entries(value.children).forEach(([childKey, childValue]) => {
        acc[`${key}_${childKey}`] = `${value.path}${childValue.path}`;
      });
    }

    return acc;
  }, {} as Record<string, string>);
};

export const PageRoutes = generateFlatRoutes();
