import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '../__tests__/renderers';
import { useEffect, useRef, useState } from 'react';
import { useFocusAfterClose } from './useFocusAfterClose';

const TestComponent = ({
  initiallyOpen = true,
  withGrid = true,
  arm = true
}: {
  initiallyOpen?: boolean;
  withGrid?: boolean;
  arm?: boolean;
}) => {
  const [open, setOpen] = useState(initiallyOpen);
  const rootRef = useRef<HTMLDivElement>(null);
  const { armFocus } = useFocusAfterClose({ isOpen: open, rootRef });

  useEffect(() => {
    if (arm) {
      armFocus();
    }
    // Close the drawer on mount to trigger the effect
    // In real usage armFocus is called just before closing
    setOpen(false);
  }, [arm, armFocus]);

  return (
    <div>
      <div ref={rootRef} data-testid="root" tabIndex={-1}>
        {withGrid ? (
          <div role="grid" data-testid="grid" tabIndex={-1} />
        ) : (
          <div data-testid="no-grid" />
        )}
      </div>
      <button data-testid="other">Other</button>
    </div>
  );
};

describe('useFocusAfterClose', () => {
  let originalRaf: typeof globalThis.requestAnimationFrame;

  beforeEach(() => {
    vi.restoreAllMocks();
    originalRaf = globalThis.requestAnimationFrame;
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(performance.now());
      return 1 as unknown as number;
    });
  });

  it('focuses [role="grid"] after close when armed', () => {
    render(<TestComponent initiallyOpen={true} withGrid={true} arm={true} />);

    const active = document.activeElement as HTMLElement | null;
    expect(active).toBeTruthy();
    expect(active?.getAttribute('role')).toBe('grid');
  });

  it('falls back to root container when no grid is present', () => {
    render(<TestComponent initiallyOpen={true} withGrid={false} arm={true} />);

    const active = document.activeElement as HTMLElement | null;
    expect(active).toBeTruthy();
    expect(active?.getAttribute('data-testid')).toBe('root');
  });

  it('does nothing when not armed', () => {
    render(<TestComponent initiallyOpen={true} withGrid={true} arm={false} />);
    const active = document.activeElement as HTMLElement | null;

    expect(active?.getAttribute('role')).not.toBe('grid');
  });

  afterEach(() => {
    vi.stubGlobal('requestAnimationFrame', originalRaf);
  });
});
