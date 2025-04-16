import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Step2AddDebtor, { Step2Data } from './Step2AddDebtor';

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
    expect(screen.getByText('commons.fiscalCodeorVat')).toBeInTheDocument();
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
});
