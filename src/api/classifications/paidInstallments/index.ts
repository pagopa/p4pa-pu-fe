import { useMutation } from '@tanstack/react-query';
import utils from '../../../utils';
import { buildQueryParams, PaidInstallmentsFilteredRequest } from './mappings';

/**
 * Hook per recuperare i paid installments di un'organizzazione
 *
 * Utilizza l'endpoint API reale /bff/organization/{organizationId}/classifications/paid-installments
 * seguendo il pattern standard delle altre API del progetto.
 *
 * Requisiti API:
 * - debtPositionTypeOrgCode: codice tipo posizione debitoria (obbligatorio)
 * - assessmentId: ID dell'assessment (obbligatorio)
 * - Supporta filtri opzionali per IUV, date range, ecc.
 * - Gestione paginazione e ordinamento
 *
 * @param organizationId - ID dell'organizzazione
 * @returns useMutation hook per eseguire la chiamata API
 *
 * @example
 * ```tsx
 * const paidInstallmentsQuery = getPaidInstallments({ organizationId: 123 });
 *
 * // Eseguire la chiamata con parametri
 * const result = await paidInstallmentsQuery.mutateAsync({
 *   debtPositionTypeOrgCode: 'DEPT_001',
 *   assessmentId: 456,
 *   pagination: { page: 0, size: 10 },
 *   sort: ['paymentDateTime:desc']
 * });
 * ```
 */
export const getPaidInstallments = ({
  organizationId
}: {
  organizationId: number;
}) =>
  useMutation({
    mutationKey: ['getPaidInstallments', organizationId],
    mutationFn: async (args: PaidInstallmentsFilteredRequest) => {
      // Costruisce i parametri query per la chiamata API
      const query = buildQueryParams(args);

      // Chiamata all'API reale utilizzando il client generato
      const { data } = await utils.apiClient.bff.getPaidInstallments(
        organizationId,
        query,
        {
          // Serializza correttamente gli array nei parametri query
          paramsSerializer: {
            indexes: null
          }
        }
      );

      return data;
    }
  });
