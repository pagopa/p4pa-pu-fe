import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../../__tests__/renderers';
import { HomeDrawerListItem } from './HomeDrawerListItem';

describe('HomeDrawerListItem', () => {
  it('HomeDrawerListItem renders correctly', () => {
    const logSpy = vi.spyOn(console, 'log');

    render(
      <HomeDrawerListItem
        actionIcon="visit"
        actionFunction={() => {
          console.log('clicked');
        }}
        icon={<div>Icon</div>}
        label="Test Label"
      />
    );

    const menuItem = screen.getByTestId('home-drawer-list-item');
    expect(menuItem).toBeInTheDocument();
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('Icon')).toBeInTheDocument();

    fireEvent.click(menuItem);
    expect(logSpy).toHaveBeenCalledWith('clicked');
  });

  it('HomeDrawerListItem renders with a download icon', () => {
    render(
      <HomeDrawerListItem
        actionIcon="download"
        actionFunction={() => {
          console.log('clicked');
        }}
        icon={<div>Icon</div>}
        label="Test Label"
      />
    );

    expect(screen.getByTestId('DownloadIcon')).toBeInTheDocument();
  });
});
