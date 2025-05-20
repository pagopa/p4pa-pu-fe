import React from 'react';
import { vi } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor
} from '../../../../__tests__/renderers';
import { Step4Notifications } from '.';
import { StoreProvider } from '../../../../store/GlobalStore';
import { FormProvider, useForm, FieldValues } from 'react-hook-form';
import { setOrganizationId } from '../../../../store/OrganizationIdStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { step4Schema } from './schema'; // adjust path accordingly

// Helper to render component with fresh form context per test
const renderWithForm = (
  ui: React.ReactElement,
  onSubmit?: (data: FieldValues) => void
) => {
  const Wrapper: React.FC = () => {
    const methods = useForm<FieldValues>({
      resolver: zodResolver(step4Schema),
      defaultValues: {
        flagNotifyIo: false,
        serviceId: '',
        ioTemplateSubject: '',
        ioTemplateMessage: ''
      }
    });

    return (
      <StoreProvider>
        <FormProvider {...methods}>
          {onSubmit ? (
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              {ui}
              <button type="submit">Submit</button>
            </form>
          ) : (
            ui
          )}
        </FormProvider>
      </StoreProvider>
    );
  };

  return render(<Wrapper />);
};

describe('Step4Notifications', () => {
  beforeEach(() => {
    setOrganizationId(123);
    vi.clearAllMocks();
  });

  it('renders form with main titles and switch', () => {
    renderWithForm(<Step4Notifications />);

    expect(
      screen.getByText('debtTypeOrgCreate.notifications.title')
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtTypeOrgCreate.notifications.subtitle')
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtTypeOrgCreate.notifications.alertMessage')
    ).toBeInTheDocument();

    expect(
      screen.getByRole('checkbox', {
        name: 'debtTypeOrgCreate.notifications.enableNotifications'
      })
    ).toBeInTheDocument();

    // Notification section should NOT be visible initially
    expect(
      screen.queryByText('debtTypeOrgCreate.notifications.section.message')
    ).not.toBeInTheDocument();
  });

  it('shows notification fields when enableNotifications is toggled on', () => {
    renderWithForm(<Step4Notifications />);

    const switchInput = screen.getByRole('checkbox', {
      name: 'debtTypeOrgCreate.notifications.enableNotifications'
    });
    fireEvent.click(switchInput);

    expect(
      screen.getByText('debtTypeOrgCreate.notifications.section.message')
    ).toBeInTheDocument();

    [
      'debtTypeOrgCreate.notifications.serviceApiKey.label',
      'debtTypeOrgCreate.notifications.messageSubject.label',
      'debtTypeOrgCreate.notifications.messageBody.label'
    ].forEach((label) => {
      expect(screen.getByRole('textbox', { name: label })).toBeInTheDocument();
    });

    const previewButton = screen.getByRole('button', {
      name: 'debtTypeCreate.settings.preview'
    });
    expect(previewButton).toBeDisabled();
  });

  it('enables preview button only when subject and body have values', () => {
    renderWithForm(<Step4Notifications />);

    const switchInput = screen.getByRole('checkbox', {
      name: 'debtTypeOrgCreate.notifications.enableNotifications'
    });
    fireEvent.click(switchInput);

    const subjectInput = screen.getByRole('textbox', {
      name: 'debtTypeOrgCreate.notifications.messageSubject.label'
    });
    const bodyInput = screen.getByRole('textbox', {
      name: 'debtTypeOrgCreate.notifications.messageBody.label'
    });
    const previewButton = screen.getByRole('button', {
      name: 'debtTypeCreate.settings.preview'
    });

    expect(previewButton).toBeDisabled();

    fireEvent.change(subjectInput, { target: { value: 'Subject' } });
    expect(previewButton).toBeDisabled();

    fireEvent.change(bodyInput, { target: { value: 'Body text' } });
    expect(previewButton).toBeEnabled();

    fireEvent.change(subjectInput, { target: { value: '' } });
    expect(previewButton).toBeDisabled();
  });

  it('validates required fields when enableNotifications is true and prevents submission', async () => {
    const onSubmit = vi.fn();

    renderWithForm(<Step4Notifications />, onSubmit);

    const switchInput = screen.getByRole('checkbox', {
      name: 'debtTypeOrgCreate.notifications.enableNotifications'
    });
    fireEvent.click(switchInput);

    const nextButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });

    // Fill serviceId only
    const apiKeyInput = screen.getByRole('textbox', {
      name: 'debtTypeOrgCreate.notifications.serviceApiKey.label'
    });
    fireEvent.change(apiKeyInput, { target: { value: 'apikey123' } });

    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });

    // Fill subject and body
    const subjectInput = screen.getByRole('textbox', {
      name: 'debtTypeOrgCreate.notifications.messageSubject.label'
    });
    const bodyInput = screen.getByRole('textbox', {
      name: 'debtTypeOrgCreate.notifications.messageBody.label'
    });
    fireEvent.change(subjectInput, { target: { value: 'Subject' } });
    fireEvent.change(bodyInput, { target: { value: 'Body text' } });

    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        {
          flagNotifyIo: true,
          serviceId: 'apikey123',
          ioTemplateSubject: 'Subject',
          ioTemplateMessage: 'Body text'
        },
        expect.anything()
      );
    });
  });

  it('submits form with enableNotifications false without required fields', async () => {
    const onSubmit = vi.fn();

    renderWithForm(<Step4Notifications />, onSubmit);

    const nextButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        {
          flagNotifyIo: false,
          serviceId: '',
          ioTemplateSubject: '',
          ioTemplateMessage: ''
        },
        expect.anything()
      );
    });
  });
});
