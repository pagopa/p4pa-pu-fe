import { render, screen } from '../../__tests__/renderers';
import { Timeline } from '../Timeline';

describe('TimelineDrawer', () => {
  it('renders without crashing', () => {
    render(
      <Timeline.Drawer title="test" open={true} onClose={() => null}>
        <div data-testid="mock-drawer" />
      </Timeline.Drawer>
    );
    expect(screen.getByTestId('mock-drawer')).toBeInTheDocument();
  });

  it('renders the titleDecoration with History icon', () => {
    render(
      <Timeline.Drawer title="test" open={true} onClose={() => null}>
        <div data-testid="mock-drawer" />
      </Timeline.Drawer>
    );
    expect(screen.getByTestId('HistoryIcon')).toBeInTheDocument();
  });

  it('renders children inside MuiTimeline', () => {
    render(
      <Timeline.Drawer title="test" open={true} onClose={() => null}>
        <div data-testid="timeline-child">Child</div>
      </Timeline.Drawer>
    );
    expect(screen.getByTestId('timeline-child')).toBeInTheDocument();
  });
});
