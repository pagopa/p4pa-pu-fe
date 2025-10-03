import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import utils from '../../utils';
import { CourtesyPage } from '.';

// Mock the AbacusIcon to a simple placeholder component
vi.mock('../../assets/icons/abacus', () => ({
  AbacusIcon: () => <svg data-testid="abacus-icon"></svg>
}));

describe('CourtesyPage component', () => {
  beforeEach(() => {
    // Mock window.location.replace to a jest.fn()
    // @ts-expect-error deleting window.location to mock it safely
    delete window?.location;
    window.location = { replace: vi.fn() } as unknown as string & Location;
  });

  it('renders title, description, icon, and button correctly', () => {
    render(<CourtesyPage />);
    expect(
      screen.getByText('DraftCourtesyPage.superadmin.title')
    ).toBeInTheDocument();
    expect(
      screen.getByText('DraftCourtesyPage.superadmin.description')
    ).toBeInTheDocument();
    expect(screen.getByTestId('abacus-icon')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'commons.close' })
    ).toBeInTheDocument();
  });

  it('calls window.location.replace with loginUrl when button clicked', () => {
    render(<CourtesyPage />);
    const button = screen.getByRole('button', { name: 'commons.close' });
    fireEvent.click(button);
    expect(window.location.replace).toHaveBeenCalledWith(utils.config.loginUrl);
  });
});
