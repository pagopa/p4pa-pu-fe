import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  getOrganizationsTypes,
  getMacroArea,
  getServiceType,
  getCollectionReason,
  getTaxonomyCode
} from '../api/taxonomy';
import { FormComponent } from '../components/FormComponent';
import { SelectOptions } from '../components/FormComponent/_Select';
import Stack from '@mui/material/Stack';

export const taxonomyFormSchema = z.object({
  organizationType: z.string(),
  macroAreaCode: z.string(),
  serviceTypeCode: z.string(),
  collectionReason: z.string(),
  taxonomyCode: z.string()
});

export type TaxonomyFormValues = z.infer<typeof taxonomyFormSchema>;

const initialValues = {
  organizationType: [] as SelectOptions,
  macroAreaCode: [] as SelectOptions,
  serviceTypeCode: [] as SelectOptions,
  collectionReason: [] as SelectOptions,
  taxonomyCode: [] as SelectOptions
};

export const useTaxonomyForm = () => {
  const organizationsMutation = getOrganizationsTypes();
  const macroAreaMutation = getMacroArea();
  const serviceTypeMutation = getServiceType();
  const collectionReasonMutation = getCollectionReason();
  const taxonomyCodeMutation = getTaxonomyCode();

  // Initialize data state
  const [optionsData, setOptionsData] = useState(initialValues);

  const form = useForm<TaxonomyFormValues>({
    resolver: zodResolver(taxonomyFormSchema),
    defaultValues: {
      organizationType: '',
      macroAreaCode: '',
      serviceTypeCode: '',
      collectionReason: '',
      taxonomyCode: ''
    }
  });

  const { watch, setValue, control } = form;

  const organizationType = watch('organizationType');
  const macroAreaCode = watch('macroAreaCode');
  const serviceTypeCode = watch('serviceTypeCode');

  /**
   * Updates the selection options for a specific taxonomy field, optionally resetting others.
   *
   * @template T - The type of the data fetched by the `fetchFn`.
   *
   * @param params - An object containing the parameters for updating the selection.
   * @param params.key - The key in the form values to update with new options.
   * @param params.resetKeys - Optional array of keys to reset (cleared and emptied).
   * @param params.fetchFn - An async function that fetches the data to populate options.
   * @param params.map - A function that maps each fetched item to an object with `label` and `value`.
   *
   * @returns A promise that resolves when the update is complete.
   */
  const updateSelection = async <T,>({
    key,
    resetKeys,
    fetchFn,
    map
  }: {
    key: keyof TaxonomyFormValues;
    resetKeys?: Array<keyof TaxonomyFormValues>;
    fetchFn: () => Promise<Array<T>>;
    map: (data: T) => { label: string; value: string };
  }) => {
    resetKeys?.forEach((key) => setValue(key, ''));
    setValue(key, '');
    const result = await fetchFn();
    const options = result.map(map);

    const toReset = resetKeys?.reduce<Record<string, Array<string>>>(
      (acc, key: string) => {
        acc[key] = [];
        return acc;
      },
      {}
    );

    setOptionsData((prevData) => ({
      ...prevData,
      ...toReset,
      [key]: options
    }));
  };

  const setOrganizations = async () => {
    await updateSelection({
      key: 'organizationType',
      fetchFn: organizationsMutation.mutateAsync,
      map: (org) => ({
        label: org.organizationTypeDescription,
        value: org.organizationType
      })
    });
  };

  const onOrganizationChange = async (organizationType: string) => {
    await updateSelection({
      key: 'macroAreaCode',
      resetKeys: ['serviceTypeCode', 'collectionReason', 'taxonomyCode'],
      fetchFn: () => macroAreaMutation.mutateAsync({ organizationType }),
      map: (areas) => ({
        label: areas.macroAreaName,
        value: areas.macroAreaCode
      })
    });
  };

  const onMacroAreaChange = async (macroAreaCode: string) => {
    await updateSelection({
      key: 'serviceTypeCode',
      resetKeys: ['collectionReason', 'taxonomyCode'],
      fetchFn: () =>
        serviceTypeMutation.mutateAsync({
          macroAreaCode,
          organizationType
        }),
      map: (service) => ({
        label: service.serviceTypeDescription,
        value: service.serviceTypeCode
      })
    });
  };

  const onServiceTypeChange = async (serviceTypeCode: string) => {
    await updateSelection({
      key: 'collectionReason',
      resetKeys: ['taxonomyCode'],
      fetchFn: () =>
        collectionReasonMutation.mutateAsync({
          serviceTypeCode,
          macroAreaCode,
          organizationType
        }),
      map: (reason) => ({
        label: reason.collectionReason,
        value: reason.collectionReason
      })
    });
  };

  const onCollectionReasonChange = async (collectionReason: string) => {
    await updateSelection({
      key: 'taxonomyCode',
      resetKeys: ['taxonomyCode'],
      fetchFn: () =>
        taxonomyCodeMutation.mutateAsync({
          collectionReason,
          serviceTypeCode,
          macroAreaCode,
          organizationType
        }),
      map: (code) => ({
        label: code.taxonomyCode,
        value: code.taxonomyCode
      })
    });
  };

  useEffect(() => {
    setOrganizations();
  }, []);

  const isVisible = !!organizationType;

  const renderTaxonomySelects = () => (
    <>
      <FormComponent.ControlledSelect
        control={control}
        label="Organization"
        name="organizationType"
        onChange={onOrganizationChange}
        options={optionsData}
      />

      <Stack
        visibility={isVisible ? 'visible' : 'hidden'}
        display={isVisible ? 'flex' : 'none'}
        gap={2}
      >
        <FormComponent.ControlledSelect
          control={control}
          label="Macro Area"
          name="macroAreaCode"
          onChange={onMacroAreaChange}
          options={optionsData}
        />

        <Stack direction="row" gap={2}>
          <FormComponent.ControlledSelect
            control={control}
            label="Service Type"
            name="serviceTypeCode"
            onChange={onServiceTypeChange}
            options={optionsData}
          />

          <FormComponent.ControlledSelect
            control={control}
            label="Collection Reason"
            name="collectionReason"
            onChange={onCollectionReasonChange}
            options={optionsData}
          />

          <FormComponent.ControlledSelect
            control={control}
            label="Taxonomy Code"
            name="taxonomyCode"
            options={optionsData}
          />
        </Stack>
      </Stack>
    </>
  );

  return {
    form,
    renderTaxonomySelects
  };
};
