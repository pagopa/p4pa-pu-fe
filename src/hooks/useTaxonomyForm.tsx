import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useRef } from 'react';
import {
  getCollectionReasons,
  getMacroAreas,
  getOrganizationsTypes,
  getServiceTypes,
  getTaxonomyCode
} from '../api/taxonomy';
import Stack from '@mui/material/Stack';
import { FormComponent } from '../components/FormComponent';

export const taxonomyFormSchema = z.object({
  organizationType: z.string(),
  macroAreaCode: z.string(),
  serviceTypeCode: z.string(),
  collectionReason: z.string(),
  taxonomyCode: z.string()
});
export type TaxonomyFormValues = z.infer<typeof taxonomyFormSchema>;

export const useTaxonomyForm = () => {
  const fieldOrder: Array<keyof TaxonomyFormValues> = [
    'organizationType',
    'macroAreaCode',
    'serviceTypeCode',
    'collectionReason',
    'taxonomyCode'
  ];

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

  const { control, resetField } = form;

  // watch *all* fields in the order we care about
  const values = useWatch({ control, name: fieldOrder });
  const [organizationType, macroAreaCode, serviceTypeCode, collectionReason] =
    values;

  // keep a ref to the *previous* values array
  const prevValuesRef = useRef<typeof values>(values);

  useEffect(() => {
    const prev = prevValuesRef.current;
    const curr = values;

    // find the first index where the value changed
    const changedIndex = curr.findIndex((v, i) => v !== prev[i]);

    if (changedIndex >= 0) {
      // reset everything after the changed field
      fieldOrder
        .slice(changedIndex + 1)
        .forEach((fieldName) => resetField(fieldName));
    }

    prevValuesRef.current = curr;
  }, [values, resetField, fieldOrder]);

  const isVisible = !!organizationType;

  const renderTaxonomySelects = () => (
    <>
      <FormComponent.ControlledSelect
        control={control}
        label="Organization"
        name="organizationType"
        fetchFn={getOrganizationsTypes}
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
          fetchFn={() => getMacroAreas(organizationType)}
        />

        <Stack direction="row" gap={2}>
          <FormComponent.ControlledSelect
            control={control}
            label="Service Type"
            name="serviceTypeCode"
            fetchFn={() => getServiceTypes({ organizationType, macroAreaCode })}
          />

          <FormComponent.ControlledSelect
            control={control}
            label="Collection Reason"
            name="collectionReason"
            fetchFn={() =>
              getCollectionReasons({
                organizationType,
                macroAreaCode,
                serviceTypeCode
              })
            }
          />

          <FormComponent.ControlledSelect
            control={control}
            label="Taxonomy Code"
            name="taxonomyCode"
            fetchFn={() =>
              getTaxonomyCode({
                organizationType,
                macroAreaCode,
                serviceTypeCode,
                collectionReason
              })
            }
          />
        </Stack>
      </Stack>
    </>
  );

  return { form, renderTaxonomySelects };
};
