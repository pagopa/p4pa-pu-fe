import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import utils from '../../utils';
import { parseAndLog } from '../../utils/loaders';

// Schema for validating the array of strings for years, following the pattern of generated/zod-schema.ts
const operatingYearsSchema = z
  .array(
    z
      .string()
      .min(1, 'Operating year cannot be empty')
      .regex(/^\d{4}$/, 'Operating year must be a 4-digit year')
  )
  .min(1, 'At least one operating year must be provided');

/**
 * Hook for retrieving the list of available operating years
 *
 * @param options - Query options including enabled flag
 * @returns useQuery hook to execute the API call
 */
export const getOperatingYears = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: ['getOperatingYears'],
    queryFn: async () => {
      const { data: response } = await utils.apiClient.bff.getOperatingYears();

      // Validation of received data using the schema
      parseAndLog(operatingYearsSchema, response);

      return response;
    },
    enabled: options?.enabled ?? true // Default to true for backward compatibility
  });
