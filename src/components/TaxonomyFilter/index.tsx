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
};

export const TaxonomyFilter = ({
  layout = 'default',
  render
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
  const { keys } = useFormDependencies({ form, fieldOrder });

  // values for conditional rendering and query params
  const organizationType = watch('orgType');
  const macroAreaCode = watch('macroAreaCode');
  const serviceTypeCode = watch('serviceTypeCode');
  const collectionReason = watch('collectingReason');

  // Prepare all selects as React nodes
  const fields: TaxonomyFilterRenderProps = {
    orgType: (
      <FormComponent.ControlledSelect
        required={false}
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
        required={false}
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
        required={false}
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
        required={false}
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
        required={false}
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
