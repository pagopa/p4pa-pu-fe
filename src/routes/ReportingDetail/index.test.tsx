import { describe, it } from 'vitest';
import ReportingDetail from '.';
import { render } from '../../__tests__/renderers';

describe('Reporting Detail Page', () => {
  it('renders Reporting Detail without crashing', () => {
    render(<ReportingDetail />);
  });
});
