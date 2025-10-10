import { render, screen, fireEvent, waitFor } from '../__tests__/renderers';
import { vi } from 'vitest';
import { useForm, UseFormReturn } from 'react-hook-form';
import { useFormDependencies } from './useFormDependecies';

type Fields = {
  f1: string;
  f2: string;
  f3: string;
};

describe('useFormDependencies hook', () => {
  function TestForm() {
    const form = useForm<Fields>({ defaultValues: { f1: '', f2: '', f3: '' } });

    const { keys } = useFormDependencies<Fields>({
      form: form as UseFormReturn<Fields>,
      fieldOrder: ['f1', 'f2', 'f3']
    });

    return (
      <>
        <input data-testid="f1" {...form.register('f1')} />
        <input data-testid="f2" {...form.register('f2')} />
        <input data-testid="f3" {...form.register('f3')} />
        <pre data-testid="keys">{JSON.stringify(keys)}</pre>
      </>
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initial keys reflect empty defaults', () => {
    render(<TestForm />);
    const keysText = screen.getByTestId('keys').textContent;
    const keys = keysText ? JSON.parse(keysText) : {};
    expect(keys).toEqual({ f1: 'f1-', f2: 'f2-', f3: 'f3-' });
  });

  it('resets dependent fields and updates keys on value change', async () => {
    render(<TestForm />);

    fireEvent.change(screen.getByTestId('f1'), { target: { value: 'A' } });

    await waitFor(() => {
      const keysText = screen.getByTestId('keys').textContent;
      const keys = keysText ? JSON.parse(keysText) : {};
      expect(keys.f1).toBe('f1-A');
      expect(keys.f2).toBe('f2-1');
      expect(keys.f3).toBe('f3-2');
    });
  });
});
