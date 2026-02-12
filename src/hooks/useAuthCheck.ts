import { useEffect } from 'react';
import axios from 'axios';
import { useAppDispatch } from '../store/hooks';
import { login } from '../store/slices/authSlice';

export function useAuthCheck() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    axios.get('/api/auth/me').then((response) => {
      if (response.data.authenticated) {
        dispatch(login(response.data.username));
      }
    }).catch(() => {
      // 세션 없음
    });
  }, [dispatch]);
}
