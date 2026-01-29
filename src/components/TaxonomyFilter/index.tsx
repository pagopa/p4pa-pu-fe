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
} from '../../api/taxonomy';
import { useTranslation } from 'react-i18next';
import { useFormDependencies } from '../../hooks/useFormDependecies';

type TaxonomyFilterLayout = 'default' | 'singleRow';

type TaxonomyFilterRenderProps = {
  orgType: React.ReactNode;
  macroArea: React.ReactNode;
  serviceType: React.ReactNode;
  collectingReason: React.ReactNode;
  taxonomyCode: React.ReactNode;
};

/**
 * Field names configuration for the TaxonomyFilter.
 * Allows customization for different use cases:
 * - Creation mode: uses names matching DebtPositionTypeRequestBody (macroArea, serviceType)
 * - Search mode: uses names matching API query params (macroAreaCode, serviceTypeCode)
 */
type TaxonomyFieldNames = {
  orgType: string;
  macroArea: string;
  serviceType: string;
  collectingReason: string;
  taxonomyCode: string;
};

const DEFAULT_FIELD_NAMES: TaxonomyFieldNames = {
  orgType: 'orgType',
  macroArea: 'macroArea',
  serviceType: 'serviceType',
  collectingReason: 'collectingReason',
  taxonomyCode: 'taxonomyCode'
};

/**
 * Field names for search/filter mode (legacy naming convention)
 */
export const SEARCH_FIELD_NAMES: TaxonomyFieldNames = {
  orgType: 'orgType',
  macroArea: 'macroAreaCode',
  serviceType: 'serviceTypeCode',
  collectingReason: 'collectingReason',
  taxonomyCode: 'taxonomyCode'
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
  /**
   * Custom field names for form fields.
   * Use DEFAULT_FIELD_NAMES for creation (matches DebtPositionTypeRequestBody)
   * Use SEARCH_FIELD_NAMES for search (matches API query params)
   * @default DEFAULT_FIELD_NAMES
   */
  fieldNames?: TaxonomyFieldNames;
};

export const TaxonomyFilter = ({
  layout = 'default',
  render,
  requiredFields = false,
  disableFieldReset = false,
  fieldNames = DEFAULT_FIELD_NAMES
}: TaxonomyFilterProps) => {
  const form = useFormContext();
  const { control, watch } = form;
  const { t } = useTranslation();

  // Field order for dependency tracking using configured field names
  const fieldOrder = [
    fieldNames.orgType,
    fieldNames.macroArea,
    fieldNames.serviceType,
    fieldNames.collectingReason,
    fieldNames.taxonomyCode
  ];

  // Resets fields after changes in previous fields
  const { keys } = useFormDependencies({
    form,
    fieldOrder,
    disabled: disableFieldReset
  });

  // Values for conditional rendering and query params
  const organizationType = watch(fieldNames.orgType);
  const macroArea = watch(fieldNames.macroArea);
  // serviceType field contains the serviceTypeCode (e.g., "100")
  const serviceTypeCode = watch(fieldNames.serviceType);
  const collectingReason = watch(fieldNames.collectingReason);

  // Prepare all selects as React nodes
  const fields: TaxonomyFilterRenderProps = {
    orgType: (
      <FormComponent.ControlledSelect
        required={requiredFields}
        key={keys[fieldNames.orgType]}
        name={fieldNames.orgType}
        control={control}
        label={t('taxonomy.orgType.label')}
        data-testid="orgType"
        fetchFn={getOrganizationsTypes}
      />
    ),
    macroArea: (
      <FormComponent.ControlledSelect
        required={requiredFields}
        key={keys[fieldNames.macroArea]}
        name={fieldNames.macroArea}
        control={control}
        label={t('taxonomy.macroArea.label')}
        data-testid="macroArea"
        fetchFn={() => getMacroAreas({ organizationType })}
        disabled={!organizationType}
      />
    ),
    serviceType: (
      <FormComponent.ControlledSelect
        required={requiredFields}
        key={keys[fieldNames.serviceType]}
        name={fieldNames.serviceType}
        control={control}
        label={t('taxonomy.serviceType.label')}
        data-testid="serviceType"
        fetchFn={() =>
          getServiceTypes({ organizationType, macroAreaCode: macroArea })
        }
        disabled={!macroArea}
      />
    ),
    collectingReason: (
      <FormComponent.ControlledSelect
        required={requiredFields}
        key={keys[fieldNames.collectingReason]}
        name={fieldNames.collectingReason}
        control={control}
        label={t('taxonomy.collectingReason.label')}
        data-testid="collectingReason"
        fetchFn={() =>
          getCollectionReasons({
            organizationType,
            macroAreaCode: macroArea,
            serviceTypeCode
          })
        }
        disabled={!serviceTypeCode}
      />
    ),
    taxonomyCode: (
      <FormComponent.ControlledSelect
        required={requiredFields}
        key={keys[fieldNames.taxonomyCode]}
        name={fieldNames.taxonomyCode}
        control={control}
        label={t('taxonomy.taxonomyCode.label')}
        data-testid="taxonomyCode"
        fetchFn={() =>
          getTaxonomyCode({
            organizationType,
            macroAreaCode: macroArea,
            serviceTypeCode,
            collectionReason: collectingReason
          })
        }
        disabled={!collectingReason}
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
        {fields.macroArea}
        {fields.serviceType}
        {fields.collectingReason}
        {fields.taxonomyCode}
      </>
    );
  }

  // Otherwise use preset layouts
  return (
    <Stack gap={2} data-testid="taxonomy-filter-default">
      {fields.orgType}
      {fields.macroArea}
      <Stack direction="row" gap={2}>
        {fields.serviceType}
        {fields.collectingReason}
      </Stack>
      {fields.taxonomyCode}
    </Stack>
  );
};
