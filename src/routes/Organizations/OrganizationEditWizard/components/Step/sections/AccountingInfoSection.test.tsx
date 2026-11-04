import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@core/__tests__/renderers';
import type { FieldErrors } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import { AccountingInfoSection } from './AccountingInfoSection';
import type {
  UnifiedFormData,
  UnifiedFormValues
} from '../../../../../../models/OrganizationEditTypes';

const createIBANValidationRules = vi.fn<
  (isRequired?: boolean) => Record<string, unknown>
>(() => ({}));

const makeData = (overrides: Partial<Record<string, unknown>> = {}) =>
  ({
    orgName: { value: '', readonly: false },
    orgFiscalCode: { value: '', readonly: false },
    orgEmail: { value: '', readonly: false },
    orgLogo: { value: null, readonly: false },
    logoRemoved: false,

    iban: { value: '', readonly: false },
    ibanPostal: { value: '', readonly: false },
    cbill: { value: '', readonly: false },
    flagTreasury: { value: false, readonly: false },

    segregationCode: { value: '', readonly: false },
    additionalLanguage: { value: false, readonly: false },
    selectedLanguage: { value: '', readonly: false },
    flagNotifyOutcomePush: { value: false, readonly: false },
    flagPaymentNotification: { value: false, readonly: false },

    flagNotifyIo: { value: false, readonly: false },
    pdndEnabled: { value: false, readonly: false },

    organizationStatus: 'DRAFT',

    ...overrides
  }) as UnifiedFormData;

const defaultValues: Partial<UnifiedFormValues> = {
  orgName: '',
  orgFiscalCode: '',
  orgEmail: '',
  orgLogo: null,

  iban: '',
  ibanPostal: '',
  cbill: '',
  flagTreasury: false,

  segregationCode: '',
  additionalLanguage: false,
  selectedLanguage: '',
  flagNotifyOutcomePush: false,
  flagPaymentNotification: false,

  flagNotifyIo: false,
  pdndEnabled: false
};

const Wrapper = ({
  data,
  values,
  errors
}: {
  data: UnifiedFormData;
  values: Partial<UnifiedFormValues>;
  errors: FieldErrors<UnifiedFormValues>;
}) => {
  const { control } = useForm<UnifiedFormValues>({
    defaultValues: values as UnifiedFormValues
  });

  return (
    <AccountingInfoSection
      control={control}
      errors={errors}
      data={data}
      createIBANValidationRules={createIBANValidationRules}
    />
  );
};

const renderSection = ({
  data = makeData(),
  values = defaultValues,
  errors = {}
}: {
  data?: UnifiedFormData;
  values?: Partial<UnifiedFormValues>;
  errors?: FieldErrors<UnifiedFormValues>;
} = {}) => render(<Wrapper data={data} values={values} errors={errors} />);

const input = (testId: string) =>
  screen.getByTestId(testId).querySelector('input') as HTMLInputElement;

describe('AccountingInfoSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders accounting fields and their values', () => {
    renderSection({
      values: {
        ...defaultValues,
        iban: 'IT60X0542811101000000123456',
        ibanPostal: 'IT60X0542811101000000654321',
        cbill: 'CBILL001',
        flagTreasury: true
      }
    });

    expect(
      screen.getByText('organizationEditWizard.step2.accountingInfo.title')
    ).toBeInTheDocument();

    expect(input('iban-field')).toHaveValue('IT60X0542811101000000123456');
    expect(input('iban-postal-field')).toHaveValue(
      'IT60X0542811101000000654321'
    );
    expect(input('cbill-field')).toHaveValue('CBILL001');
    expect(input('flag-treasury-switch')).toBeChecked();
  });

  it.each([
    ['ACTIVE', true],
    ['DRAFT', false]
  ] as const)(
    'configures IBAN as required for %s organizations',
    (organizationStatus, isRequired) => {
      renderSection({
        data: makeData({ organizationStatus })
      });

      expect(input('iban-field').required).toBe(isRequired);
      expect(createIBANValidationRules).toHaveBeenCalledWith(isRequired);

      // Postal IBAN is always optional.
      expect(createIBANValidationRules).toHaveBeenCalledWith(false);
    }
  );

  it('disables readonly fields and switch', () => {
    renderSection({
      data: makeData({
        iban: { value: '', readonly: true },
        ibanPostal: { value: '', readonly: true },
        cbill: { value: '', readonly: true },
        flagTreasury: { value: false, readonly: true }
      })
    });

    expect(input('iban-field')).toBeDisabled();
    expect(input('iban-postal-field')).toBeDisabled();
    expect(input('cbill-field')).toBeDisabled();
    expect(input('flag-treasury-switch')).toBeDisabled();
  });

  it('displays validation errors received from the form', () => {
    renderSection({
      errors: {
        iban: { type: 'validate', message: 'iban error' },
        ibanPostal: { type: 'validate', message: 'postal error' },
        cbill: { type: 'validate', message: 'cbill error' }
      }
    });

    expect(screen.getByText('iban error')).toBeInTheDocument();
    expect(screen.getByText('postal error')).toBeInTheDocument();
    expect(screen.getByText('cbill error')).toBeInTheDocument();

    expect(input('iban-field')).toBeInvalid();
    expect(input('iban-postal-field')).toBeInvalid();
    expect(input('cbill-field')).toBeInvalid();
  });

  it('updates the integrated cash journal switch', () => {
    renderSection();

    const treasurySwitch = input('flag-treasury-switch');

    expect(treasurySwitch).not.toBeChecked();

    fireEvent.click(treasurySwitch);

    expect(treasurySwitch).toBeChecked();
  });
});
