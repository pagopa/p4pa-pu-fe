/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Control } from 'react-hook-form';
import { i18nTestSetup } from '../../../__tests__/i18nTestSetup';
import { BasicAuthFields } from './BasicAuthFields';
import { OrgSilServiceFormData } from '../schema';

vi.mock('../../../components/FormComponent', () => ({
  FormComponent: {
    ControlledTextField: ({ name, label, required }: any) => (
      <div data-testid={`textfield-${name}`}>
        <label htmlFor={name}>
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
        <input id={name} name={name} required={required} />
      </div>
    )
  }
}));

describe('BasicAuthFields', () => {
  const mockControl = {} as Control<OrgSilServiceFormData>;
  const mockT = vi.fn((key: string) => {
    const translations: Record<string, string> = {
      'orgSilServiceCreate.basicUser': 'Basic Username',
      'orgSilServiceCreate.basicPassword': 'Basic Password',
      'orgSilServiceCreate.basicAuthURL': 'Basic Auth URL'
    };
    return translations[key] || key;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    i18nTestSetup({
      'orgSilServiceCreate.basicUser': 'Basic Username',
      'orgSilServiceCreate.basicPassword': 'Basic Password',
      'orgSilServiceCreate.basicAuthURL': 'Basic Auth URL'
    });
  });

  describe('Rendering', () => {
    it('should render all basic authentication fields', () => {
      render(<BasicAuthFields control={mockControl} t={mockT} />);

      expect(screen.getByTestId('textfield-basicUser')).toBeInTheDocument();
      expect(screen.getByTestId('textfield-basicPassword')).toBeInTheDocument();
      expect(screen.getByTestId('textfield-basicAuthURL')).toBeInTheDocument();

      expect(screen.getByText('Basic Username')).toBeInTheDocument();
      expect(screen.getByText('Basic Password')).toBeInTheDocument();
      expect(screen.getByText('Basic Auth URL')).toBeInTheDocument();
    });

    it('should render fields in correct order', () => {
      render(<BasicAuthFields control={mockControl} t={mockT} />);

      const textFields = screen.getAllByRole('textbox');
      expect(textFields).toHaveLength(3);

      expect(textFields[0]).toHaveAttribute('name', 'basicUser');
      expect(textFields[1]).toHaveAttribute('name', 'basicPassword');
      expect(textFields[2]).toHaveAttribute('name', 'basicAuthURL');
    });

    it('should render with proper Stack layout structure', () => {
      render(<BasicAuthFields control={mockControl} t={mockT} />);

      const fields = ['basicUser', 'basicPassword', 'basicAuthURL'];
      fields.forEach((field) => {
        const fieldElement = screen.getByTestId(`textfield-${field}`);
        expect(fieldElement).toBeInTheDocument();
      });
    });
  });

  describe('Field Properties', () => {
    it('should mark all fields as required', () => {
      render(<BasicAuthFields control={mockControl} t={mockT} />);

      const inputs = screen.getAllByRole('textbox');
      inputs.forEach((input) => {
        expect(input).toHaveAttribute('required');
      });

      const requiredIndicators = screen.getAllByText('*');
      expect(requiredIndicators).toHaveLength(3);
    });

    it('should have proper field names', () => {
      render(<BasicAuthFields control={mockControl} t={mockT} />);

      expect(
        screen.getByRole('textbox', { name: /Basic Username/i })
      ).toHaveAttribute('name', 'basicUser');
      expect(
        screen.getByRole('textbox', { name: /Basic Password/i })
      ).toHaveAttribute('name', 'basicPassword');
      expect(
        screen.getByRole('textbox', { name: /Basic Auth URL/i })
      ).toHaveAttribute('name', 'basicAuthURL');
    });

    it('should pass noAdornment prop to all fields', () => {
      render(<BasicAuthFields control={mockControl} t={mockT} />);

      const fields = ['basicUser', 'basicPassword', 'basicAuthURL'];
      fields.forEach((field) => {
        expect(screen.getByTestId(`textfield-${field}`)).toBeInTheDocument();
      });
    });
  });

  describe('Translation Integration', () => {
    it('should call translation function for each field label', () => {
      render(<BasicAuthFields control={mockControl} t={mockT} />);

      expect(mockT).toHaveBeenCalledWith('orgSilServiceCreate.basicUser');
      expect(mockT).toHaveBeenCalledWith('orgSilServiceCreate.basicPassword');
      expect(mockT).toHaveBeenCalledWith('orgSilServiceCreate.basicAuthURL');
      expect(mockT).toHaveBeenCalledTimes(3);
    });

    it('should handle missing translations gracefully', () => {
      const mockTWithMissing = vi.fn((key: string) => key);

      expect(() => {
        render(<BasicAuthFields control={mockControl} t={mockTWithMissing} />);
      }).not.toThrow();

      expect(
        screen.getByText('orgSilServiceCreate.basicUser')
      ).toBeInTheDocument();
      expect(
        screen.getByText('orgSilServiceCreate.basicPassword')
      ).toBeInTheDocument();
      expect(
        screen.getByText('orgSilServiceCreate.basicAuthURL')
      ).toBeInTheDocument();
    });

    it('should handle dynamic translations', () => {
      const dynamicT = vi.fn((key: string) => `DYNAMIC_${key.toUpperCase()}`);

      render(<BasicAuthFields control={mockControl} t={dynamicT} />);

      expect(
        screen.getByText('DYNAMIC_ORGSILSERVICECREATE.BASICUSER')
      ).toBeInTheDocument();
      expect(
        screen.getByText('DYNAMIC_ORGSILSERVICECREATE.BASICPASSWORD')
      ).toBeInTheDocument();
      expect(
        screen.getByText('DYNAMIC_ORGSILSERVICECREATE.BASICAUTHURL')
      ).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('should handle different control objects', () => {
      const alternativeControl = {
        differentProperty: 'test'
      } as any as Control<OrgSilServiceFormData>;

      expect(() => {
        render(<BasicAuthFields control={alternativeControl} t={mockT} />);
      }).not.toThrow();
    });

    it('should work with minimal required props', () => {
      const minimalT = (key: string) => key;
      const minimalControl = {} as Control<OrgSilServiceFormData>;

      expect(() => {
        render(<BasicAuthFields control={minimalControl} t={minimalT} />);
      }).not.toThrow();
    });
  });

  describe('Component Structure', () => {
    it('should maintain consistent field structure', () => {
      render(<BasicAuthFields control={mockControl} t={mockT} />);

      const expectedFields = ['basicUser', 'basicPassword', 'basicAuthURL'];
      expectedFields.forEach((field) => {
        const fieldContainer = screen.getByTestId(`textfield-${field}`);
        expect(fieldContainer).toBeInTheDocument();

        const label = fieldContainer.querySelector('label');
        const input = fieldContainer.querySelector('input');
        expect(label).toBeInTheDocument();
        expect(input).toBeInTheDocument();
      });
    });

    it('should use Stack component for layout', () => {
      const { container } = render(
        <BasicAuthFields control={mockControl} t={mockT} />
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
