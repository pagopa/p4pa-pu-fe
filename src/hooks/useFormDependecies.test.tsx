import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useForm, Path } from 'react-hook-form';
import { useFormDependencies } from './useFormDependecies';

type MyForm = { a: string; b: string; c: string };

function TestForm() {
  const form = useForm<MyForm>({
    defaultValues: { a: '1', b: '2', c: '3' }
  });

  const fieldOrder: Array<Path<MyForm>> = ['a', 'b', 'c'];

  // Pass the generic <MyForm> so TS knows exactly what T is
  const { keys } = useFormDependencies<MyForm>({ form, fieldOrder });

  return (
    <form>
      <input key={keys.a} data-testid="a" {...form.register('a')} />
      <input key={keys.b} data-testid="b" {...form.register('b')} />
      <input key={keys.c} data-testid="c" {...form.register('c')} />
      <div data-testid="keys">{JSON.stringify(keys)}</div>
    </form>
  );
}

describe('useFormDependencies', () => {
  it('initializes keys from defaultValues', () => {
    render(<TestForm />);
    const keysDiv = screen.getByTestId('keys');
    expect(keysDiv.textContent).toBe(
      JSON.stringify({ a: 'a-1', b: 'b-2', c: 'c-3' })
    );
  });

  it('resets downstream fields and updates keys when the first field changes', async () => {
    render(<TestForm />);
    const a = screen.getByTestId('a') as HTMLInputElement;
    const b = screen.getByTestId('b') as HTMLInputElement;
    const c = screen.getByTestId('c') as HTMLInputElement;
    const keysDiv = () => screen.getByTestId('keys');

    // change “a” from “1” → “x”
    fireEvent.change(a, { target: { value: 'x' } });

    await waitFor(() => {
      // upstream field carries the new value
      expect(a.value).toBe('x');
      // downstream fields have been reset to empty
      expect(b.value).toBe('');
      expect(c.value).toBe('');
      // keys reflect the new values (empty strings produce the “-” suffix)
      expect(keysDiv().textContent).toBe(
        JSON.stringify({ a: 'a-x', b: 'b-', c: 'c-' })
      );
    });
  });

  it('only resets fields after the one you change', async () => {
    render(<TestForm />);
    const a = screen.getByTestId('a') as HTMLInputElement;
    const b = screen.getByTestId('b') as HTMLInputElement;
    const c = screen.getByTestId('c') as HTMLInputElement;

    // first change “a” so b and c go blank
    fireEvent.change(a, { target: { value: 'x' } });
    await waitFor(() => expect(b.value).toBe(''));

    // now set b to “y”; only c should reset
    fireEvent.change(b, { target: { value: 'y' } });
    await waitFor(() => {
      expect(a.value).toBe('x'); // a stays
      expect(b.value).toBe('y'); // b updated
      expect(c.value).toBe(''); // c reset
    });
  });
});
