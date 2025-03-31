import { UserMemo } from '../models/User';
import { useStore } from '../store/GlobalStore';
import { setUserInfo } from '../store/UserInfoStore';

export const useUserInfo = () => {
  const { state } = useStore();

  /* TODO service to obtain user data */
  const data = {
    email: 'marcopolo@ilmilione.it',
    name: 'Marco',
    familyName: 'Polo',
    userId: 'marcopolo'
  };
  const user: UserMemo = {
    name: data.name,
    familyName: data.familyName,
    userId: data.userId
  };
  setUserInfo(user);

  return { userInfo: state.userInfo };
};
