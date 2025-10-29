import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../__tests__/renderers';
import { HomeDrawerBody } from './HomeDrawerBody';
import { i18nTestSetup } from '../../../__tests__/i18nTestSetup';

describe('HomeDrawerBody', () => {
  beforeEach(() => {
    i18nTestSetup({
      'home.tabs.1.label': 'Label for tab 1'
    });
  });

  it('HomeDrawerBody renders correctly', () => {
    const searchLabel = '1';
    const searchValue = 'testValue';

    render(
      <HomeDrawerBody searchLabel={searchLabel} searchValue={searchValue} />
    );

    expect(screen.getByText('Label for tab 1')).toBeInTheDocument();
    expect(screen.getByText('testValue')).toBeInTheDocument();
    expect(screen.getByText('Visit the link')).toBeInTheDocument();
    expect(screen.getByText('Download the file')).toBeInTheDocument();
  });
});
