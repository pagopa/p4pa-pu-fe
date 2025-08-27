/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Control } from 'react-hook-form';
import { i18nTestSetup } from '../../../__tests__/i18nTestSetup';
import { LegacyAuthConfiguration } from './LegacyAuthConfiguration';
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
    ),
    ControlledSelect: ({ name, label, required, options }: any) => (
      <div data-testid={`select-${name}`}>
        <label htmlFor={name}>
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
        <select id={name} name={name} required={required}>
          {options?.map((option: any, index: number) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    )
  }
}));

vi.mock('./BasicAuthFields', () => ({
  BasicAuthFields: ({ control, t }: any) => (
    <div data-testid="basic-auth-fields">
      <span>Basic Auth Component</span>
      <span>Control: {typeof control}</span>
      <span>T Function: {typeof t}</span>
    </div>
  )
}));

vi.mock('./JwtAuthFields', () => ({
  JwtAuthFields: ({ control, t }: any) => (
    <div data-testid="jwt-auth-fields">
      <span>JWT Auth Component</span>
      <span>Control: {typeof control}</span>
      <span>T Function: {typeof t}</span>
    </div>
  )
}));

vi.mock('../utils/orgSilServiceFormUtils', () => ({
  AUTH_CONFIG_OPTIONS: [
    { value: 'basic', label: 'authConfig.basic' },
    { value: 'jwt', label: 'authConfig.jwt' }
  ]
}));

