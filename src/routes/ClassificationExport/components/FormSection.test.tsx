import { describe, expect, it } from 'vitest';
import { render, screen } from '../../../__tests__/renderers';
import { FormSection } from './FormSection';
import {
  Receipt,
  PlaylistAddCheck,
  RequestPage,
  Inventory,
  AccountTree
} from '@mui/icons-material';
import { TextField, Button } from '@mui/material';

describe('FormSection', () => {
  describe('Basic Rendering', () => {
    it('should render with title and icon', () => {
      const testIcon = <Receipt data-testid="test-icon" />;
      const testTitle = 'Test Section Title';

      render(
        <FormSection icon={testIcon} title={testTitle}>
          <div>Test content</div>
        </FormSection>
      );

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(screen.getByText(testTitle)).toBeInTheDocument();
    });

    it('should render children content', () => {
      const testContent = 'This is test content';

      render(
        <FormSection icon={<PlaylistAddCheck />} title="Test Title">
          <div data-testid="test-content">{testContent}</div>
        </FormSection>
      );

      expect(screen.getByTestId('test-content')).toBeInTheDocument();
      expect(screen.getByText(testContent)).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <FormSection icon={<RequestPage />} title="Test Title">
          <div data-testid="child-1">First child</div>
          <div data-testid="child-2">Second child</div>
          <div data-testid="child-3">Third child</div>
        </FormSection>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByTestId('child-3')).toBeInTheDocument();
    });
  });

  describe('Different Content Types', () => {
    it('should render with form inputs as children', () => {
      render(
        <FormSection icon={<Inventory />} title="User Information">
          <TextField label="Name" data-testid="name-input" fullWidth />
          <TextField
            label="Email"
            data-testid="email-input"
            fullWidth
            sx={{ mt: 2 }}
          />
        </FormSection>
      );

      expect(screen.getByTestId('name-input')).toBeInTheDocument();
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
      expect(screen.getByText('User Information')).toBeInTheDocument();
    });

    it('should render with buttons as children', () => {
      render(
        <FormSection icon={<AccountTree />} title="Actions">
          <Button data-testid="save-button">Save</Button>
          <Button data-testid="cancel-button">Cancel</Button>
        </FormSection>
      );

      expect(screen.getByTestId('save-button')).toBeInTheDocument();
      expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
    });

    it('should render with complex nested content', () => {
      render(
        <FormSection icon={<Receipt />} title="Complex Section">
          <div data-testid="wrapper">
            <p>Some text</p>
            <div>
              <span>Nested content</span>
              <ul>
                <li data-testid="list-item-1">Item 1</li>
                <li data-testid="list-item-2">Item 2</li>
              </ul>
            </div>
          </div>
        </FormSection>
      );

      expect(screen.getByTestId('wrapper')).toBeInTheDocument();
      expect(screen.getByText('Some text')).toBeInTheDocument();
      expect(screen.getByText('Nested content')).toBeInTheDocument();
      expect(screen.getByTestId('list-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('list-item-2')).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('should handle different MUI Italia icon types', () => {
      const { rerender } = render(
        <FormSection icon={<Receipt data-testid="receipt-icon" />} title="Test">
          <div>Content</div>
        </FormSection>
      );

      expect(screen.getByTestId('receipt-icon')).toBeInTheDocument();

      rerender(
        <FormSection
          icon={<PlaylistAddCheck data-testid="playlist-icon" />}
          title="Test"
        >
          <div>Content</div>
        </FormSection>
      );

      expect(screen.getByTestId('playlist-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('receipt-icon')).not.toBeInTheDocument();
    });

    it('should handle all classification export page icons', () => {
      const iconTests = [
        { icon: <Receipt data-testid="receipt" />, name: 'receipt' },
        { icon: <PlaylistAddCheck data-testid="playlist" />, name: 'playlist' },
        { icon: <RequestPage data-testid="request" />, name: 'request' },
        { icon: <Inventory data-testid="inventory" />, name: 'inventory' },
        {
          icon: <AccountTree data-testid="account-tree" />,
          name: 'account-tree'
        }
      ];

      iconTests.forEach(({ icon, name }) => {
        const { unmount } = render(
          <FormSection icon={icon} title={`${name} Section`}>
            <div>Content</div>
          </FormSection>
        );

        expect(screen.getByTestId(name)).toBeInTheDocument();
        expect(screen.getByText(`${name} Section`)).toBeInTheDocument();
        unmount();
      });
    });

    it('should handle different title strings', () => {
      const titles = [
        'Classificazione pagamenti',
        'Versione tracciato',
        'Avviso',
        'Rendicontazione',
        'Tesoreria',
        'Title with Numbers 123',
        'Title with Special Characters !@#$%',
        'Very Long Title That Contains Many Words And Should Still Work Properly'
      ];

      titles.forEach((title) => {
        const { unmount } = render(
          <FormSection icon={<Receipt />} title={title}>
            <div>Content</div>
          </FormSection>
        );

        expect(screen.getByText(title)).toBeInTheDocument();
        unmount();
      });
    });

    it('should handle empty string title', () => {
      render(
        <FormSection icon={<Receipt />} title="">
          <div data-testid="content">Content</div>
        </FormSection>
      );

      expect(screen.getByTestId('content')).toBeInTheDocument();
      const titleElement = screen.getByRole('paragraph');
      expect(titleElement).toHaveTextContent('');
    });

    it('should handle custom icon components', () => {
      const CustomIcon = () => (
        <svg data-testid="custom-icon" width="24" height="24">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );

      render(
        <FormSection icon={<CustomIcon />} title="Custom Icon Test">
          <div>Content</div>
        </FormSection>
      );

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });
  });

  describe('Structure and Layout', () => {
    it('should have proper container structure', () => {
      render(
        <FormSection icon={<Receipt />} title="Test Title">
          <div data-testid="content">Test content</div>
        </FormSection>
      );

      const container = screen
        .getByText('Test Title')
        .closest('div')?.parentElement;
      expect(container).toBeInTheDocument();

      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('should maintain icon and title relationship', () => {
      render(
        <FormSection
          icon={<PlaylistAddCheck data-testid="section-icon" />}
          title="Section Title"
        >
          <div>Content</div>
        </FormSection>
      );

      const icon = screen.getByTestId('section-icon');
      const title = screen.getByText('Section Title');

      expect(icon.parentElement).toContain(title.parentElement);
    });
  });

  describe('Content Flexibility', () => {
    it('should render with no children', () => {
      render(
        <FormSection icon={<Receipt />} title="Empty Section">
          {null}
        </FormSection>
      );

      expect(screen.getByText('Empty Section')).toBeInTheDocument();
    });

    it('should render with conditional children', () => {
      const showContent = true;

      render(
        <FormSection icon={<RequestPage />} title="Conditional Content">
          {showContent && (
            <div data-testid="conditional-content">Visible content</div>
          )}
          {!showContent && (
            <div data-testid="hidden-content">Hidden content</div>
          )}
        </FormSection>
      );

      expect(screen.getByTestId('conditional-content')).toBeInTheDocument();
      expect(screen.queryByTestId('hidden-content')).not.toBeInTheDocument();
    });

    it('should render with React fragments as children', () => {
      render(
        <FormSection icon={<Inventory />} title="Fragment Content">
          <>
            <div data-testid="fragment-child-1">First</div>
            <div data-testid="fragment-child-2">Second</div>
          </>
        </FormSection>
      );

      expect(screen.getByTestId('fragment-child-1')).toBeInTheDocument();
      expect(screen.getByTestId('fragment-child-2')).toBeInTheDocument();
    });

    it('should render with string content', () => {
      const textContent = 'Simple string content';

      render(
        <FormSection icon={<AccountTree />} title="String Content">
          {textContent}
        </FormSection>
      );

      expect(screen.getByText(textContent)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper typography structure', () => {
      render(
        <FormSection icon={<Receipt />} title="Accessible Title">
          <div>Content</div>
        </FormSection>
      );

      const titleElement = screen.getByText('Accessible Title');
      expect(titleElement).toBeInTheDocument();
      expect(titleElement.tagName.toLowerCase()).toBe('p');
    });

    it('should maintain proper document structure with multiple sections', () => {
      render(
        <div>
          <FormSection icon={<Receipt />} title="First Section">
            <div>First content</div>
          </FormSection>
          <FormSection icon={<PlaylistAddCheck />} title="Second Section">
            <div>Second content</div>
          </FormSection>
        </div>
      );

      expect(screen.getByText('First Section')).toBeInTheDocument();
      expect(screen.getByText('Second Section')).toBeInTheDocument();

      expect(screen.getByText('First Section').tagName.toLowerCase()).toBe('p');
      expect(screen.getByText('Second Section').tagName.toLowerCase()).toBe(
        'p'
      );
    });
  });

  describe('Real-world Usage Scenarios', () => {
    it('should work like the classification export page sections', () => {
      render(
        <div>
          <FormSection
            icon={<PlaylistAddCheck />}
            title="Classificazione pagamenti"
          >
            <TextField label="Tipo classificazione" />
          </FormSection>
          <FormSection icon={<AccountTree />} title="Versione tracciato">
            <TextField label="Versione file" />
          </FormSection>
          <FormSection icon={<Receipt />} title="Avviso">
            <TextField label="IUV" />
            <TextField label="Oggetto del pagamento" />
          </FormSection>
          <FormSection icon={<RequestPage />} title="Rendicontazione">
            <TextField label="IUR Rendicontazione" />
          </FormSection>
          <FormSection icon={<Inventory />} title="Tesoreria">
            <TextField label="Importo" type="number" />
            <TextField label="Codice conto" />
          </FormSection>
        </div>
      );

      expect(screen.getByText('Classificazione pagamenti')).toBeInTheDocument();
      expect(screen.getByText('Versione tracciato')).toBeInTheDocument();
      expect(screen.getByText('Avviso')).toBeInTheDocument();
      expect(screen.getByText('Rendicontazione')).toBeInTheDocument();
      expect(screen.getByText('Tesoreria')).toBeInTheDocument();

      expect(screen.getByLabelText('Tipo classificazione')).toBeInTheDocument();
      expect(screen.getByLabelText('IUV')).toBeInTheDocument();
      expect(screen.getByLabelText('Importo')).toBeInTheDocument();
      expect(screen.getByLabelText('Versione file')).toBeInTheDocument();
      expect(screen.getByLabelText('IUR Rendicontazione')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long content', () => {
      const longContent = 'A'.repeat(1000);

      render(
        <FormSection icon={<Receipt />} title="Long Content">
          <div data-testid="long-content">{longContent}</div>
        </FormSection>
      );

      expect(screen.getByTestId('long-content')).toHaveTextContent(longContent);
    });

    it('should handle special characters in content', () => {
      const specialContent = '!@#$%^&*()_+{}|:"<>?[];\'./,';

      render(
        <FormSection icon={<Receipt />} title="Special Characters">
          <div data-testid="special-content">{specialContent}</div>
        </FormSection>
      );

      expect(screen.getByTestId('special-content')).toHaveTextContent(
        specialContent
      );
    });

    it('should handle numeric content', () => {
      render(
        <FormSection icon={<Receipt />} title="Numeric Content">
          <div data-testid="number-content">{12345.67}</div>
        </FormSection>
      );

      expect(screen.getByTestId('number-content')).toHaveTextContent(
        '12345.67'
      );
    });
  });
});
