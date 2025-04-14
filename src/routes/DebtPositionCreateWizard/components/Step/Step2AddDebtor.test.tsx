import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Step2AddDebtor, { Step2Data } from './Step2AddDebtor';

const defaultData: Step2Data = {
  subjectType: { value: '', readonly: false },
  taxCode: { value: '', readonly: false },
  fullName: { value: '', readonly: false }
};

describe('Step2AddDebtor', () => {
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
});