describe('LegacyAuthConfiguration', () => {
  const mockControl = {} as Control<OrgSilServiceFormData>;
  const mockT = vi.fn((key: string) => {
    const translations: Record<string, string> = {
      'orgSilServiceCreate.authConfig': 'Authentication Configuration',
      'authConfig.basic': 'Basic Authentication',
      'authConfig.jwt': 'JWT Authentication'
    };
    return translations[key] || key;
  });

  const defaultProps = {
    control: mockControl,
    authConfigType: undefined,
    t: mockT
  };

  beforeEach(() => {
    vi.clearAllMocks();
    i18nTestSetup({
      'orgSilServiceCreate.authConfig': 'Authentication Configuration',
      'authConfig.basic': 'Basic Authentication',
      'authConfig.jwt': 'JWT Authentication'
    });
  });

  describe('Basic Rendering', () => {
    it('should render the auth config type selector', () => {
      render(<LegacyAuthConfiguration {...defaultProps} />);

      expect(screen.getByTestId('select-authConfigType')).toBeInTheDocument();
      expect(
        screen.getByText('Authentication Configuration')
      ).toBeInTheDocument();
    });

    it('should render auth config options correctly', () => {
      render(<LegacyAuthConfiguration {...defaultProps} />);

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(2);
      expect(options[0]).toHaveTextContent('Basic Authentication');
      expect(options[1]).toHaveTextContent('JWT Authentication');
    });

    it('should mark auth config selector as required', () => {
      render(<LegacyAuthConfiguration {...defaultProps} />);

      const select = screen.getByRole('combobox', {
        name: /Authentication Configuration/i
      });
      expect(select).toHaveAttribute('required');

      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('Conditional Rendering', () => {
    it('should NOT render auth fields when authConfigType is undefined', () => {
      render(<LegacyAuthConfiguration {...defaultProps} />);

      expect(screen.queryByTestId('basic-auth-fields')).not.toBeInTheDocument();
      expect(screen.queryByTestId('jwt-auth-fields')).not.toBeInTheDocument();

      expect(screen.getByTestId('select-authConfigType')).toBeInTheDocument();
    });

    it('should render BasicAuthFields when authConfigType is "basic"', () => {
      render(
        <LegacyAuthConfiguration {...defaultProps} authConfigType="basic" />
      );

      expect(screen.getByTestId('basic-auth-fields')).toBeInTheDocument();
      expect(screen.getByText('Basic Auth Component')).toBeInTheDocument();

      expect(screen.queryByTestId('jwt-auth-fields')).not.toBeInTheDocument();

      expect(screen.getByTestId('select-authConfigType')).toBeInTheDocument();
    });

    it('should render JwtAuthFields when authConfigType is "jwt"', () => {
      render(
        <LegacyAuthConfiguration {...defaultProps} authConfigType="jwt" />
      );

      expect(screen.getByTestId('jwt-auth-fields')).toBeInTheDocument();
      expect(screen.getByText('JWT Auth Component')).toBeInTheDocument();

      expect(screen.queryByTestId('basic-auth-fields')).not.toBeInTheDocument();

      expect(screen.getByTestId('select-authConfigType')).toBeInTheDocument();
    });

    it('should handle invalid authConfigType values', () => {
      render(
        <LegacyAuthConfiguration
          {...defaultProps}
          authConfigType="invalid-type"
        />
      );

      expect(screen.getByTestId('select-authConfigType')).toBeInTheDocument();

      expect(screen.queryByTestId('basic-auth-fields')).not.toBeInTheDocument();
      expect(screen.queryByTestId('jwt-auth-fields')).not.toBeInTheDocument();
    });
  });

  describe('State Transitions', () => {
    it('should switch between auth types correctly', () => {
      const { rerender } = render(
        <LegacyAuthConfiguration {...defaultProps} authConfigType="basic" />
      );

      expect(screen.getByTestId('basic-auth-fields')).toBeInTheDocument();
      expect(screen.queryByTestId('jwt-auth-fields')).not.toBeInTheDocument();

      rerender(
        <LegacyAuthConfiguration {...defaultProps} authConfigType="jwt" />
      );

      expect(screen.queryByTestId('basic-auth-fields')).not.toBeInTheDocument();
      expect(screen.getByTestId('jwt-auth-fields')).toBeInTheDocument();

      rerender(
        <LegacyAuthConfiguration {...defaultProps} authConfigType={undefined} />
      );

      expect(screen.queryByTestId('basic-auth-fields')).not.toBeInTheDocument();
      expect(screen.queryByTestId('jwt-auth-fields')).not.toBeInTheDocument();
    });

    it('should maintain selector visibility through all transitions', () => {
      const authTypes = [undefined, 'basic', 'jwt', undefined];

      const { rerender } = render(
        <LegacyAuthConfiguration {...defaultProps} />
      );

      authTypes.forEach((authType) => {
        rerender(
          <LegacyAuthConfiguration
            {...defaultProps}
            authConfigType={authType}
          />
        );

        expect(screen.getByTestId('select-authConfigType')).toBeInTheDocument();
      });
    });
  });

  describe('Props Passing to Child Components', () => {
    it('should pass control and t props to BasicAuthFields', () => {
      render(
        <LegacyAuthConfiguration {...defaultProps} authConfigType="basic" />
      );

      expect(screen.getByTestId('basic-auth-fields')).toBeInTheDocument();
      expect(screen.getByText('Control: object')).toBeInTheDocument();
      expect(screen.getByText('T Function: function')).toBeInTheDocument();
    });

    it('should pass control and t props to JwtAuthFields', () => {
      render(
        <LegacyAuthConfiguration {...defaultProps} authConfigType="jwt" />
      );

      expect(screen.getByTestId('jwt-auth-fields')).toBeInTheDocument();
      expect(screen.getByText('Control: object')).toBeInTheDocument();
      expect(screen.getByText('T Function: function')).toBeInTheDocument();
    });

    it('should handle different prop types for child components', () => {
      const customControl = {
        customProp: 'test'
      } as any as Control<OrgSilServiceFormData>;
      const customT = vi.fn((key: string) => `CUSTOM_${key}`);

      render(
        <LegacyAuthConfiguration
          control={customControl}
          authConfigType="basic"
          t={customT}
        />
      );

      expect(screen.getByText('Control: object')).toBeInTheDocument();
      expect(screen.getByText('T Function: function')).toBeInTheDocument();
    });
  });

  describe('Translation Integration', () => {
    it('should translate auth config selector label', () => {
      render(<LegacyAuthConfiguration {...defaultProps} />);

      expect(mockT).toHaveBeenCalledWith('orgSilServiceCreate.authConfig');
      expect(
        screen.getByText('Authentication Configuration')
      ).toBeInTheDocument();
    });

    it('should translate auth config options', () => {
      render(<LegacyAuthConfiguration {...defaultProps} />);

      expect(mockT).toHaveBeenCalledWith('authConfig.basic');
      expect(mockT).toHaveBeenCalledWith('authConfig.jwt');

      expect(screen.getByText('Basic Authentication')).toBeInTheDocument();
      expect(screen.getByText('JWT Authentication')).toBeInTheDocument();
    });

    it('should map options correctly with translations', () => {
      render(<LegacyAuthConfiguration {...defaultProps} />);

      const basicOption = screen.getByRole('option', {
        name: /Basic Authentication/i
      });
      const jwtOption = screen.getByRole('option', {
        name: /JWT Authentication/i
      });

      expect(basicOption).toHaveValue('basic');
      expect(jwtOption).toHaveValue('jwt');
    });

    it('should handle missing translations for options', () => {
      const mockTWithMissing = vi.fn((key: string) => {
        if (key === 'authConfig.basic') return key;
        return mockT(key);
      });

      render(
        <LegacyAuthConfiguration {...defaultProps} t={mockTWithMissing} />
      );

      expect(screen.getByText('authConfig.basic')).toBeInTheDocument();
      expect(screen.getByText('JWT Authentication')).toBeInTheDocument();
    });
  });

  describe('Component Structure and Layout', () => {
    it('should use Stack component for proper layout', () => {
      const { container } = render(
        <LegacyAuthConfiguration {...defaultProps} />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should maintain proper component hierarchy', () => {
      render(
        <LegacyAuthConfiguration {...defaultProps} authConfigType="basic" />
      );

      expect(screen.getByTestId('select-authConfigType')).toBeInTheDocument();

      expect(screen.getByTestId('basic-auth-fields')).toBeInTheDocument();

      const authConfigSelect = screen.getByTestId('select-authConfigType');
      const basicFields = screen.getByTestId('basic-auth-fields');

      expect(authConfigSelect.compareDocumentPosition(basicFields)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      );
    });

    it('should handle spacing between components', () => {
      render(
        <LegacyAuthConfiguration {...defaultProps} authConfigType="jwt" />
      );

      expect(screen.getByTestId('select-authConfigType')).toBeInTheDocument();
      expect(screen.getByTestId('jwt-auth-fields')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null authConfigType', () => {
      render(
        <LegacyAuthConfiguration
          {...defaultProps}
          authConfigType={null as any}
        />
      );

      expect(screen.getByTestId('select-authConfigType')).toBeInTheDocument();
      expect(screen.queryByTestId('basic-auth-fields')).not.toBeInTheDocument();
      expect(screen.queryByTestId('jwt-auth-fields')).not.toBeInTheDocument();
    });

    it('should handle empty string authConfigType', () => {
      render(<LegacyAuthConfiguration {...defaultProps} authConfigType="" />);

      expect(screen.getByTestId('select-authConfigType')).toBeInTheDocument();
      expect(screen.queryByTestId('basic-auth-fields')).not.toBeInTheDocument();
      expect(screen.queryByTestId('jwt-auth-fields')).not.toBeInTheDocument();
    });

    it('should handle case-sensitive authConfigType values', () => {
      render(
        <LegacyAuthConfiguration {...defaultProps} authConfigType="BASIC" />
      );

      expect(screen.queryByTestId('basic-auth-fields')).not.toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('should handle different control objects', () => {
      const alternativeControl = {
        customProperty: 'test'
      } as any as Control<OrgSilServiceFormData>;

      expect(() => {
        render(
          <LegacyAuthConfiguration
            control={alternativeControl}
            authConfigType="basic"
            t={mockT}
          />
        );
      }).not.toThrow();

      expect(screen.getByTestId('basic-auth-fields')).toBeInTheDocument();
    });

    it('should handle different translation functions', () => {
      const alternativeT = vi.fn((key: string) => `TEST_${key}`);

      render(
        <LegacyAuthConfiguration
          control={mockControl}
          authConfigType="jwt"
          t={alternativeT}
        />
      );

      expect(alternativeT).toHaveBeenCalledWith(
        'orgSilServiceCreate.authConfig'
      );
      expect(
        screen.getByText('TEST_orgSilServiceCreate.authConfig')
      ).toBeInTheDocument();
    });

    it('should work with minimal required props', () => {
      const minimalProps = {
        control: {} as Control<OrgSilServiceFormData>,
        authConfigType: undefined as string | undefined,
        t: (key: string) => key
      };

      expect(() => {
        render(<LegacyAuthConfiguration {...minimalProps} />);
      }).not.toThrow();

      expect(screen.getByTestId('select-authConfigType')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('should integrate properly with both child components', () => {
      const { rerender } = render(
        <LegacyAuthConfiguration {...defaultProps} authConfigType="basic" />
      );

      expect(screen.getByTestId('select-authConfigType')).toBeInTheDocument();
      expect(screen.getByTestId('basic-auth-fields')).toBeInTheDocument();

      rerender(
        <LegacyAuthConfiguration {...defaultProps} authConfigType="jwt" />
      );

      expect(screen.getByTestId('select-authConfigType')).toBeInTheDocument();
      expect(screen.getByTestId('jwt-auth-fields')).toBeInTheDocument();
    });

    it('should maintain consistent structure across all states', () => {
      const authTypes = [undefined, 'basic', 'jwt'];

      authTypes.forEach((authType) => {
        const { unmount } = render(
          <LegacyAuthConfiguration
            {...defaultProps}
            authConfigType={authType}
          />
        );

        expect(screen.getByTestId('select-authConfigType')).toBeInTheDocument();

        unmount();
      });
    });

    it('should pass correct props to child components', () => {
      render(
        <LegacyAuthConfiguration {...defaultProps} authConfigType="basic" />
      );

      const basicAuthComponent = screen.getByTestId('basic-auth-fields');
      expect(basicAuthComponent).toBeInTheDocument();

      expect(screen.getByText('Control: object')).toBeInTheDocument();
      expect(screen.getByText('T Function: function')).toBeInTheDocument();
    });
  });

  describe('Option Mapping and Translation', () => {
    it('should map AUTH_CONFIG_OPTIONS correctly', () => {
      render(<LegacyAuthConfiguration {...defaultProps} />);

      expect(mockT).toHaveBeenCalledWith('authConfig.basic');
      expect(mockT).toHaveBeenCalledWith('authConfig.jwt');

      const basicOption = screen.getByRole('option', {
        name: /Basic Authentication/i
      });
      const jwtOption = screen.getByRole('option', {
        name: /JWT Authentication/i
      });

      expect(basicOption).toHaveValue('basic');
      expect(jwtOption).toHaveValue('jwt');
    });

    it('should preserve option structure from AUTH_CONFIG_OPTIONS', () => {
      render(<LegacyAuthConfiguration {...defaultProps} />);

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(2);

      expect(options[0]).toHaveValue('basic');
      expect(options[1]).toHaveValue('jwt');
    });
  });
});
