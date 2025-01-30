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
  TELEMATIC_RECEIPT: {
    path: `${deployPath}/flows/telematic-receipt/`,
    children: {
      EXPORT_OVERVIEW: { path: 'export-overview' },
      SEARCH_RESULTS: { path: 'search-results' },
      DETAIL: { path: 'detail' },
      EXPORT_FLOW_RESERVATION: { path: 'export-overview/export-flow-reservation' },
      EXPORT_FLOW_THANK_YOU_PAGE: { path: 'export-overview/export-flow-thank-you-page' },
      IMPORT_FLOW: { path: 'import-flow' },
      IMPORT_FLOW_THANK_YOU_PAGE: { path: 'import-flow/import-flow-thank-you-page' },
      IMPORT_OVERVIEW: { path: 'import-overview' },
    }
  },
  REPORTING: {
    path: `${deployPath}/flows/reporting/`
  }
};

export const PageRoutesFuncReduce = () => {
  const flatRoutes: Record<string, string> = {};
  Object.keys(PageRoutesConf).forEach(el => {
    flatRoutes[el] = PageRoutesConf[el].path;
    if ('children' in PageRoutesConf[el]) {
      const childrenObj = PageRoutesConf[el].children || {};
      const firstBranchPath = PageRoutesConf[el].path;
      Object.keys(childrenObj).map( (childKey: string) => {
        const childObj = childKey in childrenObj ? childrenObj[childKey] : undefined;
        flatRoutes[`${el}_${childKey}`] = childObj ? `${firstBranchPath}${childObj.path}` : '';
      } );
    }
  });
  return flatRoutes;
};

export const PageRoutes = PageRoutesFuncReduce();