import { step4Schema } from './schema';

describe('step4Schema validation', () => {
  it('passes when flagNotifyIo is false and other fields are missing', () => {
    const data = { flagNotifyIo: false };
    const result = step4Schema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('passes when flagNotifyIo is missing and other fields are missing', () => {
    const data = {};
    const result = step4Schema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('fails when flagNotifyIo is true but serviceId is missing', () => {
    const data = {
      flagNotifyIo: true,
      ioTemplateSubject: 'Subject',
      ioTemplateMessage: 'Message'
    };
    const result = step4Schema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.formErrors.fieldErrors.serviceId).toContain(
        'debtTypeOrgCreate.notifications.serviceApiKey.required'
      );
    }
  });

  it('fails when flagNotifyIo is true but ioTemplateSubject is missing', () => {
    const data = {
      flagNotifyIo: true,
      serviceId: 'abc123',
      ioTemplateMessage: 'Message'
    };
    const result = step4Schema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.formErrors.fieldErrors.ioTemplateSubject).toContain(
        'debtTypeOrgCreate.notifications.messageSubject.required'
      );
    }
  });

  it('fails when flagNotifyIo is true but ioTemplateMessage is missing', () => {
    const data = {
      flagNotifyIo: true,
      serviceId: 'abc123',
      ioTemplateSubject: 'Subject'
    };
    const result = step4Schema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.formErrors.fieldErrors.ioTemplateMessage).toContain(
        'debtTypeOrgCreate.notifications.messageBody.required'
      );
    }
  });

  it('passes when flagNotifyIo is true and all required fields are present', () => {
    const data = {
      flagNotifyIo: true,
      serviceId: 'abc123',
      ioTemplateSubject: 'Subject',
      ioTemplateMessage: 'Message'
    };
    const result = step4Schema.safeParse(data);
    expect(result.success).toBe(true);
  });
});
