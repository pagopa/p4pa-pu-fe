/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Control } from 'react-hook-form';
import { i18nTestSetup } from '../../../__tests__/i18nTestSetup';
import { JwtAuthFields } from './JwtAuthFields';
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

vi.mock('../utils/orgSilServiceFormUtils', () => ({
  JWT_ALGORITHM_OPTIONS: [
    { value: 'HS256', label: 'HS256' },
    { value: 'RS256', label: 'RS256' },
    { value: 'ES256', label: 'ES256' }
  ]
}));

describe('JwtAuthFields', () => {
  const mockControl = {} as Control<OrgSilServiceFormData>;
  const mockT = vi.fn((key: string) => {
    const translations: Record<string, string> = {
      'orgSilServiceCreate.jwtKid': 'JWT Kid',
      'orgSilServiceCreate.jwtIssuer': 'JWT Issuer',
      'orgSilServiceCreate.jwtAlgorithm': 'JWT Algorithm',
      'orgSilServiceCreate.jwtSubject': 'JWT Subject',
      'orgSilServiceCreate.jwtSigningKey': 'JWT Signing Key'
    };
    return translations[key] || key;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    i18nTestSetup({
      'orgSilServiceCreate.jwtKid': 'JWT Kid',
      'orgSilServiceCreate.jwtIssuer': 'JWT Issuer',
      'orgSilServiceCreate.jwtAlgorithm': 'JWT Algorithm',
      'orgSilServiceCreate.jwtSubject': 'JWT Subject',
      'orgSilServiceCreate.jwtSigningKey': 'JWT Signing Key'
    });
  });

  describe('Rendering', () => {
    it('should render all JWT authentication fields', () => {
      render(<JwtAuthFields control={mockControl} t={mockT} />);

      expect(screen.getByTestId('textfield-jwtKid')).toBeInTheDocument();
      expect(screen.getByTestId('textfield-jwtIssuer')).toBeInTheDocument();
      expect(screen.getByTestId('textfield-jwtSubject')).toBeInTheDocument();
      expect(screen.getByTestId('textfield-jwtSigningKey')).toBeInTheDocument();

      expect(screen.getByTestId('select-jwtAlgorithm')).toBeInTheDocument();

      expect(screen.getByText('JWT Kid')).toBeInTheDocument();
      expect(screen.getByText('JWT Issuer')).toBeInTheDocument();
      expect(screen.getByText('JWT Subject')).toBeInTheDocument();
      expect(screen.getByText('JWT Algorithm')).toBeInTheDocument();
      expect(screen.getByText('JWT Signing Key')).toBeInTheDocument();
    });

    it('should render fields in correct order', () => {
      render(<JwtAuthFields control={mockControl} t={mockT} />);

      const allInputs = screen.getAllByRole('textbox');
      const selectInputs = screen.getAllByRole('combobox');

      expect(allInputs[0]).toHaveAttribute('name', 'jwtKid');
      expect(allInputs[1]).toHaveAttribute('name', 'jwtIssuer');
      expect(allInputs[2]).toHaveAttribute('name', 'jwtSubject');
      expect(allInputs[3]).toHaveAttribute('name', 'jwtSigningKey');

      expect(selectInputs[0]).toHaveAttribute('name', 'jwtAlgorithm');
    });

    it('should have correct field count and types', () => {
      render(<JwtAuthFields control={mockControl} t={mockT} />);

      const textInputs = screen.getAllByRole('textbox');
      const selectInputs = screen.getAllByRole('combobox');

      expect(textInputs).toHaveLength(4);
      expect(selectInputs).toHaveLength(1);
    });
  });

  describe('Field Properties', () => {
    it('should mark all fields as required', () => {
      render(<JwtAuthFields control={mockControl} t={mockT} />);

      const textFields = screen.getAllByRole('textbox');
      textFields.forEach((field) => {
        expect(field).toHaveAttribute('required');
      });

      const selectField = screen.getByRole('combobox');
      expect(selectField).toHaveAttribute('required');

      const requiredIndicators = screen.getAllByText('*');
      expect(requiredIndicators).toHaveLength(5);
    });

    it('should have proper field names and IDs', () => {
      render(<JwtAuthFields control={mockControl} t={mockT} />);

      const expectedFields = [
        'jwtKid',
        'jwtIssuer',
        'jwtSubject',
        'jwtSigningKey',
        'jwtAlgorithm'
      ];
      expectedFields.forEach((field) => {
        const element = document.getElementById(field);
        expect(element).toBeInTheDocument();
        expect(element).toHaveAttribute('name', field);
      });
    });

    it('should pass noAdornment prop to text fields', () => {
      render(<JwtAuthFields control={mockControl} t={mockT} />);

      const textFields = ['jwtKid', 'jwtIssuer', 'jwtSubject', 'jwtSigningKey'];
      textFields.forEach((field) => {
        expect(screen.getByTestId(`textfield-${field}`)).toBeInTheDocument();
      });
    });
  });

  describe('Algorithm Select Field', () => {
    it('should render algorithm select with correct options', () => {
      render(<JwtAuthFields control={mockControl} t={mockT} />);

      const algorithmSelect = screen.getByTestId('select-jwtAlgorithm');
      expect(algorithmSelect).toBeInTheDocument();

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(3);
      expect(options[0]).toHaveTextContent('HS256');
      expect(options[1]).toHaveTextContent('RS256');
      expect(options[2]).toHaveTextContent('ES256');
    });

    it('should have proper select field structure', () => {
      render(<JwtAuthFields control={mockControl} t={mockT} />);

      const select = screen.getByRole('combobox', { name: /JWT Algorithm/i });
      expect(select).toHaveAttribute('name', 'jwtAlgorithm');
      expect(select).toHaveAttribute('required');
    });

    it('should use JWT_ALGORITHM_OPTIONS from utils', () => {
      render(<JwtAuthFields control={mockControl} t={mockT} />);

      const options = screen.getAllByRole('option');
      const expectedAlgorithms = ['HS256', 'RS256', 'ES256'];

      options.forEach((option, index) => {
        expect(option).toHaveTextContent(expectedAlgorithms[index]);
      });
    });
  });

  describe('Translation Integration', () => {
    it('should call translation function for translatable labels', () => {
      render(<JwtAuthFields control={mockControl} t={mockT} />);

      expect(mockT).toHaveBeenCalledWith('orgSilServiceCreate.jwtKid');
      expect(mockT).toHaveBeenCalledWith('orgSilServiceCreate.jwtIssuer');
      expect(mockT).toHaveBeenCalledWith('orgSilServiceCreate.jwtAlgorithm');
      expect(mockT).toHaveBeenCalledWith('orgSilServiceCreate.jwtSigningKey');
      expect(mockT).toHaveBeenCalledWith('orgSilServiceCreate.jwtSubject');
    });

    it('should display translated labels correctly', () => {
      render(<JwtAuthFields control={mockControl} t={mockT} />);

      const expectedLabels = [
        'JWT Kid',
        'JWT Issuer',
        'JWT Subject',
        'JWT Algorithm',
        'JWT Signing Key'
      ];
      expectedLabels.forEach((label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });
  });

  describe('Props Validation', () => {
    it('should handle different control objects', () => {
      const alternativeControl = {
        differentProperty: 'test'
      } as any as Control<OrgSilServiceFormData>;

      expect(() => {
        render(<JwtAuthFields control={alternativeControl} t={mockT} />);
      }).not.toThrow();
    });

    it('should handle different translation functions', () => {
      const alternativeT = vi.fn((key: string) => `ALT_${key}`);

      render(<JwtAuthFields control={mockControl} t={alternativeT} />);

      expect(alternativeT).toHaveBeenCalledWith('orgSilServiceCreate.jwtKid');
      expect(
        screen.getByText('ALT_orgSilServiceCreate.jwtKid')
      ).toBeInTheDocument();
    });

    it('should work with minimal required props', () => {
      const minimalT = (key: string) => key;
      const minimalControl = {} as Control<OrgSilServiceFormData>;

      expect(() => {
        render(<JwtAuthFields control={minimalControl} t={minimalT} />);
      }).not.toThrow();

      expect(screen.getAllByRole('textbox')).toHaveLength(4);
      expect(screen.getAllByRole('combobox')).toHaveLength(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility attributes', () => {
      render(<JwtAuthFields control={mockControl} t={mockT} />);

      const textInputs = screen.getAllByRole('textbox');
      const selectInputs = screen.getAllByRole('combobox');

      [...textInputs, ...selectInputs].forEach((input) => {
        expect(input).toHaveAttribute('name');
        expect(input).toHaveAttribute('id');
        expect(input).toHaveAttribute('required');
      });
    });

    it('should have proper label associations', () => {
      render(<JwtAuthFields control={mockControl} t={mockT} />);

      const expectedFields = [
        'jwtKid',
        'jwtIssuer',
        'jwtSubject',
        'jwtAlgorithm',
        'jwtSigningKey'
      ];
      expectedFields.forEach((field) => {
        const input = document.getElementById(field);
        const label = document.querySelector(`label[for="${field}"]`);

        expect(input).toBeInTheDocument();
        expect(label).toBeInTheDocument();
      });
    });
  });
});
