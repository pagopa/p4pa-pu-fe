// import { FieldValues } from 'react-hook-form';
// import { Grid } from '@mui/material';
// import { BeneficiaryFieldsProps } from '../../../../models/BeneficiaryFieldTypes';
// import {
//   BeneficiaryIdentityFields,
//   BeneficiaryAmountFields,
//   BeneficiaryPaymentFields,
//   BeneficiaryClassificationFields
// } from './BeneficiaryFieldControls';

// /**
//  * Componente principale per raggruppare tutti i campi del beneficiario
//  */
// export function BeneficiaryFieldGroup<T extends FieldValues>(
//   props: Readonly<BeneficiaryFieldsProps<T>>
// ) {
//   const {
//     control,
//     index,
//     fieldNamePrefix,
//     validationContext,
//     disabled,
//     getValues,
//     trigger,
//     errors,
//     validators,
//     fieldValidators,
//     fields,
//     t
//   } = props;

//   return (
//     <Grid container spacing={2}>
//       <BeneficiaryIdentityFields
//         control={control}
//         index={index}
//         fieldNamePrefix={fieldNamePrefix}
//         validationContext={validationContext}
//         disabled={disabled}
//         t={t}
//       />

//       <BeneficiaryAmountFields
//         control={control}
//         index={index}
//         fieldNamePrefix={fieldNamePrefix}
//         validationContext={validationContext}
//         disabled={disabled}
//         fields={fields}
//         validators={validators}
//         trigger={trigger}
//         t={t}
//       />

//       <BeneficiaryPaymentFields
//         control={control}
//         index={index}
//         fieldNamePrefix={fieldNamePrefix}
//         validationContext={validationContext}
//         disabled={disabled}
//         getValues={getValues}
//         trigger={trigger}
//         errors={errors}
//         fieldValidators={fieldValidators}
//         t={t}
//       />

//       <BeneficiaryClassificationFields
//         control={control}
//         index={index}
//         fieldNamePrefix={fieldNamePrefix}
//         validationContext={validationContext}
//         disabled={disabled}
//         t={t}
//       />
//     </Grid>
//   );
// }
