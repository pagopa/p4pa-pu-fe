import React from 'react';
import Stack from '@mui/material/Stack';
import { useFormContext } from 'react-hook-form';
import { FormComponent } from '../FormComponent';
import {
  getOrganizationsTypes,
  getMacroAreas,
  getServiceTypes,
  getCollectionReasons,
  getTaxonomyCode
} from '../../api/taxonomy/taxonomy';
import { useTranslation } from 'react-i18next';
import { useFormDependencies } from '../../hooks/useFormDependecies'; // Adjust path

type TaxonomyFilterLayout = 'default' | 'singleRow';

type TaxonomyFilterRenderProps = {
  orgType: React.ReactNode;
  macroAreaCode: React.ReactNode;
  serviceTypeCode: React.ReactNode;
  collectingReason: React.ReactNode;
  taxonomyCode: React.ReactNode;
};

type TaxonomyFilterProps = {
  layout?: TaxonomyFilterLayout;
  render?: (fields: TaxonomyFilterRenderProps) => React.ReactNode;
  /**
   * Define if taxonomy fields are required
   * true = all fields are required (for debt type creation/edit)
   * false = all fields are optional (for taxonomy search)
   * @default false
   */
  requiredFields?: boolean;
  /**
   * Disable automatic field reset
   * true = do not reset fields when previous field changes (for creation form)
   * false = reset dependent fields (for search)
   * @default false
   */
  disableFieldReset?: boolean;
};

export const TaxonomyFilter = ({
  layout = 'default',
  render,
  requiredFields = false,
  disableFieldReset = false
}: TaxonomyFilterProps) => {
  const form = useFormContext();
  const { control, watch } = form;
  const { t } = useTranslation();

  // field order for dependency tracking
  const fieldOrder = [
    'orgType',
    'macroAreaCode',
    'serviceTypeCode',
    'collectingReason',
    'taxonomyCode'
  ];

  // resets fields after changes in previous fields
  // keys are used to reset mui select
  // Only use form dependencies if reset is not disabled
  const { keys } = disableFieldReset
    ? {
        keys: fieldOrder.reduce(
          (acc, field, index) => ({ ...acc, [field]: `${field}-${index}` }),
          {} as Record<string, string>
        )
      }
    : useFormDependencies({ form, fieldOrder });

  // values for conditional rendering and query params
  const organizationType = watch('orgType');
  const macroAreaCode = watch('macroAreaCode');
  const serviceTypeCode = watch('serviceTypeCode');
  const collectionReason = watch('collectingReason');

  // Prepare all selects as React nodes
  const fields: TaxonomyFilterRenderProps = {
    orgType: (
      <FormComponent.ControlledSelect
        required={requiredFields}
        key={keys.orgType}
        name="orgType"
        control={control}
        label={t('taxonomy.orgType.label')}
        data-testid="orgType"
        fetchFn={getOrganizationsTypes}
      />
    ),
    macroAreaCode: (
      <FormComponent.ControlledSelect
        required={requiredFields}
        key={keys.macroAreaCode}
        name="macroAreaCode"
        control={control}
        label={t('taxonomy.macroArea.label')}
        data-testid="macroAreaCode"
        fetchFn={() => getMacroAreas({ organizationType })}
        disabled={!organizationType}
      />
    ),
    serviceTypeCode: (
      <FormComponent.ControlledSelect
        required={requiredFields}
        key={keys.serviceTypeCode}
        name="serviceTypeCode"
        control={control}
        label={t('taxonomy.serviceType.label')}
        data-testid="serviceTypeCode"
        fetchFn={() => getServiceTypes({ organizationType, macroAreaCode })}
        disabled={!macroAreaCode}
      />
    ),
    collectingReason: (
      <FormComponent.ControlledSelect
        required={requiredFields}
        key={keys.collectingReason}
        name="collectingReason"
        control={control}
        label={t('taxonomy.collectingReason.label')}
        data-testid="collectingReason"
        fetchFn={() =>
          getCollectionReasons({
            organizationType,
            macroAreaCode,
            serviceTypeCode
          })
        }
        disabled={!serviceTypeCode}
      />
    ),
    taxonomyCode: (
      <FormComponent.ControlledSelect
        required={requiredFields}
        key={keys.taxonomyCode}
        name="taxonomyCode"
        control={control}
        label={t('taxonomy.taxonomyCode.label')}
        data-testid="taxonomyCode"
        fetchFn={() =>
          getTaxonomyCode({
            organizationType,
            macroAreaCode,
            serviceTypeCode,
            collectionReason
          })
        }
        disabled={!collectionReason}
      />
    )
  };

  // If render prop is provided, use it to render fields
  if (render) {
    return <>{render(fields)}</>;
  }

  if (layout === 'singleRow') {
    return (
      <>
        {fields.orgType}
        {fields.macroAreaCode}
        {fields.serviceTypeCode}
        {fields.collectingReason}
        {fields.taxonomyCode}
      </>
    );
  }

  // Otherwise use preset layouts
  return (
    <Stack gap={2} data-testid="taxonomy-filter-default">
      {fields.orgType}
      {fields.macroAreaCode}
      <Stack direction="row" gap={2}>
        {fields.serviceTypeCode}
        {fields.collectingReason}
      </Stack>
      {fields.taxonomyCode}
    </Stack>
  );
};
