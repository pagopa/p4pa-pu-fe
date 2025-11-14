import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '../__tests__/renderers';
import { useRef, useState } from 'react';
import { useDataGridTabNavigation } from './useDataGridTabNavigation';

const TestComponent = ({
  withGrid = true,
  initialTabIndex = -1,
  rows = []
}: {
  withGrid?: boolean;
  initialTabIndex?: number;
  rows?: Array<unknown>;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setRows] = useState(rows);

  useDataGridTabNavigation({
    containerRef,
    rows
  });

  const changeRows = () => {
    setRows([{ id: 1 }, { id: 2 }]);
  };

  return (
    <div>
      <div ref={containerRef} data-testid="container">
        {withGrid ? (
          <div role="grid" data-testid="grid" tabIndex={initialTabIndex} />
        ) : (
          <div data-testid="no-grid" />
        )}
      </div>
      <button data-testid="change-rows" onClick={changeRows}>
        Change Rows
      </button>
    </div>
  );
};

describe('useDataGridTabNavigation', () => {
  let originalRaf: typeof globalThis.requestAnimationFrame;
  let rafCallbacks: Array<FrameRequestCallback>;

  beforeEach(() => {
    vi.restoreAllMocks();
    rafCallbacks = [];
    originalRaf = globalThis.requestAnimationFrame;
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCallbacks.push(cb);
      return 1 as unknown as number;
    });
  });

  afterEach(() => {
    vi.stubGlobal('requestAnimationFrame', originalRaf);
  });

  const flushRaf = () => {
    const callbacks = [...rafCallbacks];
    rafCallbacks = [];
    callbacks.forEach((cb) => cb(performance.now()));
  };

  it('should add tabIndex={0} to grid element when tabIndex < 0', () => {
    render(<TestComponent withGrid={true} initialTabIndex={-1} />);

    flushRaf(); // First RAF
    flushRaf(); // Second RAF (nested)

    const grid = document.querySelector('[role="grid"]') as HTMLElement;
    expect(grid).toBeTruthy();
    expect(grid.tabIndex).toBe(0);
  });

  it('should not modify tabIndex when it is already >= 0', () => {
    render(<TestComponent withGrid={true} initialTabIndex={0} />);

    flushRaf();
    flushRaf();

    const grid = document.querySelector('[role="grid"]') as HTMLElement;
    expect(grid).toBeTruthy();
    expect(grid.tabIndex).toBe(0);
  });

  it('should not modify tabIndex when it is already > 0', () => {
    render(<TestComponent withGrid={true} initialTabIndex={1} />);

    flushRaf();
    flushRaf();

    const grid = document.querySelector('[role="grid"]') as HTMLElement;
    expect(grid).toBeTruthy();
    expect(grid.tabIndex).toBe(1);
  });

  it('should handle missing container gracefully', () => {
    const TestComponentWithoutContainer = () => {
      const containerRef = useRef<HTMLDivElement>(null);
      useDataGridTabNavigation({
        containerRef,
        rows: []
      });
      return <div data-testid="no-container" />;
    };

    expect(() => {
      render(<TestComponentWithoutContainer />);
      flushRaf();
      flushRaf();
    }).not.toThrow();
  });

  it('should handle missing grid element gracefully', () => {
    render(<TestComponent withGrid={false} />);

    flushRaf();
    flushRaf();

    const grid = document.querySelector('[role="grid"]');
    expect(grid).toBeNull();
  });

  it('should update tabIndex when grid is added dynamically', async () => {
    const DynamicGridComponent = () => {
      const containerRef = useRef<HTMLDivElement>(null);
      const [showGrid, setShowGrid] = useState(false);

      useDataGridTabNavigation({
        containerRef,
        rows: []
      });

      return (
        <div>
          <div ref={containerRef} data-testid="container">
            {showGrid && <div role="grid" data-testid="grid" tabIndex={-1} />}
          </div>
          <button data-testid="add-grid" onClick={() => setShowGrid(true)}>
            Add Grid
          </button>
        </div>
      );
    };

    const { rerender } = render(<DynamicGridComponent />);
    flushRaf();
    flushRaf();

    // Verify grid is not present initially
    const grid = document.querySelector('[role="grid"]');
    expect(grid).toBeNull();

    // Add the grid by re-rendering with showGrid=true
    const UpdatedComponent = () => {
      const containerRef = useRef<HTMLDivElement>(null);
      useDataGridTabNavigation({
        containerRef,
        rows: []
      });

      return (
        <div>
          <div ref={containerRef} data-testid="container">
            <div role="grid" data-testid="grid" tabIndex={-1} />
          </div>
        </div>
      );
    };

    rerender(<UpdatedComponent />);
    flushRaf();
    flushRaf();

    // Wait for the grid to be processed
    await waitFor(
      () => {
        const gridElement = document.querySelector(
          '[role="grid"]'
        ) as HTMLElement;
        expect(gridElement).toBeTruthy();
        expect(gridElement.tabIndex).toBe(0);
      },
      { timeout: 1000 }
    );
  });

  it('should re-execute when rows change', () => {
    const { rerender } = render(
      <TestComponent withGrid={true} initialTabIndex={-1} rows={[]} />
    );

    flushRaf();
    flushRaf();

    let grid = document.querySelector('[role="grid"]') as HTMLElement;
    expect(grid.tabIndex).toBe(0);

    rerender(
      <TestComponent withGrid={true} initialTabIndex={-1} rows={[{ id: 1 }]} />
    );

    flushRaf();
    flushRaf();

    grid = document.querySelector('[role="grid"]') as HTMLElement;
    expect(grid.tabIndex).toBe(0);
  });

  it('should disconnect MutationObserver on unmount', () => {
    const disconnectSpy = vi.spyOn(MutationObserver.prototype, 'disconnect');

    const { unmount } = render(
      <TestComponent withGrid={true} initialTabIndex={-1} />
    );

    flushRaf();
    flushRaf();

    unmount();

    expect(disconnectSpy).toHaveBeenCalled();
    disconnectSpy.mockRestore();
  });

  it('should observe container with correct options', () => {
    const observeSpy = vi.spyOn(MutationObserver.prototype, 'observe');

    render(<TestComponent withGrid={true} initialTabIndex={-1} />);

    flushRaf();
    flushRaf();

    expect(observeSpy).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['role', 'tabindex']
      })
    );

    observeSpy.mockRestore();
  });
});
