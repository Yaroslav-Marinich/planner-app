import axios from 'axios';
import { auth } from '../config/firebase';

export const apiClient = axios.create({
  baseURL: 'http://192.168.31.25:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  } catch (error) {
    return Promise.reject(error);
  }
});