import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Step2AddDebtor from './Step2AddDebtor';
import { Step2Data } from '../../../../models/DebtPositionType';

const defaultData: Step2Data = {
  subjectType: { value: '', readonly: false },
  taxCode: { value: '', readonly: false },
  fullName: { value: '', readonly: false },
  address: { value: '', readonly: false },
  civicNumber: { value: '', readonly: false },
  zipCode: { value: '', readonly: false },
  country: { value: '', readonly: false },
  province: { value: '', readonly: false },
  city: { value: '', readonly: false }
};

describe('Step2AddDebtor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with initial data', () => {
    render(
      <Step2AddDebtor
        data={defaultData}
        setData={() => null}
        onNext={() => null}
      />
    );

    expect(
      screen.getByText('debtPositionCreateWizard.addDebtor.title')
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtPositionCreateWizard.addDebtor.subtitle')
    ).toBeInTheDocument();

    expect(
      screen.getByText('debtPositionCreateWizard.step2.subjectType.label')
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtPositionCreateWizard.step2.fiscalData')
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtPositionCreateWizard.step2.fullName.label')
    ).toBeInTheDocument();
  });

  it('allows selecting subject type and entering tax code and full name', async () => {
    const setData = vi.fn();
    const onNext = vi.fn();

    render(
      <Step2AddDebtor data={defaultData} setData={setData} onNext={onNext} />
    );

    const subjectTypeSelect = screen.getByRole('combobox', {
      name: 'debtPositionCreateWizard.step2.subjectType.label'
    }) as HTMLSelectElement;

    fireEvent.mouseDown(subjectTypeSelect);
    const fisicaOption = await screen.findByText(
      'debtPositionCreateWizard.step2.subjectType.options.fisica'
    );
    fireEvent.click(fisicaOption);

    const taxCodeInput = screen.getByRole('textbox', {
      name: 'debtPositionCreateWizard.step2.taxCode.label'
    }) as HTMLInputElement;

    fireEvent.change(taxCodeInput, { target: { value: 'abc123' } });
    expect(taxCodeInput.value).toBe('ABC123');

    const fullNameInput = screen.getByRole('textbox', {
      name: 'debtPositionCreateWizard.step2.fullName.label'
    }) as HTMLInputElement;

    fireEvent.change(fullNameInput, { target: { value: 'Mario Rossi' } });
    expect(fullNameInput.value).toBe('Mario Rossi');
  });

  it('allows entering address information', async () => {
    const setData = vi.fn();
    const onNext = vi.fn();

    render(
      <Step2AddDebtor data={defaultData} setData={setData} onNext={onNext} />
    );

    const addressInput = screen.getByRole('textbox', {
      name: 'debtPositionCreateWizard.step2.address.label'
    }) as HTMLInputElement;
    fireEvent.change(addressInput, { target: { value: 'Via Roma 123' } });
    expect(addressInput.value).toBe('Via Roma 123');

    const civicNumberInput = screen.getByRole('textbox', {
      name: 'debtPositionCreateWizard.step2.civicNumber.label'
    }) as HTMLInputElement;
    fireEvent.change(civicNumberInput, { target: { value: '42' } });
    expect(civicNumberInput.value).toBe('42');

    const zipCodeInput = screen.getByRole('textbox', {
      name: 'debtPositionCreateWizard.step2.zipCode.label'
    }) as HTMLInputElement;
    fireEvent.change(zipCodeInput, { target: { value: '20100' } });
    expect(zipCodeInput.value).toBe('20100');
  });

  it('allows selecting country and province', async () => {
    const setData = vi.fn();
    const onNext = vi.fn();

    render(
      <Step2AddDebtor data={defaultData} setData={setData} onNext={onNext} />
    );

    const countrySelect = screen.getByRole('combobox', {
      name: 'debtPositionCreateWizard.step2.country.label'
    }) as HTMLSelectElement;
    fireEvent.mouseDown(countrySelect);

    const italyOptions = await screen.findAllByText('Italia');
    const italyOptionToClick = italyOptions.find(
      (option) => option.closest('[role="option"]') !== null
    );

    if (italyOptionToClick) {
      fireEvent.click(italyOptionToClick);
    }

    const provinceSelect = screen.getByRole('combobox', {
      name: 'debtPositionCreateWizard.step2.province.label'
    }) as HTMLSelectElement;
    fireEvent.mouseDown(provinceSelect);
    const milanOption = await screen.findByText('MI');
    fireEvent.click(milanOption);

    const cityInput = screen.getByRole('textbox', {
      name: 'debtPositionCreateWizard.step2.city.label'
    }) as HTMLInputElement;
    fireEvent.change(cityInput, { target: { value: 'Milano' } });
    expect(cityInput.value).toBe('Milano');
  });

  it('tests onNext button is present', () => {
    const setData = vi.fn();
    const onNext = vi.fn();

    render(
      <Step2AddDebtor data={defaultData} setData={setData} onNext={onNext} />
    );

    const continueButton = screen.getByRole('button', {
      name: 'commons.continue'
    });
    expect(continueButton).toBeInTheDocument();
  });

  describe('Anonymous Subject Switch', () => {
    it('shows anonymous subject switch when flagAnonymousFiscalCode is true', () => {
      render(
        <Step2AddDebtor
          data={defaultData}
          setData={() => null}
          onNext={() => null}
          flagAnonymousFiscalCode={true}
        />
      );

      const anonymousSwitch = screen.getByTestId('anonymous-subject-switch');
      expect(anonymousSwitch).toBeInTheDocument();

      const helperText = screen.getByText(
        'debtPositionCreateWizard.step2.anonymousSubject.helperText'
      );
      expect(helperText).toBeInTheDocument();
    });

    it('does not show anonymous subject switch when flagAnonymousFiscalCode is false', () => {
      render(
        <Step2AddDebtor
          data={defaultData}
          setData={() => null}
          onNext={() => null}
          flagAnonymousFiscalCode={false}
        />
      );

      const anonymousSwitch = screen.queryByTestId('anonymous-subject-switch');
      expect(anonymousSwitch).not.toBeInTheDocument();
    });

    it('disables anonymous subject switch when subjectType is BUSINESS', async () => {
      render(
        <Step2AddDebtor
          data={defaultData}
          setData={() => null}
          onNext={() => null}
          flagAnonymousFiscalCode={true}
        />
      );

      // Select BUSINESS subject type
      const subjectTypeSelect = screen.getByRole('combobox', {
        name: 'debtPositionCreateWizard.step2.subjectType.label'
      }) as HTMLSelectElement;

      fireEvent.mouseDown(subjectTypeSelect);
      const businessOption = await screen.findByText(
        'debtPositionCreateWizard.step2.subjectType.options.giuridica'
      );
      fireEvent.click(businessOption);

      // Check that the switch is now disabled
      const switchElement = screen
        .getByTestId('anonymous-subject-switch')
        .querySelector('input[type="checkbox"]') as HTMLInputElement;

      expect(switchElement).toBeDisabled();
    });

    it('disables anonymous subject switch in edit mode', () => {
      const dataWithAnonymous: Step2Data = {
        ...defaultData,
        subjectType: { value: 'INDIVIDUAL', readonly: false },
        anonymousSubject: { value: false, readonly: false }
      };

      render(
        <Step2AddDebtor
          data={dataWithAnonymous}
          setData={() => null}
          onNext={() => null}
          isEditing={true}
          flagAnonymousFiscalCode={true}
        />
      );

      const switchElement = screen
        .getByTestId('anonymous-subject-switch')
        .querySelector('input[type="checkbox"]') as HTMLInputElement;

      expect(switchElement).toBeDisabled();
    });

    it('hides taxCode field when anonymous switch is active and subject type is INDIVIDUAL', async () => {
      render(
        <Step2AddDebtor
          data={defaultData}
          setData={() => null}
          onNext={() => null}
          flagAnonymousFiscalCode={true}
        />
      );

      // Select INDIVIDUAL subject type
      const subjectTypeSelect = screen.getByRole('combobox', {
        name: 'debtPositionCreateWizard.step2.subjectType.label'
      }) as HTMLSelectElement;

      fireEvent.mouseDown(subjectTypeSelect);
      const individualOption = await screen.findByText(
        'debtPositionCreateWizard.step2.subjectType.options.fisica'
      );
      fireEvent.click(individualOption);

      // TaxCode field should be visible initially
      let taxCodeField = screen.getByTestId('tax-code-field');
      expect(taxCodeField).toBeInTheDocument();

      // Click anonymous switch
      const switchElement = screen
        .getByTestId('anonymous-subject-switch')
        .querySelector('input[type="checkbox"]') as HTMLInputElement;

      fireEvent.click(switchElement);

      // TaxCode field should now be hidden
      taxCodeField = screen.queryByTestId('tax-code-field') as HTMLElement;
      expect(taxCodeField).not.toBeInTheDocument();
    });

    it('shows taxCode field when anonymous switch is inactive', async () => {
      render(
        <Step2AddDebtor
          data={defaultData}
          setData={() => null}
          onNext={() => null}
          flagAnonymousFiscalCode={true}
        />
      );

      // Select INDIVIDUAL subject type
      const subjectTypeSelect = screen.getByRole('combobox', {
        name: 'debtPositionCreateWizard.step2.subjectType.label'
      }) as HTMLSelectElement;

      fireEvent.mouseDown(subjectTypeSelect);
      const individualOption = await screen.findByText(
        'debtPositionCreateWizard.step2.subjectType.options.fisica'
      );
      fireEvent.click(individualOption);

      // TaxCode field should be visible when switch is off
      const taxCodeField = screen.getByTestId('tax-code-field');
      expect(taxCodeField).toBeInTheDocument();
    });

    it('resets anonymous switch when user changes subject type from INDIVIDUAL to BUSINESS', async () => {
      render(
        <Step2AddDebtor
          data={defaultData}
          setData={() => null}
          onNext={() => null}
          flagAnonymousFiscalCode={true}
        />
      );

      // Select INDIVIDUAL subject type
      const subjectTypeSelect = screen.getByRole('combobox', {
        name: 'debtPositionCreateWizard.step2.subjectType.label'
      }) as HTMLSelectElement;

      fireEvent.mouseDown(subjectTypeSelect);
      const individualOption = await screen.findByText(
        'debtPositionCreateWizard.step2.subjectType.options.fisica'
      );
      fireEvent.click(individualOption);

      // Activate anonymous switch
      const switchElement = screen
        .getByTestId('anonymous-subject-switch')
        .querySelector('input[type="checkbox"]') as HTMLInputElement;

      fireEvent.click(switchElement);
      expect(switchElement.checked).toBe(true);

      // Change subject type to BUSINESS
      fireEvent.mouseDown(subjectTypeSelect);
      const businessOption = await screen.findByText(
        'debtPositionCreateWizard.step2.subjectType.options.giuridica'
      );
      fireEvent.click(businessOption);

      // Switch should be automatically reset to false
      expect(switchElement.checked).toBe(false);
    });
  });
});
