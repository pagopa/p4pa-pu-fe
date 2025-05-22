import { fireEvent, screen } from './renderers';

export const pickSelect = async (labelKey: string, optionText: string) => {
  const trigger = screen.getByRole('combobox', { name: labelKey });
  fireEvent.mouseDown(trigger);
  const option = await screen.findByRole('option', { name: optionText });
  fireEvent.click(option);
};

export const fillField = (label: string, value: string) => {
  const input = screen.getByRole('textbox', { name: label });
  fireEvent.change(input, { target: { value } });
};
