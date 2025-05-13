import { render, screen, fireEvent } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { PaymentNotificationFields } from './PaymentNotificationFields';
import { Step2Data } from '../../Step2Behaviour';
import { pickSelect } from '../../../../../__tests__/utils';

describe('PaymentNotificationFields', () => {
  const renderWithForm = (defaultValues?: Partial<Step2Data>) => {
    const Wrapper = () => {
      const { control } = useForm<Step2Data>({
        defaultValues: {
          notificationRetries: 1,
          notificationAppName: '',
          notificationEndpoint: '',
          enableJwtAuth: false,
          clientId: '',
          clientEmail: '',
          secretKeyId: '',
          secretKey: '',
          ...defaultValues
        }
      });

      return <PaymentNotificationFields control={control} />;
    };

    render(<Wrapper />);
  };

  it('renders all select and input fields with correct labels', () => {
    renderWithForm();

    // Select field
    expect(
      screen.getByRole('combobox', {
        name: 'debtTypeOrgCreate.behaviour.notifications.fields.retries'
      })
    ).toBeInTheDocument();

    // Text fields
    [
      'debtTypeOrgCreate.behaviour.notifications.fields.appName',
      'debtTypeOrgCreate.behaviour.notifications.fields.endpoint',
      'debtTypeOrgCreate.behaviour.notifications.fields.clientId',
      'debtTypeOrgCreate.behaviour.notifications.fields.clientEmail',
      'debtTypeOrgCreate.behaviour.notifications.fields.secretKeyId',
      'debtTypeOrgCreate.behaviour.notifications.fields.secretKey'
    ].forEach((label) => {
      expect(screen.getByRole('textbox', { name: label })).toBeInTheDocument();
    });

    // Checkbox
    expect(
      screen.getByRole('checkbox', {
        name: 'debtTypeOrgCreate.behaviour.notifications.fields.jwt'
      })
    ).toBeInTheDocument();

    // Caption text for retries description
    expect(
      screen.getByText(
        'debtTypeOrgCreate.behaviour.notifications.fields.retriesDescription'
      )
    ).toBeInTheDocument();
  });

  it('allows user to interact with fields', async () => {
    renderWithForm();

    await pickSelect(
      'debtTypeOrgCreate.behaviour.notifications.fields.retries',
      '5'
    );
    expect(screen.getByDisplayValue('5')).toBeInTheDocument();

    // Type into text fields
    const appNameInput = screen.getByRole('textbox', {
      name: 'debtTypeOrgCreate.behaviour.notifications.fields.appName'
    });
    fireEvent.change(appNameInput, { target: { value: 'My App' } });
    expect(appNameInput).toHaveValue('My App');

    const endpointInput = screen.getByRole('textbox', {
      name: 'debtTypeOrgCreate.behaviour.notifications.fields.endpoint'
    });
    fireEvent.change(endpointInput, {
      target: { value: 'https://api.example.com' }
    });
    expect(endpointInput).toHaveValue('https://api.example.com');

    // Toggle checkbox
    const jwtCheckbox = screen.getByRole('checkbox', {
      name: 'debtTypeOrgCreate.behaviour.notifications.fields.jwt'
    });
    expect(jwtCheckbox).not.toBeChecked();
    fireEvent.click(jwtCheckbox);
    expect(jwtCheckbox).toBeChecked();

    // Fill clientId
    const clientIdInput = screen.getByRole('textbox', {
      name: 'debtTypeOrgCreate.behaviour.notifications.fields.clientId'
    });
    fireEvent.change(clientIdInput, { target: { value: 'client-123' } });
    expect(clientIdInput).toHaveValue('client-123');

    // Fill clientEmail
    const clientEmailInput = screen.getByRole('textbox', {
      name: 'debtTypeOrgCreate.behaviour.notifications.fields.clientEmail'
    });
    fireEvent.change(clientEmailInput, {
      target: { value: 'client@example.com' }
    });
    expect(clientEmailInput).toHaveValue('client@example.com');

    // Fill secretKeyId
    const secretKeyIdInput = screen.getByRole('textbox', {
      name: 'debtTypeOrgCreate.behaviour.notifications.fields.secretKeyId'
    });
    fireEvent.change(secretKeyIdInput, { target: { value: 'secret-key-id' } });
    expect(secretKeyIdInput).toHaveValue('secret-key-id');

    // Fill secretKey
    const secretKeyInput = screen.getByRole('textbox', {
      name: 'debtTypeOrgCreate.behaviour.notifications.fields.secretKey'
    });
    fireEvent.change(secretKeyInput, { target: { value: 'secret-key' } });
    expect(secretKeyInput).toHaveValue('secret-key');
  });
});
