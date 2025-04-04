import { useEffect } from 'react';
import user from '../api/user';
import { useStore } from '../store/GlobalStore';
import { setLoading } from '../store/AppStateStore';
import { setUserInfo } from '../store/UserInfoStore';

export const useUserInfo = () => {
  const {
    state: { userInfo }
  } = useStore();

  const { data, isLoading, isError, isSuccess, error } = user.getUserInfo({
    enabled: !userInfo
  });

  useEffect(() => {
    if (!userInfo) {
      setLoading(isLoading);

      if (isSuccess && data) {
        setUserInfo(data);
      }

      if (isError) {
        // TODO: Handle error (e.g., show a toast)
        console.error('Failed to fetch user info', error);
      }
    }
  }, [data, isLoading, isError, isSuccess]);

  return userInfo;
};
