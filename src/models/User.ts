/* TO-DO import generated schema */
export interface UserInfo {
    userId: string;
    fiscalCode: string;
    familyName?: string;
    name?: string;
    email?: string;
  }
  
export type UserMemo = Omit<UserInfo, 'email' | 'fiscalCode'>;