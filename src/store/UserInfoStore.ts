import { signal } from '@preact/signals-react';
import { UserInfoDTO } from '../../generated/data-contracts';

// Initialize the persistent store
export const userInfoState = signal<UserInfoDTO | undefined>();

// Function to update the user info
export function setUserInfo(user: UserInfoDTO | undefined) {
  userInfoState.value = user;
}
