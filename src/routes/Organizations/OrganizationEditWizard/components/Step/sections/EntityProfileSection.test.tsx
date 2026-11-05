import { render, screen, fireEvent, waitFor } from '@core/__tests__/renderers';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useForm } from 'react-hook-form';
import { EntityProfileSection } from './EntityProfileSection';
import type {
  UnifiedFormData,
  UnifiedFormValues
} from '../../../../../../models/OrganizationEditTypes';

vi.mock('../../../../../../utils/fieldValidation', () => ({
  isValidEmail: vi.fn((email: string) => email.includes('@'))
}));

vi.mock('../../../../../../components/FormComponent', () => ({
  FormComponent: {
    ControlledFileUploader: ({
      name,
      disabled
    }: {
      name: string;
      control: unknown;
      description: string;
      fileExtensionsAllowed: Array<string>;
      disabled: boolean;
      header: JSX.Element;
    }) => (
      <div data-testid="logo-uploader">
        <span>{name}</span>
        <span data-testid="logo-uploader-disabled">
          {disabled ? 'disabled' : 'enabled'}
        </span>
      </div>
    )
  }
}));

const baseData: UnifiedFormData = {
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

  organizationStatus: 'DRAFT'
};

const defaultFormValues: Partial<UnifiedFormValues> = {
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

const TestWrapper = ({
  data,
  defaultValues
}: {
  data: UnifiedFormData;
  defaultValues: Partial<UnifiedFormValues>;
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<UnifiedFormValues>({
    defaultValues: defaultValues as UnifiedFormValues,
    mode: 'onSubmit'
  });

  return (
    <>
      <EntityProfileSection control={control} errors={errors} data={data} />

      <output data-testid="org-logo-error">
        {errors.orgLogo?.message ?? ''}
      </output>

      <button
        type="button"
        data-testid="submit-entity-profile"
        onClick={handleSubmit(() => undefined)}
      >
        Submit
      </button>
    </>
  );
};

describe('EntityProfileSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderSection = (
    data: Partial<UnifiedFormData> = {},
    values: Partial<UnifiedFormValues> = {}
  ) =>
    render(
      <TestWrapper
        data={{ ...baseData, ...data }}
        defaultValues={{ ...defaultFormValues, ...values }}
      />
    );

  const submit = async () => {
    fireEvent.click(screen.getByTestId('submit-entity-profile'));
  };

  const logoRequiredMessage = 'organizationEditWizard.step1.orgLogo.required';

  it('renders profile fields and logo information', () => {
    renderSection();

    expect(
      screen.getByText('organizationEditWizard.step1.title')
    ).toBeInTheDocument();

    expect(screen.getByTestId('org-name-field')).toBeInTheDocument();
    expect(screen.getByTestId('org-fiscal-code-field')).toBeInTheDocument();
    expect(screen.getByTestId('org-email-field')).toBeInTheDocument();
    expect(screen.getByTestId('logo-uploader')).toBeInTheDocument();

    expect(
      screen.getByText('organizationEditWizard.step1.orgLogo.description')
    ).toBeInTheDocument();

    expect(
      screen.getByText('organizationEditWizard.step1.orgLogo.requirements')
    ).toBeInTheDocument();

    expect(
      screen.getByText('organizationEditWizard.step1.orgLogo.learnMore')
    ).toBeInTheDocument();

    expect(
      screen.queryByText('organizationEditWizard.step1.orgLogo.optional')
    ).not.toBeInTheDocument();
  });

  it('handles the learn more link', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => null);

    renderSection();

    fireEvent.click(
      screen.getByText('organizationEditWizard.step1.orgLogo.learnMore')
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'TODO: Handle "Learn more" action for logo requirements'
    );

    consoleSpy.mockRestore();
  });

  it.each([
    ['orgName', 'org-name-field'],
    ['orgFiscalCode', 'org-fiscal-code-field']
  ] as const)('disables %s when readonly', (field, testId) => {
    renderSection({
      [field]: { value: '', readonly: true }
    });

    expect(screen.getByTestId(testId).querySelector('input')).toBeDisabled();
  });

  it.each([
    ['orgName', 'org-name-field', 'Existing Name'],
    ['orgFiscalCode', 'org-fiscal-code-field', 'CF123']
  ] as const)(
    'disables %s when its data value is present',
    (field, testId, value) => {
      renderSection({
        [field]: { value, readonly: false }
      });

      expect(screen.getByTestId(testId).querySelector('input')).toBeDisabled();
    }
  );

  it('keeps email disabled and disables uploader when logo is readonly', () => {
    renderSection({
      orgLogo: {
        value: 'data:image/png;base64,existingLogo',
        readonly: true
      }
    });

    expect(
      screen.getByTestId('org-email-field').querySelector('input')
    ).toBeDisabled();

    expect(screen.getByTestId('logo-uploader-disabled')).toHaveTextContent(
      'disabled'
    );
  });

  it('requires a logo when none exists', async () => {
    renderSection();

    await submit();

    await waitFor(() => {
      expect(screen.getByTestId('org-logo-error')).toHaveTextContent(
        logoRequiredMessage
      );
    });
  });

  it('rejects removal of an existing logo', async () => {
    renderSection(
      {
        orgLogo: {
          value: 'data:image/png;base64,existingLogo',
          readonly: false
        }
      },
      {
        orgLogo: null
      }
    );

    await submit();

    await waitFor(() => {
      expect(screen.getByTestId('org-logo-error')).toHaveTextContent(
        logoRequiredMessage
      );
    });
  });

  it('accepts a supplied logo file', async () => {
    const file = new File(['logo'], 'logo.png', {
      type: 'image/png'
    });

    renderSection({}, { orgLogo: file });

    await submit();

    await waitFor(() => {
      expect(screen.getByTestId('org-logo-error')).toBeEmptyDOMElement();
    });
  });

  it('shows an error for invalid email', async () => {
    renderSection(
      {
        orgEmail: { value: 'invalid-email', readonly: false }
      },
      {
        orgEmail: 'invalid-email'
      }
    );

    await submit();

    await waitFor(() => {
      expect(
        screen.getByTestId('org-email-field').parentElement
      ).toHaveTextContent('organizationEditWizard.step1.orgEmail.invalid');
    });
  });
});
