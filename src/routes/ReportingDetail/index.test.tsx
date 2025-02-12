import { describe, it } from 'vitest';
import ReportingDetail from '.';
import { render } from '../../__tests__/renderers';

describe('Reporting Page', () => {
  it('renders Reporting without crashing', () => {
    render(<ReportingDetail />);
  });
});
