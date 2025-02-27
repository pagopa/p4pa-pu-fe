
import { Layout } from '../components/layout/Layout';
import { RouteHandleObject } from '../models/Breadcrumbs';
import config from '../utils/config';
import DebtPositionIUVDataGrid from './DebtPositions/components/DebtPositionIUVDataGrid';
import { DataGrid as DebtPositionsDataGrid } from './DebtPositions/components/DebtPositionsDataGrid';
import DebtPositionResults, { SearchType } from './DebtPositions/DebtPositionsResults';
import DebtPositionsPage from './DebtPositionsPage';

const deployPath = config.deployPath;

const DebtPositionResultsComponent = () => (
  <DebtPositionResults 
    searchType={SearchType.DEBT_POSITION} 
    dataGridComponent={<DebtPositionsDataGrid />}
  />
);

const DebtPositionSearchResultsComponent = () => (
  <DebtPositionResults 
    searchType={SearchType.IUV} 
    dataGridComponent={<DebtPositionIUVDataGrid />}
  />
);

export const debtPositionsRoutes = [
  {
    id: 'DEBT_POSITIONS',
    path: `${deployPath}/debt-positions/`,
    element: <Layout />,
    children: [
      {
        index: true,
        id: 'DEBT_POSITIONS_INDEX',
        element: <DebtPositionsPage />,
        handle: {
          backButton: false,
          hideBreadcrumbs: true
        } as RouteHandleObject,
      },
      {
        id: 'DEBT_POSITIONS_RESULTS',
        path: 'results',
        element: <DebtPositionResultsComponent />,
      },
      {
        id: 'DEBT_POSITION_SEARCH_RESULTS',
        path: 'search-results',
        element: <DebtPositionSearchResultsComponent />,
      }
    ]
  }
];
