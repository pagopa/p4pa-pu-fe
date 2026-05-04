import { signal } from '@preact/signals-react';
import { jwtDecode } from 'jwt-decode';
import { IdTokenPayload } from '../models/IdTokenPayload';

export const idTokenPayloadState = signal<IdTokenPayload | undefined>(
  undefined
);

export function setIdToken(token: string) {
  if (!token) return;

  try {
    const decoded = jwtDecode<IdTokenPayload>(token);

    if (decoded?.organization?.fiscal_code && decoded?.organization?.ipaCode) {
      const payload: IdTokenPayload = {
        organization: {
          fiscal_code: decoded.organization.fiscal_code,
          ipaCode: decoded.organization.ipaCode
        }
      };

      idTokenPayloadState.value = payload;
    }
  } catch (error) {
    console.error('Failed to decode ID token:', error);
  }
}
