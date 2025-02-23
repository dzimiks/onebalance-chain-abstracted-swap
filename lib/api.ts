import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api/onebalance',
  headers: {
    'Content-Type': 'application/json',
  },
});
