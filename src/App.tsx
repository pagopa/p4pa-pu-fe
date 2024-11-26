import './App.css'
import HelloWorld from './routes/HelloWorld';
import utils from './utils';
import { Theme } from './utils/theme'
import { RouterProvider, createBrowserRouter, useRouteError } from 'react-router-dom'


const router = createBrowserRouter([
  {
    element: <HelloWorld/>,
    path: `${utils.config.deployPath}`,
    ErrorBoundary: () => {
      throw useRouteError();
    }
    
  }
]);

export const App = () => (
  
      <Theme>
    <RouterProvider router={router} />
      
      </Theme>
)

export default App
