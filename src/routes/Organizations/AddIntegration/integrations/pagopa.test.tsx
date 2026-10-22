import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { OrganizationApiKeyType } from '@generated/core/client';
import type { AddIntegrationFormData } from '..';
import PagoPAIntegration from './pagopa';

describe('PagoPAIntegration', () => {
  it('binds the IO service switch to form state and hides it for notice products', async () => {
    const onSubmit = vi.fn();
    const Parent = () => {
      const { control, watch, handleSubmit, setValue } =
        useForm<AddIntegrationFormData>({
          defaultValues: {
            PAGOPA_PRODUCT: {
              keyType: OrganizationApiKeyType.IO,
              apiKey: 'test-key',
              serviceEnabled: false
            }
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
          <output data-testid="service-enabled">
            {String(watch('PAGOPA_PRODUCT.serviceEnabled'))}
          </output>
          <button
            type="button"
            onClick={() => setValue('PAGOPA_PRODUCT.serviceEnabled', false)}
          >
            Disable from parent
          </button>
          <button type="submit">Submit</button>
        </form>
      );
    };

    render(<Parent />);
    expect(screen.getByRole('checkbox')).not.toBeChecked();

    fireEvent.click(screen.getByRole('checkbox'));
    expect(screen.getByTestId('service-enabled')).toHaveTextContent('true');
    fireEvent.click(screen.getByText('Submit'));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
    expect(onSubmit.mock.calls[0][0]).toEqual({
      PAGOPA_PRODUCT: {
        keyType: OrganizationApiKeyType.IO,
        apiKey: 'test-key',
        serviceEnabled: true
      }
    });

    fireEvent.click(screen.getByText('Disable from parent'));
    expect(screen.getByRole('checkbox')).not.toBeChecked();

    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: /GENERATE_NOTICE$/ }));
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('binds the API key to the parent form and includes edits on submit', async () => {
    const onSubmit = vi.fn();
    const Parent = () => {
      const { control, watch, handleSubmit, setValue } =
        useForm<AddIntegrationFormData>({
          defaultValues: {
            PAGOPA_PRODUCT: {
              keyType: OrganizationApiKeyType.IO,
              apiKey: 'initial-key'
            }
          }
        });
      return (
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <PagoPAIntegration
            control={control}
            availableApiKeys={[OrganizationApiKeyType.IO]}
          />
          <output data-testid="api-key">
            {watch('PAGOPA_PRODUCT.apiKey')}
          </output>
          <button
            type="button"
            onClick={() => setValue('PAGOPA_PRODUCT.apiKey', 'parent-key')}
          >
            Update API key
          </button>
          <button type="submit">Submit</button>
        </form>
      );
    };

    render(<Parent />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('initial-key');
    fireEvent.click(screen.getByText('Update API key'));
    expect(input).toHaveValue('parent-key');

    fireEvent.change(input, { target: { value: 'edited-key' } });
    expect(screen.getByTestId('api-key')).toHaveTextContent('edited-key');
    fireEvent.blur(input);
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
    expect(onSubmit.mock.calls[0][0]).toEqual({
      PAGOPA_PRODUCT: {
        keyType: OrganizationApiKeyType.IO,
        apiKey: 'edited-key'
      }
    });
  });

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
              PAGOPA_PRODUCT: { keyType: initialType, apiKey: '' }
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
              {watch('PAGOPA_PRODUCT.keyType')}
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
        PAGOPA_PRODUCT: { keyType: expectedType, apiKey: '' }
      });
    }
  );

  it('binds the select to the watched parent field and submits its value', async () => {
    const onSubmit = vi.fn();
    const Parent = () => {
      const { control, watch, handleSubmit, setValue } =
        useForm<AddIntegrationFormData>({
          defaultValues: {
            PAGOPA_PRODUCT: { keyType: undefined, apiKey: '' }
          }
        });
      const productType = watch('PAGOPA_PRODUCT.keyType');

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
                'PAGOPA_PRODUCT.keyType',
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
    fireEvent.click(screen.getByRole('option', { name: /GENERATE_NOTICE$/ }));
    expect(screen.getByTestId('product-type')).toHaveTextContent(
      'GENERATE_NOTICE'
    );

    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: /IO$/ }));
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
        keyType: OrganizationApiKeyType.GENERATE_NOTICE,
        apiKey: ''
      }
    });
  });
});
