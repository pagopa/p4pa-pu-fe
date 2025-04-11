import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { Step1Configuration } from './Step1Configuration';

describe('Step1Configuration', () => {
  const mockSetData = vi.fn();
  const mockOnNext = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows validation errors if form is submitted empty', async () => {
    render(<Step1Configuration setData={mockSetData} onNext={mockOnNext} />);

    // Select the form via container.querySelector('form')
    fireEvent.click(screen.getByRole('button', { name: 'commons.continue' }));

    await waitFor(() => {
      expect(
        screen.getByText('debtTypeCreate.configuration.debtType.required')
      ).toBeInTheDocument();
      expect(
        screen.getByText('debtTypeCreate.configuration.taxonomy.required')
      ).toBeInTheDocument();
    });

    expect(mockSetData).not.toHaveBeenCalled();
    expect(mockOnNext).not.toHaveBeenCalled();
  });

  it('submits form when valid values are provided', async () => {
    render(<Step1Configuration setData={mockSetData} onNext={mockOnNext} />);

    // Use getByPlaceholderText for the text field.
    const titleInput = screen.getByPlaceholderText(
      'debtTypeCreate.configuration.debtType.placeholder'
    );
    fireEvent.change(titleInput, {
      target: { value: 'Valid Title' }
    });

    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);

    const firstOption = screen.getByText('form.option0');
    fireEvent.click(firstOption);

    fireEvent.click(screen.getByRole('button', { name: 'commons.continue' }));

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalledWith({
        debtPositionType: 'Valid Title',
        taxonomy: 'option0'
      });
      expect(mockOnNext).toHaveBeenCalled();
    });
  });
});
