import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { OrganizationApiKeyType } from '@generated/core/client';
import type { AddIntegrationFormData } from '..';
import PagoPAIntegration from './pagopa';

describe('PagoPAIntegration', () => {
  it.each([
    { initialType: undefined, expectedType: OrganizationApiKeyType.IO },
    {
      initialType: OrganizationApiKeyType.GENERATE_NOTICE,
      expectedType: OrganizationApiKeyType.GENERATE_NOTICE
    }
  ] as const)(
    'initializes and submits $expectedType when the initial value is $initialType',
    async ({ initialType, expectedType }) => {
      const onSubmit = vi.fn();
      const Parent = () => {
        const { control, watch, handleSubmit } =
          useForm<AddIntegrationFormData>({
            defaultValues: {
              PAGOPA_PRODUCT: { type: initialType, apiKey: '' }
            }
          });
        return (
          <form noValidate onSubmit={handleSubmit(onSubmit)}>
            <PagoPAIntegration
              control={control}
              availableApiKeys={[
                OrganizationApiKeyType.IO,
                OrganizationApiKeyType.GENERATE_NOTICE
              ]}
            />
            <output data-testid="product-type">
              {watch('PAGOPA_PRODUCT.type')}
            </output>
            <button type="submit">Submit</button>
          </form>
        );
      };

      render(<Parent />);
      expect(screen.getByRole('combobox')).toHaveTextContent(expectedType);
      expect(screen.getByTestId('product-type')).toHaveTextContent(
        expectedType
      );
      fireEvent.click(screen.getByText('Submit'));
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });
      expect(onSubmit.mock.calls[0][0]).toEqual({
        PAGOPA_PRODUCT: { type: expectedType, apiKey: '' }
      });
    }
  );

  it('binds the select to the watched parent field and submits its value', async () => {
    const onSubmit = vi.fn();
    const Parent = () => {
      const { control, watch, handleSubmit, setValue } =
        useForm<AddIntegrationFormData>({
          defaultValues: {
            PAGOPA_PRODUCT: { type: undefined, apiKey: '' }
          }
        });
      const productType = watch('PAGOPA_PRODUCT.type');

      return (
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <PagoPAIntegration
            control={control}
            availableApiKeys={[
              OrganizationApiKeyType.IO,
              OrganizationApiKeyType.GENERATE_NOTICE
            ]}
          />
          <output data-testid="product-type">{productType ?? 'unset'}</output>
          <button
            type="button"
            onClick={() =>
              setValue(
                'PAGOPA_PRODUCT.type',
                OrganizationApiKeyType.GENERATE_NOTICE
              )
            }
          >
            Change from parent
          </button>
          <button type="submit">Submit</button>
        </form>
      );
    };

    render(<Parent />);
    expect(screen.getByTestId('product-type')).toHaveTextContent('IO');

    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'GENERATE_NOTICE' }));
    expect(screen.getByTestId('product-type')).toHaveTextContent(
      'GENERATE_NOTICE'
    );

    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'IO' }));
    expect(screen.getByTestId('product-type')).toHaveTextContent('IO');
    expect(screen.getByRole('combobox')).toHaveTextContent('IO');

    fireEvent.click(screen.getByText('Change from parent'));
    expect(screen.getByRole('combobox')).toHaveTextContent('GENERATE_NOTICE');

    fireEvent.click(screen.getByText('Submit'));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
    expect(onSubmit.mock.calls[0][0]).toEqual({
      PAGOPA_PRODUCT: {
        type: OrganizationApiKeyType.GENERATE_NOTICE,
        apiKey: ''
      }
    });
  });
});
